import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import path from "path";
import fs from "fs";
import Video from "./models/Video";

/* Local, koyeb 체크 */
const isKoyeb = process.env.NODE_ENV === "production";

/* was Object */
const s3 = new S3Client({
  region: "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

const s3ImageUploader = multerS3({
  s3: s3,
  bucket: "bingtube",
  acl: "public-read",
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: function (request, file, ab_callback) {
    const newFileName = Date.now() + "-" + file.originalname.replace(" ", "");
    const fullPath = "images/" + newFileName;
    ab_callback(null, fullPath);
  },
});

const s3VideoUploader = multerS3({
  s3: s3,
  bucket: "bingtube",
  acl: "public-read",
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: function (request, file, ab_callback) {
    const newFileName =
      Date.now() +
      "-" +
      file.originalname.replace(" ", "").replace(/\..*$/, "");
    const fullPath = "videos/" + newFileName;
    ab_callback(null, fullPath);
  },
});

export const localsMiddleware = (req, res, next) => {
  //console.log(req.session);
  //console.log(req.sessionID);
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "Bingtube";
  res.locals.loggedInUser = req.session.user || {};
  res.locals.isKoyeb = isKoyeb;
  //console.log("session : ", req.session.user);
  //console.log(res.locals);
  next();
};

//user가 로그인 돼 있다면 요청을 계속하고, 아니면 로그인 페이지 이동
export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    req.flash("error", "로그인을 먼저 해주세요.");
    return res.redirect("/login");
  }
};

//user가 로그인 돼 있지 않으면 요청을 계속하고, 아니면 홈으로 이동
export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "승인되지 않음");
    return res.redirect("/");
  }
};

//파일 업로드 설정
export const avatarUpload = multer({
  dest: "uploads/avatars/",
  limits: { fileSize: 3000000 },
  storage: isKoyeb ? s3ImageUploader : undefined,
});
//비디오 업로드 설정
export const videoUpload = multer({
  dest: "uploads/videos/",
  limits: { fileSize: 10000000 },
  storage: isKoyeb ? s3VideoUploader : undefined,
});

export const s3AvatarDeleteMiddleware = async (req, res, next) => {
  if (!req.file) {
    return next();
  }
  if (!isKoyeb && req.session.user.avatarUrl) {
    const filePath = path.join(__dirname, "../", req.session.user.avatarUrl);
    fs.access(filePath, fs.constants.F_OK, (error) => {
      if (error) return console.log(error);
      fs.unlink(filePath, (error) => {
        error
          ? console.log(error)
          : console.log(`${filePath} 를 정상적으로 삭제함.`);
      });
    });
  } else if (isKoyeb && req.session.user.avatarUrl) {
    const key = `images/${req.session.user.avatarUrl.split("/")[4]}`;
    console.log(key);
    const params = {
      Bucket: "bingtube",
      Key: key,
    };
    try {
      const data = await s3.send(new DeleteObjectCommand(params));
      console.log("Success. Object deleted.", data);
    } catch (error) {
      console.error("error data = ", error);
      return res.redirect("/users/edit");
    }
  }
  next();
};

export const s3VideosDeleteMiddleware = async (req, res, next) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;

  const video = await Video.findById(id);
  if (!video) {
    req.flash("error", "No.");
    return res.redirect("/");
  }
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "Not authorized.");
    return res.redirect("/");
  }
  if (isKoyeb) {
    const key_file = `videos/${video.videoFileUrl.split("/")[4]}`;
    const key_thumb = `videos/${video.videoThumbUrl.split("/")[4]}`;
    console.log(key_file, key_thumb);
    const params_file = {
      Bucket: "bingtube",
      Key: key_file,
    };
    const params_thumb = {
      Bucket: "bingtube",
      Key: key_thumb,
    };
    console.log(params_file, params_thumb);
    try {
      const data_file = await s3.send(new DeleteObjectCommand(params_file));
      const data_thumb = await s3.send(new DeleteObjectCommand(params_thumb));
      console.log("Success. Object deleted.", data_file, data_thumb);
    } catch (error) {
      console.error("error data = ", error);
      return res.redirect("/");
    }
  } else {
    const videoPath = path.join(__dirname, "../", video.videoFileUrl);
    fs.access(videoPath, fs.constants.F_OK, (error) => {
      if (error) return console.log(error);
      fs.unlink(videoPath, (error) =>
        error
          ? console.log(error)
          : console.log(`${videoPath} 를 정상적으로 삭제했습니다.`)
      );
    });
    const thumbPath = path.join(__dirname, "../", video.videoThumbUrl);
    fs.access(thumbPath, fs.constants.F_OK, (error) => {
      if (error) return console.log(error);
      fs.unlink(thumbPath, (error) =>
        error
          ? console.log(error)
          : console.log(`${thumbPath} 를 정상적으로 삭제했습니다.`)
      );
    });
  }
  next();
};
