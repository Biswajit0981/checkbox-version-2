import {Redis} from "ioredis";

function createClient() {
    console.log(process.env.REDIS_URL)

    return new Redis(process.env.REDIS_URL || "redis://redis:6379");
}

export const stateRedis = createClient();
export const publisher = createClient();
export const subscriber = createClient();