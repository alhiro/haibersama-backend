// socketHandler.js
export default (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 Client connected, socket id:", socket.id);

    socket.on("join", (userId) => {
      console.log("👥 User joined:", userId);
      socket.join(userId);
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected");
    });
  });
};
