import type {Server, Socket} from "socket.io";
import {publisher, stateRedis} from "../redis/redis.js";
import type {CustomSocket, IToggle} from "../types/type.js";

export default class SocketController {
    static onToggle(io: Server, socket:CustomSocket) {
        return async (data: string): Promise<void> => {
            if (!socket.user) return;

            const {id, value} = JSON.parse(data) as IToggle;

            await stateRedis.hset('state', id, String(value));

            if (value) {
                await stateRedis.sadd('checkedItems', id);
            } else {
                await stateRedis.srem('checkedItems', id);
            }

            const totalCheckedItem = Number(await stateRedis.scard('checkedItems') ?? 0);

            await publisher.publish('toggle:server', JSON.stringify({id, value, totalCheckedItem}));

            io.emit("toggleChanged", {id, value, totalCheckedItem});

        }
    }

    static async onConnect(socket: CustomSocket, io: Server) {

        if (socket.user) {
            await stateRedis.sadd('isPresent', socket.user?.id!);
        }
        const total = await stateRedis.scard('isPresent');
        await publisher.publish('isPresent', total.toString());
        io.emit('liveUser', Number(total));
    }

    static  onDisconnect(socket: CustomSocket, io: Server) {
        // if (!socket.user) return;
       return async () => {
           if (socket.user) {
               const x = await stateRedis.srem('isPresent', socket.user?.id!);
           };

           const total = await stateRedis.scard('isPresent');

           await publisher.publish('isPresent', total.toString());
           io.emit('liveUser', Number(total));
       }
    }

    static async whoJoin(socket: CustomSocket, io: Server) {
        const data = {
            name:  socket.user?.name! || "Anonymous",
            type: "Join"
        }
        await publisher.publish("whoJoin", JSON.stringify(data));
        io.emit("whoJoin", data);
    }

    static async whoLeft(socket: CustomSocket, io: Server) {

        const data = {
            name:  socket.user?.name! || "Anonymous",
            type: "Join"
        }

        await publisher.publish("whoLeft", JSON.stringify(data));

        io.emit("whoJoin", data);
    }
}
