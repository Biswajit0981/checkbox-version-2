import type {Server, Socket} from "socket.io";
import {publisher, stateRedis} from "../redis/redis.js";
import type {IToggle} from "../types/type.js";

export default class SocketController {
    static onToggle(io: Server) {
        return async (data: string): Promise<void> => {
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

    static async onConnect(socket: Socket, io: Server) {
        await stateRedis.sadd('isPresent', socket.id);
        const total = await stateRedis.scard('isPresent');
        await publisher.publish('isPresent', total.toString());
        io.emit('liveUser', Number(total));
    }

    static async onDisconnect(socket: Socket, io: Server) {
        await stateRedis.srem('isPresent', socket.id);

        const total = await stateRedis.scard('isPresent');
        await publisher.publish('isPresent', total.toString());
        io.emit('liveUser', Number(total));
    }

    static async whoJoin(socket: Socket, io: Server) {
        const data = {
            name: socket.id,
            type: "Join"
        }
        await publisher.publish("whoJoin", JSON.stringify(data));
        io.emit("whoJoin", data);
    }

    static async whoLeft(socket: Socket, io: Server) {
        const data = {
            name: socket.id,
            type: "Leave"
        }

        await publisher.publish("whoLeft", JSON.stringify(data));

        io.emit("whoJoin", data);
    }
}
