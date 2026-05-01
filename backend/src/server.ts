import https from "https";
import { Server as SocketServer } from "socket.io";
import { env } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { createApp } from "./app.js";
import { getEventService, initEventService } from "./services/event.service.js";
import { CustomerModel } from "./models/customer.model.js";
import { verifyAccessToken } from "./utils/tokens.js";

async function main() {
  await connectDatabase();
  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.log(`Gymaxo API running on http://localhost:${env.PORT}/api`);
  });

  const io = new SocketServer(server, {
    cors: {
      origin: env.CORS_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean),
      credentials: true,
    },
  });

  // Initialize event service
  initEventService(io);

  io.use((socket, next) => {
    const authToken = socket.handshake.auth?.token;
    const headerToken = socket.handshake.headers.authorization;
    const token =
      typeof authToken === "string"
        ? authToken
        : typeof headerToken === "string" && headerToken.startsWith("Bearer ")
          ? headerToken.slice(7)
          : null;

    if (!token) return next(new Error("Missing socket token"));

    try {
      socket.data.auth = verifyAccessToken(token);
      return next();
    } catch {
      return next(new Error("Invalid socket token"));
    }
  });

  io.on("connection", (socket) => {
    const auth = socket.data.auth as ReturnType<typeof verifyAccessToken>;

    const joinRooms = async () => {
      const eventService = getEventService();
      const customerIds =
        auth.role === "customer"
          ? (await CustomerModel.find({ userId: auth.sub }).select("_id")).map((customer) =>
              String(customer._id),
            )
          : [];

      eventService.joinUser(socket, auth.sub, auth.role, customerIds);
      console.log(`Socket ${socket.id} joined as ${auth.role}:${auth.sub}`);
    };

    void joinRooms().catch((error) => {
      console.error("Socket room join failed", error);
      socket.disconnect(true);
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
