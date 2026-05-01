import {Server as SocketServer} from "socket.io";

import type {Server} from "node:http";
import type {
    ClientToServerEvents,
    InternalServerEvents,
    ServerToClientEvents,
    SocketData,
} from "./types/type.js";
import SocketController from "./controllers/SocketController.js";

export default function initSocketWithServer(server: Server) {
    const io = new SocketServer<
        ClientToServerEvents,
        ServerToClientEvents,
        InternalServerEvents,
        SocketData
    >(server);

    io.on("connection", (socket) => {
        io.emit("liveUser", io.engine.clientsCount);
        io.emit("whoJoin", {
            name: socket.id,
            type: "Join"
        });

        socket.on("onToggle", SocketController.onToggle(io));


        socket.on("disconnect", () => {
            io.emit("liveUser", io.engine.clientsCount);
            io.emit("whoJoin", {
                name: socket.id,
                type: "Leave"
            });
        });
    });

    return io;
}
