import { Router } from "express";
import Controller from "../controller/Controller.js";
import {RateLimiter} from "../middleware/index.js";

const appRouter = Router();
appRouter.use(RateLimiter());

appRouter.get('/state', Controller.state);
appRouter.get("/callback", Controller.callback);
appRouter.get('/session', Controller.getSession);
appRouter.get('/user-info', Controller.userInfo);
appRouter.get('/logout', Controller.logOut);

export default appRouter as ReturnType<typeof Router>;