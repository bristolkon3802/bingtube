import { async } from "regenerator-runtime";
import User from "../models/User";
import Video from "../models/Video";
import Comment from "../models/Comment";

export const home = async (req, res) => {
  try {
    const videos = await Video.find({})
      .sort({ createdAt: "desc" })
      .populate("owner");
    //console.log(videos);
    return res.render("home", { pageTitle: "Home", videos });
  } catch (error) {
    return res.render("server-error", { error });
  }
};

export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id).populate("owner").populate("comments");
  //console.log(video);
  if (!video) {
    return res.render("404", { pageTitle: "비디오가 없습니다." });
  }
  /* 1건의 비디오 조회 */
  return res.render("watch", { pageTitle: video.title, video });
};

export const getEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  /* exists 사용하지 않고 findById 사용해야 값을 넘겨받는다. */
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "비디오가 없습니다." });
  }
  //Edit Delete Video !== 본인일 경우에만 확인
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "승인되지 않음");
    return res.status(403).redirect("/");
  }
  return res.render("edit", { pageTitle: `수정: ${video.title}`, video });
};

export const postEdit = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { id } = req.params;
  const { title, description, hashtags } = req.body;
  /* findById === id 값을 넘겨받는다. */
  //const video = await Video.findById(id);
  /* exists === id 가 있다면 true 없으면 false 로 받음 */
  /* exists === 필터 필요 exists({ _id: id })*/
  const video = await Video.exists({ _id: id });
  if (!video) {
    return res.status(404).render("404", { pageTitle: "비디오가 없습니다." });
  }
  //Edit Delete Video !== 본인일 경우에만 확인
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "당신은 비디오의 소유자가 아닙니다");
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });
  req.flash("success", "비디오 수정.");
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "비디오 등록" });
};

export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { video, thumb } = req.files;
  const { title, description, hashtags } = req.body;

  console.log(video, thumb);
  try {
    const newVideo = await Video.create({
      title,
      description,
      videoFileUrl: video ? video[0].location : video[0].path,
      videoThumbUrl: thumb
        ? thumb[0].location
        : thumb[0].path.replace(/[\\]/g, "/"),
      owner: _id,
      hashtags: Video.formatHashtags(hashtags),
    });
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
    return res.redirect("/");
  } catch (error) {
    console.log(error);
    return res.status(400).render("upload", {
      pageTitle: "비디오 등록",
      errorMessage: error._message,
    });
  }
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  //const user = await User.findById(_id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "비디오가 없습니다." });
  }
  //Edit Delete Video !== 본인일 경우에만 확인
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  //console.log(id);
  await Video.findByIdAndDelete(id);
  //user.videos.splice(user.videos.indexOf(id), 1);
  //user.save();
  return res.redirect("/");
};

export const search = async (req, res) => {
  //console.log(req.query);
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    /* RegExp === like 와 비슷, i === 소문자, 대문자 가리지 않음, ^${keyword}처음시작 단어, ${keyword}$끝나는 단어 */
    videos = await Video.find({
      title: { $regex: new RegExp(keyword, "i") },
    }).populate("owner");
  }
  return res.render("search", { pageTitle: "Search", videos });
};

//조회수 기록
export const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  video.meta.views = video.meta.views + 1;
  await video.save();
  return res.sendStatus(200);
};

/* 댓글 등록 */
export const createComment = async (req, res) => {
  const {
    session: { user },
    body: { text },
    params: { id },
  } = req;

  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }

  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });
  video.comments.push(comment._id);
  video.save();
  return res.status(201).json({ newCommentId: comment._id });
};

export const deleteComment = async (req, res) => {
  const {
    params: { id },
    session: {
      user: { _id },
    },
  } = req;
  const comment = await Comment.findById(id).populate("video");
  //console.log(comment);
  if (!comment) {
    return res.status(404).render("404", { pageTitle: "비디오가 없습니다." });
  }
  if (String(comment.video.owner) !== String(_id)) {
    req.flash("error", "당신은 비디오의 소유자가 아닙니다");
    return res.status(403).redirect("/");
  }
  await Comment.findByIdAndDelete(id);
  comment.video.comments.splice(comment.video.comments.indexOf(id), 1);
  comment.video.save();
  return res.sendStatus(200);
};
