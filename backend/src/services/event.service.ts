import { Server as SocketServer } from "socket.io";

export class EventService {
  private io: SocketServer;

  constructor(io: SocketServer) {
    this.io = io;
  }

  // Emit to specific user (by userId)
  emitToUser(userId: string, event: string, data: any) {
    this.io.to(`user_${userId}`).emit(event, data);
  }

  // Emit to all users of an owner (e.g., owner and their customers)
  emitToOwner(ownerId: string, event: string, data: any) {
    this.io.to(`owner_${ownerId}`).emit(event, data);
  }

  // Emit to specific customer
  emitToCustomer(customerId: string, event: string, data: any) {
    this.io.to(`customer_${customerId}`).emit(event, data);
  }

  // Emit to admin
  emitToAdmin(event: string, data: any) {
    this.io.to("admin").emit(event, data);
  }

  // Join user to their room on connection
  joinUser(socket: any, userId: string, role: string) {
    socket.join(`user_${userId}`);
    if (role === "owner") {
      socket.join(`owner_${userId}`);
    } else if (role === "customer") {
      socket.join(`customer_${userId}`);
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