import 'dotenv/config';
import http from "node:http";
import initApplication from "./app/app.js";
import initSocketWithServer from "./socket/socket.js";

async function init() {
    const app = initApplication();
    const server = http.createServer(app);
    const PORT = process.env.PORT || 3000;

    initSocketWithServer(server);

    server.listen(PORT, () => {
        console.log(`Listening on http://localhost:${PORT}`);
    });

    return server;
}

init().catch(err => {
    console.log(err);
    process.exit(0);
});