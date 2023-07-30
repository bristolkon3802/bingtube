import express from "express";
import { registerView } from "../controllers/videoController";

const apiRouter = express.Router();

//영상 시청 후 조회수 증가
apiRouter.post("/videos/:id([0-9a-f]{24})/view", registerView);

export default apiRouter;
