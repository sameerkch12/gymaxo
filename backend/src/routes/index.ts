import { Router } from "express";
import { health } from "../controllers/health.controller.js";
import { adminRoutes } from "./admin.routes.js";
import { authRoutes } from "./auth.routes.js";
import { customerRoutes } from "./customer.routes.js";
import { notificationRoutes } from "./notification.routes.js";
import { ownerRoutes } from "./owner.routes.js";

export const apiRoutes = Router();

apiRoutes.get("/health", health);
apiRoutes.use("/admin", adminRoutes);
apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/owner", ownerRoutes);
apiRoutes.use("/customer", customerRoutes);
apiRoutes.use("/notifications", notificationRoutes);
