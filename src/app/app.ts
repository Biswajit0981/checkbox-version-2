import express, {type Application} from "express";
import {stateRedis} from "../socket/redis/redis.js";
import type {IToggle} from "../socket/types/type.js";

export default function initApplication(): Application {
    const app = express();

    app.use(express.static("public"));
    app.get('/state', async (req, res) => {
        const page = Math.max(Number(req.query.page) || 1, 1);

        const limit = Math.min(Math.max(Number(req.query.limit) || 160, 1), 1000);

        const startIndex = (page - 1) * limit;

        const keys = Array.from({length: limit}, (_, index) => `task-${startIndex + index}`);

        const values = keys.length > 0 ? await stateRedis.hmget('state', ...keys) : [];
        const state: IToggle[] = [];

        values.forEach((value, index) => {
            if (value !== null) {
                state.push({id: keys[index]!, value: value === "true"});
            }
        });

        const totalCheckedItem = Number(await stateRedis.scard('checkedItems') ?? 0);

        return res.status(200).json({state, totalCheckedItem});
    });

    return app;
}
