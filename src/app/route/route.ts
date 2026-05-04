import { Router } from "express";
import Controller from "../controller/Controller.js";

const appRouter = Router();
appRouter.get('/state', Controller.state);
appRouter.get("/callback", Controller.callback);
appRouter.get('/session', Controller.getSession);
appRouter.get('/user-info', Controller.userInfo);

export default appRouter as ReturnType<typeof Router>;