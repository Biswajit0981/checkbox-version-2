import {Redis} from "ioredis";

function createClient() {
    return new Redis();
}

export const stateRedis = createClient();