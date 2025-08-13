const axios = require("axios");
const dbSeq = require("../config/sequelize");
const { QueryTypes } = require("sequelize");
const utils = require("../lib/utils");

const Redis = require('ioredis');
const rateLimit = require('express-rate-limit');

let redis = createRedis();

function createRedis() {
  let retryCount = 0;
  const client = new Redis(process.env.REDIS_URL, {
    enableOfflineQueue: false,
    reconnectOnError: (err) => {
      console.warn("⚠️ Redis reconnectOnError:", err.message);
      return true;
    },
    retryStrategy(times) {
      retryCount++;
      if (retryCount > 10) {
        console.error("❌ Redis gagal connect lebih dari 10 kali. Mematikan koneksi...");
        client.disconnect();
        redis = null;
        return null;
      }
      const delay = Math.min(times * 200, 2000);
      console.log(`🔄 Redis reconnecting in ${delay}ms... (percobaan ${retryCount})`);
      return delay;
    },
  });

  client.on('connect', () => {
    console.log('✅ Redis connected');
  });

  client.on('error', (err) => {
    console.warn('⚠️ Redis error (ignored):', err.message);
  });

  client.on('end', () => {
    console.warn('⚠️ Redis connection closed');
  });

  return client;
}

function getRedis() {
  if (!redis || redis.status === "end") {
    console.log("♻️ Membuat koneksi Redis baru...");
    redis = createRedis();
  }
  return redis;
}

module.exports = {
  search: async (body, req, res) => {
    const { text } = body;
    console.log("text ai:", text);

    try {
      // === 1. Kirim ke LLM
      const prompt = `
        Pertanyaan user:
        "${text}"

        Tolong ekstrak keyword pencarian dari pertanyaan user di atas ke dalam format JSON.

        - Hanya sertakan field yang BENAR-BENAR disebut secara eksplisit.
        - Abaikan field seperti "province", "address", atau "title" jika tidak disebut.
        - Jangan mengarang. Jangan isi nilai default atau berdasarkan asumsi.
        - Balas hanya JSON valid tanpa penjelasan.
        `;

        const aiRes = await axios.post("http://localhost:11434/api/generate", {
          model: "mistral",
          prompt,
          stream: false
        });
    
        const raw = aiRes.data.response;

        console.log("=== Output LLM ===");
        console.log(raw); 
        const match = raw.match(/{[\s\S]*?}/);
    
        if (!match) {
          throw new Error("Gagal ekstrak data dari pertanyaan");
        }
    
        const extracted = JSON.parse(match[0]);
        console.log("extracted:", extracted);
        const allowedFields = ["id", "city", "province", "address", "title"];
        const conditions = [];
        const replacements = {};

        // Daftar nilai template yang harus diabaikan
        const templateDefaults = [
          "provinsi",
          "alamat",
          "judul",
          "title",
          "kota",
          "city",
          "partner",
          "provinsi dengan kode", // match awalan template
          "alamat kota",
          "nama kota"
        ];

        // === Jika city dalam bentuk teks (bukan angka), cari ID-nya di tabel `city`
        if (
          extracted.city &&
          isNaN(extracted.city) &&
          extracted.city.toString().trim() !== ""
        ) {
          try {
            const cityData = await dbSeq.query(
              `SELECT id FROM city WHERE LOWER(name) ilike '%' || LOWER(:name) || '%'`,
              {
                replacements: { name: extracted.city.trim() },
                type: QueryTypes.SELECT
              }
            );
            // console.log("cityData:", cityData);

            if (cityData && cityData.length > 0) {
              extracted.city = cityData.map(c => c.id.toString()); // update ke ID
            } else {
              console.warn("⚠️ Nama kota tidak ditemukan di tabel `city`.");
              delete extracted.city; // hapus supaya tidak ikut query
            }
          } catch (err) {
            console.error("❌ Gagal mencari ID kota:", err.message);
            delete extracted.city;
          }
        }
        // console.log("extracted city id:", extracted);

        for (const key in extracted) {
          const val = extracted[key];

          if (
            allowedFields.includes(key) &&
            val &&
            val.toString().trim() !== "" &&
            !templateDefaults.some(t => val.toString().toLowerCase().includes(t)) // skip template
          ) {
            if (Array.isArray(val)) {
              conditions.push(`${key} IN (:${key})`);
            } else {
              conditions.push(`TRIM(LOWER(${key})) = LOWER(:${key})`);
            }
            replacements[key] = val;
          }
        }
        console.log("extracted final:", conditions);
    
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        if (whereClause === "") {
          return {
            success: false,
            data: [],
            message: "Data tidak ditemukan. Silahkan cari yang lain."
          };
        }
        
        const query = `SELECT id, name, province, city, address, title FROM hai_user ${whereClause} LIMIT 100`;
    
        const results = await dbSeq.query(query, {
          replacements,
          type: QueryTypes.SELECT
        });

        if (results.length === 0) {
          return {
            success: false,
            data: [],
            message: "Data tidak ditemukan.",
          };
        }
    
        // Format data menjadi teks
        const dataText = results
          .map((r, i) => `${i + 1}. id: ${r.id}, Nama: ${r.name}, Kota: ${r.city}, Title: ${r.title}`)
          .join("\n");
        console.log("Data ditemukan:");
        // console.log(dataText);

        // === STEP 6: Kirim ke AI untuk menjawab pertanyaan user
        const promptAnswer = `
          User bertanya:
          "${text}"
          
          Berikut data yang ditemukan dari sistem kami:
          ${dataText}
          
          Berdasarkan data di atas, jawab pertanyaan dalam bahasa yang digunakan oleh pengguna dengan bahasa yang bersahabat, natural dan mudah dimengerti serta membuat yang baca menjadi tertarik dan berikan informasi secara detail. Jika perlu, tampilkan siapa saja yang sesuai.
          Jangan lupa katakan silahkan hubungi mereka jika sesuai kebutuhan Anda atau sejenisnya.
          Jangan tampilkan kode kota seperti angka 1xx, 2xx, dst.
          Dan tambahkan link url ke halaman partner tersebut di masing-masing nama dengan format link: https://haibersama.com/refer/?link=id
          `;
  
        const aiAnswer = await axios.post("http://localhost:11434/api/generate", {
          model: "deepseek-r1",
          prompt: promptAnswer,
          stream: false,
        });
  
        const finalResponse = aiAnswer.data.response;
        console.log("finalResponse");
        console.log(finalResponse);
  
        return {
          success: true,
          data: results,
          message: "Pencarian berhasil",
          aiMessage: finalResponse.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
        };

    } catch (err) {
      console.error("🔥 ERROR:", err.message);
      return {
        status: 500,
        message: "Terjadi kesalahan",
        error: err.message
      };
    }
  },

  searchApiPartner: async (body, req, res) => {
    const { text } = body;
    const cacheKey = `search:text:${text.trim().toLowerCase()}`;
    console.log("Pertanyaan user:", text);
    const bypassCache = req.query.cache === 'true';
    console.log("Bypass cache:", bypassCache);

    const redisClient = getRedis(); 

    let cached;
    try {
      cached = await redisClient.get(cacheKey);
    } catch (e) {
      console.warn("⚠️ Redis GET failed (lewati cache):", e.message);
    }

    // === Cek Cache Redis ===
    if (!bypassCache && cached) {
      console.log('📦 Cache hit');
      return JSON.parse(cached);
    }

    try {
      // === 1. Kirim prompt ekstraksi ke Groq ===
      const extractPrompt = `
        User question:
        "${text}"

        Please extract any explicitly mentioned fields from the user question above into a valid JSON object.

        - Only include fields that are clearly and explicitly mentioned (do NOT assume or guess).
        - Use only the following allowed fields: "id", "city", "province", "address", "title".
        - Ignore any mention of unrelated terms like "partner", unless it's part of the official data fields.
        - If no valid field is mentioned, return an **empty JSON object**: {}
      `;

      const aiExtract = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'You are a strict JSON extractor assistant. Only reply with a valid JSON object, without any extra explanation.' },
          { role: 'user', content: extractPrompt },
        ],
        temperature: 0.3,
        max_tokens: 300,
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000, // 10 detik
        validateStatus: status => status < 500, // agar error 4xx tetap ditangani
      });

      const raw = aiExtract.data.choices[0].message.content;
      console.log("=== Output LLM ===");
      console.log(raw); 
      const match = raw.match(/{[\s\S]*?}/);

      if (!match || !match[0]) {
        return {
          success: false,
          data: [],
          message: "Gagal memahami maksud pertanyaan. Coba ketik dengan lebih spesifik."
        };
      }
      
      const extracted = JSON.parse(match[0]);
      const allowedFields = ["id", "city", "province", "address", "title"];
      const templateDefaults = [
        "provinsi", "alamat", "judul", "title", "kota", "city", "partner",
        "provinsi dengan kode", "alamat kota", "nama kota"
      ];

      const conditions = [];
      const replacements = {};

      // === Cek ID kota ===
      if (extracted.city && isNaN(extracted.city)) {
        const cityData = await dbSeq.query(
          `SELECT id FROM city WHERE LOWER(name) ILIKE '%' || LOWER(:name) || '%'`,
          {
            replacements: { name: extracted.city.trim() },
            type: QueryTypes.SELECT
          }
        );
        console.log("cityData:", cityData);
        if (cityData.length > 0) {
          extracted.city = cityData.map(c => c.id.toString());
        } else {
          delete extracted.city;
        }
      }

      for (const key in extracted) {
        const val = extracted[key];
        if (allowedFields.includes(key) && val && val.toString().trim() !== "" &&
            !templateDefaults.some(t => val.toString().toLowerCase().includes(t))) {
          if (Array.isArray(val)) {
            conditions.push(`${key} IN (:${key})`);
          } else {
            conditions.push(`TRIM(LOWER(${key})) = LOWER(:${key})`);
          }
          replacements[key] = val;
        }
      }

      const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
      if (!whereClause) {
        return { success: false, data: [], message: "Data tidak ditemukan. Silakan cari yang lain." };
      }

      const query = `SELECT id, name, province, city, address, title FROM hai_user ${whereClause} LIMIT 100`;
      const results = await dbSeq.query(query, { replacements, type: QueryTypes.SELECT });

      if (!results.length) {
        const noResult = { success: false, data: [], message: "Data tidak ditemukan." };
        await redisClient.setex(cacheKey, 60, JSON.stringify(noResult));
        return noResult;
      }

      const dataText = results.map((r, i) => `${i + 1}. id: ${r.id}, Nama: ${r.name}, Kota: ${r.city}, Title: ${r.title}`).join("\n");
      const tooMany = results.length >= 100;
      const note = tooMany ? "⚠️ Catatan: Hasil dibatasi hanya 100 partner pertama yang ditemukan. Silakan perjelas pencarian jika ingin hasil lebih spesifik." : "";


      // === 2. Kirim ke Groq untuk jawab ===
      const answerPrompt = `
        User bertanya:
        "${text}"

        ${note}

        Berikut data yang ditemukan dari sistem kami:
        ${dataText}

        -Jawab pertanyaan dalam bahasa yang digunakan oleh pengguna dengan bahasa yang bersahabat, natural, dan membuat yang baca tertarik.
        -Tampilkan siapa saja yang sesuai.
        -Tambahkan link url jika di sebut kata atau teks link atau url untuk ke halaman partner. Contoh url atau link: https://haibersama.com/refer/?link=id.
      `;

      const aiAnswer = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'Kamu adalah asisten yang menjawab dengan sopan dan menarik berdasarkan data yang ditemukan.' },
          { role: 'user', content: answerPrompt },
        ],
        temperature: 0.7,
        max_tokens: 700,
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000, // 10 detik
        validateStatus: status => status < 500, // agar error 4xx tetap ditangani
      });

      const finalResponse = aiAnswer.data.choices[0].message.content;

      const response = {
        success: true,
        data: results,
        message: "Pencarian berhasil",
        aiMessage: finalResponse.trim()
      };

      // === Simpan ke Redis (20 menit) ===
      try {
        await redisClient.setex(cacheKey, 1200, JSON.stringify(response));
      } catch (e) {
        console.warn("⚠️ Redis SETEX gagal (skip simpan cache):", e.message);
      }

      return response;

    } catch (err) {
      console.error("🔥 ERROR:", err.message);
      return {
        status: 500,
        message: "Terjadi kesalahan",
        error: err.message
      };
    }
  },

  searchApi: async (body, req, res) => {
    const { text } = body;
    const cacheKey = `search:text:${text.trim().toLowerCase()}`;
    console.log("Pertanyaan user:", text);
    const bypassCache = req.query.cache === 'true';
    console.log("Bypass cache:", bypassCache);

    const redisClient = getRedis(); 

    // === Cek Cache Redis ===
    try {
      const cached = await redisClient.get(cacheKey);
      if (bypassCache && cached) {
        console.log('📦 Cache hit');
        return JSON.parse(cached);
      }
    } catch (e) {
      console.warn("⚠️ Redis GET failed (lewati cache):", e.message);
    }

    try {
      // 1. Ambil semua struktur tabel & kolom dari DB
      const tablesRaw = await dbSeq.query(`
        SELECT table_name, column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
      `, { type: QueryTypes.SELECT });
  
      const schema = {};
      for (const row of tablesRaw) {
        if (!schema[row.table_name]) schema[row.table_name] = [];
        schema[row.table_name].push(row.column_name);
      }
  
      const tableList = Object.keys(schema).map(t => `- ${t}: ${schema[t].join(", ")}`).join("\n");

      // 3. Kirim pertanyaan user dan struktur DB ke LLM untuk ekstraksi
      const extractPrompt = `
        User question:
        "${text}"
        
        Berikut struktur database kami:
        ${tableList}
        
        Tugasmu:
        - Ekstrak nama tabel yang paling relevan dari pertanyaan user.
        - Ekstrak filter (field + value) jika ada.
        - Jangan menebak field atau tabel yang tidak ada dalam struktur database.

        ‼️ Gunakan aturan khusus ini:
        - Jika pertanyaan menyebut kata "partner" (termasuk "cari partner" "temukan partner" "partner dari kota", "partner dari provinsi", dll), **SELALU gunakan tabel "hai_user"**.
        - Abaikan tabel lain seperti "partner", "partner_follower", "partner_experience", "partner_certificate", dll, walaupun mereka tampak cocok — gunakan **hanya "hai_user"** untuk pencarian partner.
        - Jika pertanyaan menanyakan tentang kota, gunakan dan masukan ke dalam filters **"city"**.
        - Jika pertanyaan menanyakan tentang provinsi, profinsi, gunakan dan masukan ke dalam filters **"province"**.
        - Jika pertanyaan menanyakan tentang "paket termurah", "paket harga", atau "paket promo", gunakan tabel **"packages"** dan urutkan berdasarkan **"totalprice ASC"**.

        Hanya balas dengan JSON **valid**, seperti ini:

        {
          "table": "hai_user",
          "filters": {
            "city": "Jakarta"
          }
        }

        Example output:
          {
            "table": "hai_user",
            "filters": {
              "city": "Bogor"
            }
          }
        `;

      const extractRes = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        // Use localhost with ollama
        // model: 'llama3',
        // prompt: extractPrompt,
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'Kamu adalah asisten ekstraktor JSON yang ketat. Hanya balas dengan objek JSON yang valid, tanpa penjelasan tambahan apa pun.' },
          { role: 'user', content: extractPrompt },
        ],
        temperature: 0.3,
        max_tokens: 300,
        stream: false
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 20000, // 20 detik
        validateStatus: status => status < 500, // agar error 4xx tetap ditangani
      });

      const raw = extractRes.data.choices[0].message.content;
      console.log("=== Output LLM ===");
      console.log(raw);
      
      // Ambil blok JSON pertama dari string
      const extracted = await utils.extractValidJson(raw);
      if (!extracted) {
        return {
          success: false,
          message: "Maaf saya belum bisa menjawabnya. Ilmu saya masih terbatas. Silakan cari pertanyaan lain."
        };
      }

      // Setelah JSON berhasil di-parse, ambil isinya
      const { table, filters } = extracted;
      console.log("extracted table:", table);
      console.log("extracted filters:", filters);
      
      // === Cek ID kota ===
      if (filters.city && isNaN(filters.city)) {
        const cityName = filters.city.trim();
        const cityData = await dbSeq.query(
          `SELECT id FROM city WHERE LOWER(name) ILIKE '%' || LOWER(:name) || '%'`,
          {
            replacements: { name: cityName },
            type: QueryTypes.SELECT
          }
        );
        // console.log("cityData:", cityData);
        if (cityData.length > 0) {
          filters.city = cityData.map(c => c.id.toString());
        } else {
          return {
            success: false,
            message: `Kota "${filters.city}" tidak ditemukan.`,
            aiMessage: `Kota "${filters.city}" tidak ditemukan.`
          };
        }
      }
      
      // 1. Mapping kolom yang ingin ditampilkan untuk setiap tabel
      const defaultSelectFields = {
        hai_user: ["id", "name", "province", "city", "address", "title"],
        partner_package_detail: ["id", "reservation_no", "price", "description", "duration", "terms"],
        partner_package_header: ["id", "name", "totalprice", "description", "duration"],
        // tambahkan tabel lain jika diperlukan
      };

      // 2. Validasi tabel & field
      if (!table || !schema[table]) {
        return {
          success: false,
          message: "Maaf saya belum bisa menjawabnya. Ilmu saya masih terbatas. Silakan cari pertanyaan lain."
        };
      }

      // 2.a Validasi filters table yang di izinkan
      if (!['hai_user', 'partner_package_detail', 'partner_package_header'].includes(table)) {
        return {
          success: false,
          message: "Permintaan ke tabel tidak dikenali atau tidak diizinkan."
        };
      }

      // 3. Susun WHERE clause dan replacements
      const replacements = {};
      const conditions = [];

      for (const key in filters) {
        if (schema[table].includes(key)) {
          if (Array.isArray(filters[key])) {
            // Banyak ID, pakai IN
            conditions.push(`${key} IN (:${key})`);
            replacements[key] = filters[key];
          } else {
            // Satu nilai saja
            conditions.push(`${key} = :${key}`);
            replacements[key] = filters[key];
          }
        }
      }

      const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

      // 4. Pilih kolom SELECT
      const fields = defaultSelectFields[table] || ["*"];
      const selectClause = `SELECT ${fields.join(", ")} FROM ${table} ${whereClause} LIMIT 100`;

      console.log("Final Query:", selectClause);
      // console.log("Replacements:", replacements);

      // 5. Eksekusi
      const results = await dbSeq.query(selectClause, {
        replacements,
        type: QueryTypes.SELECT,
      });

      // 6. Handle hasil
      if (!results.length) {
        return {
          success: false,
          message: "Maaf saya belum bisa menjawabnya. Ilmu saya masih terbatas. Silakan cari pertanyaan lain.",
          data: [],
          aiMessage: "Maaf saya belum bisa menjawabnya. Ilmu saya masih terbatas. Silakan cari pertanyaan lain."
        };
      }
      const fieldsToShow = ['id', 'name', 'title', 'address', 'city', 'province'];
      const dataPreview = results.map((r, i) => {
        const filtered = Object.entries(r)
          .filter(([k]) => fieldsToShow.includes(k))
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");
        return `${i + 1}. ${filtered}`;
      }).join("\n");
      console.log("Data ditemukan:");
      // console.log(dataPreview);

      const tooMany = results.length > 100;
      const note = tooMany ? "⚠️ Catatan: Hasil dibatasi hanya 100 partner pertama yang ditemukan. Silakan perjelas pencarian jika ingin hasil lebih spesifik." : "";

      const answerPrompt = `
        User bertanya:
        "${text}"

        ${note}

        📌 Petunjuk:
        - Deteksi bahasa pertanyaan user. Jika menggunakan bahasa Indonesia, jawab juga dalam bahasa Indonesia. Jika menggunakan bahasa Inggris, jawab dalam bahasa Inggris.
        - Gaya bahasa harus ramah, natural, menarik, dan mudah dimengerti.
        - Tampilkan semua data yang ditemukan, meskipun tidak lengkap (misalnya kota hanya disebut 'Jakarta' padahal ada Jakarta Pusat, Barat, dll).
        - Jangan tampilkan kode kota atau provinsi seperti angka 1xx.
        - Ubah kode kota dan provinsi menjadi nama kotanya.

        Berikut data partner yang ditemukan:
        ${dataPreview}

        ‼️ Gunakan aturan ini:
        - Tampilkan semua partner yang ditemukan.
        - Jangan buang partner hanya karena ada ambiguitas kota.
        - Tambahkan penutup seperti: "Silakan hubungi mereka jika sesuai dengan kebutuhan Anda."
        - Gunakan bahasa Indonesia yang ramah dan tidak kaku.
        - Jangan gunakan istilah seperti "menyingkirkan", cukup katakan semuanya berasal dari kota Jakarta (jika provinsi dan kota menunjukkan wilayah Jakarta).
        - Jangan bedakan partner hanya karena kode kota berbeda, selama kota mereka masih bagian dari Jakarta.
        `;

      const answerRes = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        // Use localhost with ollama
        // model: 'llama3',
        // prompt: extractPrompt,
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'Kamu adalah asisten yang menjelaskan hasil pencarian data dengan gaya menarik.' },
          { role: 'user', content: answerPrompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
        stream: false
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 20000, // 20 detik
        validateStatus: status => status < 500, // agar error 4xx tetap ditangani
      });

      const finalAnswer = answerRes.data.choices[0].message.content;

      const response = {
        success: true,
        data: results,
        message: "Pencarian berhasil",
        aiMessage: finalAnswer
      };

      // === Simpan ke Redis (20 menit) ===
      try {
        await redisClient.setex(cacheKey, 1200, JSON.stringify(response));
      } catch (e) {
        console.warn("⚠️ Redis SETEX gagal (skip simpan cache):", e.message);
      }

      return response;

    } catch (err) {
      console.error("🔥 ERROR:", err.message);
      return {
        status: 500,
        success: false,
        message: "Terjadi kesalahan",
        error: err.message
      };
    }
  }
};