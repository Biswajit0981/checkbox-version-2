import type {Request, Response} from "express";
import {stateRedis} from "../../socket/redis/redis.js";
import type {IToggle} from "../../socket/types/type.js";


export default class Controller {
    static async state(req: Request, res: Response) {
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
    }

    static async callback(req: Request, res: Response) {
        const code = req.query.code;
        if (!code) {
            return res.redirect(`${process.env.ISSUER}/api/o/oauth2/v1/auth?client_id=${process.env.CLIENT_ID}&redirect_uri=http://localhost:3001/callback`)
        }
        const response = await fetch(`${process.env.ISSUER}/api/o/oauth2/v1/token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&redirect_uri=http://localhost:3001/callback&code=${code}`, {
            method: "POST",
        });

        if (!response.ok) {
            return res.redirect(`${process.env.ISSUER}/api/o/oauth2/v1/auth?client_id=${process.env.CLIENT_ID}&redirect_uri=http://localhost:3001/callback`)
        }

        const {data} = await response.json();
        const cookieOptions = {
            httpOnly: true,
            secure: true,
            sameSite: "lax" as const,
            maxAge: 24 * 60 * 60 * 1000,
        };

        res.cookie("session-token", data.accessToken, cookieOptions);
        res.cookie("active-token", data.refreshToken, cookieOptions);

        return res.redirect("/");
    }

    static getSession(req: Request, res: Response) {
        if (!req.cookies) {
            throw new Error("Unauthorized");
        }
        return res.status(200).json(req.cookies);
    }

    static async userInfo(req: Request, res: Response) {
        if (!req.cookies) {
            throw new Error("Unauthorized");
        }

        const fetchUserinfo = await fetch(`${process.env.ISSUER}/api/o/oauth2/v1/user_info?client_id=${process.env.CLIENT_ID}&redirect_uri=http://localhost:3001/callback`, {
            headers: {
                Authorization: `Bearer ${req.cookies["session-token"]}`,
            }
        });

        if (fetchUserinfo.status !== 200) {
            throw new Error("Unauthorized");
        }

        const data = await fetchUserinfo.json();

        return res.status(200).json(data);
    }

    static async logOut(req: Request, res: Response) {

        const cookieOptions = {
            httpOnly: true,
            secure: true,
            sameSite: "lax" as const,
            maxAge: 24 * 60 * 60 * 1000,
        };

        return res.status(200).clearCookie("session-token", cookieOptions).clearCookie("active-token", cookieOptions).send();
    }
}