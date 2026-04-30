import type { Role } from "../constants/domain.js";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        role: Role;
        name?: string;
      };
    }
  }
}

export {};
