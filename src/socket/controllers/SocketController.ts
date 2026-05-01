import type { Server } from "socket.io";
import {stateRedis} from "../redis/redis.js";
import type {IToggle} from "../types/type.js";
export default class SocketController {
     static onToggle(io:Server) {
        return  async(data:string) => {
            const {id, value} = JSON.parse(data) as IToggle;

            await stateRedis.hset('state', id, String(value));

            if (value) {
                await stateRedis.sadd('checkedItems', id);
            } else {
                await stateRedis.srem('checkedItems', id);
            }

            const totalCheckedItem = Number(await stateRedis.scard('checkedItems') ?? 0);

            io.emit("toggleChanged", {id, value, totalCheckedItem});

        }
     }
}
