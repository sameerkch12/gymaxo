import { z } from "zod";

export const markAttendanceSchema = z.object({
  customerId: z.string().min(1),
  gymId: z.string().min(1),
  branchId: z.string().min(1),
  secret: z.string().min(1),
});
