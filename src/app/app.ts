import express, {type Application, urlencoded} from "express";
import cookieParser from "cookie-parser";
import appRouter from "./route/route.js"
import {errorHandler} from "./utils/errorHandler.js";

export default function initApplication(): Application {
    const app = express();

    app.use(express.static("public"));
    app.use(express.json());
    app.use(urlencoded({extended: true, limit: "8mb"}));
    app.use(cookieParser());
    app.use(appRouter);
    app.use(errorHandler)
    return app;
}
