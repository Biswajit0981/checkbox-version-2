import {Redis} from "ioredis";

function createClient() {
    return new Redis(process.env.REDIS_URL!);
}

export const stateRedis = createClient();
export const publisher = createClient();
export const subscriber = createClient();