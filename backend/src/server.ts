import https from "https";
import { Server as SocketServer } from "socket.io";
import { env } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { createApp } from "./app.js";
import { initEventService } from "./services/event.service.js";

async function main() {
  await connectDatabase();
  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.log(`Gymaxo API running on http://localhost:${env.PORT}/api`);
  });

  const io = new SocketServer(server, {
    cors: {
      origin: env.CORS_ORIGINS?.split(",") || ["http://localhost:3000", "http://localhost:5173"],
      credentials: true,
    },
  });

  // Initialize event service
  initEventService(io);

  // Socket.IO connection handling
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join", (data: { userId: string; role: string }) => {
      const eventService = getEventService();
      eventService.joinUser(socket, data.userId, data.role);
      console.log(`User ${data.userId} joined as ${data.role}`);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  // Make io available globally for services
  (global as any).io = io;

  setInterval(() => {
    https.get("https://gymaxo.onrender.com/api/health", (res) => {
      console.log(`Server hit with status code: ${res.statusCode}`);
    }).on("error", (e) => {
      console.error(`Got error: ${e.message}`);
    });
  }, 3 * 60 * 1000);

  const shutdown = async () => {
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
