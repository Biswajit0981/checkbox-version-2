import {Redis} from "ioredis";

function createClient() {
    return new Redis(process.env.REDIS_URL || "redis://redis:6379");
}

export const stateRedis = createClient();
export const publisher = createClient();
export const subscriber = createClient();