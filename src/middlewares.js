import multer from "multer";
import aws from "aws-sdk";
import multerS3 from "multer-s3";

const s3 = new aws.S3({
  region: "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

const isKoyeb = process.env.NODE_ENV === "production";

const s3ImageUploader = multerS3({
  s3: s3,
  bucket: "bingtube/images",
  acl: "public-read",
});

const s3VideoUploader = multerS3({
  s3: s3,
  bucket: "bingtube/videos",
  acl: "public-read",
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
