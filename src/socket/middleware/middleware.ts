import type {Socket} from "socket.io";
import * as jose from "jose";
import type {CustomSocket} from "../types/type.js";

export default async function authControl(socket: CustomSocket, next: (err?: Error) => void) {
    const token = socket.handshake.auth.token;

    try {
        const client_id = process.env.CLIENT_ID;
        const client_secret = process.env.CLIENT_SECRET;
        if (!client_id || !client_secret) {
            return next(new Error("This is not your Mistake,  server issue"));
        }
        const pubKey = await getPublicKey();

        const verifyToken = await jose.jwtVerify(token as string, pubKey);
        socket.user = {
            id: verifyToken.payload.sub!,
            name: verifyToken.payload.name as string,
        }

        next()
    } catch (e) {
        socket.user = null;
        next();
    }
}

async function getPublicKey() {
    const res = await fetch(`${process.env.ISSUER}/api/auth/oauth2/v3/certs`);
    const key = await res.json();
    if (!key || !key.data) {
        throw new Error("Something went wrong");
    }

    return await jose.importJWK(key.data[0], "RS256");
}

