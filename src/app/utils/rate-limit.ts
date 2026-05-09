import {Redis} from "ioredis";

export const rClient = new Redis(process.env.REDIS_URL!);
