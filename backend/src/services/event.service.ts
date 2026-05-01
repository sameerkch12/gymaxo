import { Server as SocketServer, type Socket } from "socket.io";
import type { Role } from "../constants/domain.js";

export class EventService {
  private io: SocketServer;

  constructor(io: SocketServer) {
    this.io = io;
  }

  // Emit to specific user account.
  emitToUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  // Emit to an owner account.
  emitToOwner(ownerId: string, event: string, data: any) {
    this.io.to(`owner:${ownerId}`).emit(event, data);
  }

  // Emit to a customer membership record.
  emitToCustomer(customerId: string, event: string, data: any) {
    this.io.to(`customer:${customerId}`).emit(event, data);
  }

  // Emit to admin
  emitToAdmin(event: string, data: any) {
    this.io.to("admin").emit(event, data);
  }

  // Join authenticated sockets to rooms. The caller must pass values from a verified token.
  joinUser(socket: Socket, userId: string, role: Role, customerIds: string[] = []) {
    socket.join(`user:${userId}`);
    if (role === "owner") {
      socket.join(`owner:${userId}`);
    } else if (role === "customer") {
      for (const customerId of customerIds) {
        socket.join(`customer:${customerId}`);
      }
    } else if (role === "admin") {
      socket.join("admin");
    }
  }
}

// Global instance
let eventService: EventService;

export function initEventService(io: SocketServer) {
  eventService = new EventService(io);
  return eventService;
}

export function getEventService() {
  return eventService;
}
