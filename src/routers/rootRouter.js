import express from "express";
import {
  getJoin,
  postJoin,
  getLogin,
  postLogin,
} from "../controllers/userController";
import { home, search } from "../controllers/videoController";
import { publicOnlyMiddleware } from "../middlewares";

const rootRouter = express.Router();

rootRouter.get("/", home);
rootRouter
  .route("/join")
  .all(publicOnlyMiddleware)
  .get(getJoin)
  .post(postJoin); /* 회원등록 */
rootRouter
  .route("/login")
  .all(publicOnlyMiddleware)
  .get(getLogin)
  .post(postLogin); /* 로그인 */
rootRouter.get("/search", search); /* 검색 */

export default rootRouter;
