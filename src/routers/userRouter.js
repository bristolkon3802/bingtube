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
} from "../controllers/userController";
import {
  s3AvatarDeleteMiddleware,
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
  .post(avatarUpload.single("avatar"), s3AvatarDeleteMiddleware, postEdit);
userRouter
  .route("/change-password")
  .all(protectorMiddleware)
  .get(getChangePassword)
  .post(postChangePassword);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);

userRouter.get("/:id", see);

export default userRouter;
