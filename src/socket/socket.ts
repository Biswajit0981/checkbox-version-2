import {Server as SocketServer} from "socket.io";

import type {Server} from "node:http";
import type {
    ClientToServerEvents,
    InternalServerEvents,
    ServerToClientEvents,
    SocketData,
} from "./types/type.js";
import SocketController from "./controllers/SocketController.js";
import {publisher, subscriber} from "./redis/redis.js";

export default function initSocketWithServer(server: Server) {
    const io = new SocketServer<
        ClientToServerEvents,
        ServerToClientEvents,
        InternalServerEvents,
        SocketData
    >(server);

    subscriber.subscribe('toggle:server', 'isPresent', 'whoJoin', 'whoLeft', (err, count) => {
        if (err) {
            console.log(`Failed to subscribe to server: ${err}`);
        } else {
            console.log(`Subscribed successfully! This client is currently subscribe`);
        }
    });

    subscriber.on("message", (channel, msg) => {
        if (channel === "toggle:server") {
            io.emit("toggleChanged", JSON.parse(msg));
        }

        if (channel === "isPresent") {
            io.emit('liveUser', Number(msg));
        }

        if (channel === "whoJoin") {
            io.emit("whoJoin", JSON.parse(msg));
        }

        if (channel === "whoLeft") {
            io.emit("whoJoin", JSON.parse(msg));
        }

    });

    io.on("connection", async (socket) => {

        await SocketController.onConnect(socket, io);
        await SocketController.whoJoin(socket, io);

        socket.on("onToggle", SocketController.onToggle(io));

        socket.on("disconnect", async () => {
            await SocketController.onDisconnect(socket, io);
            await SocketController.whoLeft(socket, io);
        });
    });

    return io;
}
