import express from "express";
import {
  logout,
  see,
  startGithubLogin,
  finishGithubLogin,
  postEdit,
  getEdit,
  postChangePassword,
  getChangePassword,
  startKakaoLogin,
  finishKakaoLogin,
} from "../controllers/userController";
import {
  avatarUpload,
  protectorMiddleware,
  publicOnlyMiddleware,
} from "../middlewares";

const userRouter = express.Router();

userRouter.get("/logout", protectorMiddleware, logout);
userRouter
  .route("/edit")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(avatarUpload.single("avatar"), postEdit);
userRouter
  .route("/change-password")
  .all(protectorMiddleware)
  .get(getChangePassword)
  .post(postChangePassword);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);

userRouter.get("/kakao/start", publicOnlyMiddleware, startKakaoLogin);
userRouter.get("/kakao/finish", publicOnlyMiddleware, finishKakaoLogin);
/* 
userRouter.route("/naver/start").all(publicUserOnly).get(startNaverLogin);
userRouter.route("/naver/finish").all(publicUserOnly).get(finishNaverLogin);
 */
userRouter.get("/:id", see);

export default userRouter;
