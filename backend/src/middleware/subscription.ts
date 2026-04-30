import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import { getOwnerSubscription, isSubscriptionExpired } from "../services/subscription.service.js";

export async function requireActiveOwnerSubscription(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const subscription = await getOwnerSubscription(req.auth!.userId);
    if (!subscription || isSubscriptionExpired(subscription)) {
      return next(
        new AppError(
          402,
          "Owner subscription is not active. Ask platform admin to enable it.",
          "SUBSCRIPTION_EXPIRED",
        ),
      );
    }
    return next();
  } catch (error) {
    return next(error);
  }
}
