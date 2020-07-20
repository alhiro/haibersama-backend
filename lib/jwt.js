const jwt = require('jsonwebtoken');
const jwtDecode = require('jwt-decode');
const bcrypt = require('bcrypt-nodejs');

const key = process.env.TOKEN_JWT_SECRET || 'haiorganizer';

module.exports = {
    hash: async (text, saltRounds) => {
    	let salt = await bcrypt.genSaltSync(saltRounds);
    	return bcrypt.hashSync(text, salt);
    },
    compare: (text, hash) => {
    	return new Promise(function(resolve,reject){
            var result = bcrypt.compareSync(text, hash)
    		if(result) resolve(result)
    		else reject(result)
    	})
    },
    sign: async (data) => {
        const expiresIn = process.env.TOKEN_ACCESS_LIFETIME || 60 * 10;
        return jwt.sign(data, process.env.TOKEN_JWT_SECRET, { expiresIn: expiresIn });
    },
    verify: async (token) => { 
    	return jwt.verify(token, key)
    },
    decode: async (token) => jwtDecode(token)
}