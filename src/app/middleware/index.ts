import type {Request, Response, NextFunction} from "express"
import {rClient} from "../utils/rate-limit.js";

export function RateLimiter(limitTime: number = 1000) {

    return async (req: Request, res: Response, next: NextFunction) => {

        const ip = req.ip!;

        const previousTime = await rClient.hget("rateLimiter", ip);

        const currentTime = Date.now();

        if (previousTime) {

            const diff = currentTime - Number(previousTime);

            if (diff < limitTime) {

                return res.status(429).json({
                    success: false,
                    message: "Too many requests"
                });
            }
        }


        await rClient.hset("rateLimiter", ip, currentTime);

        next();
    };
}