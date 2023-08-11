import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxLength: 80 },
  videoFileUrl: { type: String, required: true },
  videoThumbUrl: { type: String, required: true },
  description: { type: String, required: true, trim: true, minLength: 2 },
  createdAt: { type: Date, required: true, default: Date.now },
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, required: true, default: 0 },
  },
  owner: { type: mongoose.Schema.Types.ObjectId, request: true, ref: "User" },
});

/* static === 직접 데이터를 커스텀 할 수 있는 장점이 있다. */
videoSchema.static("formatHashtags", function (hashtags) {
  return hashtags
    .split(",")
    .map((word) => (word.startsWith("#") ? word : `#${word}`));
});

const Video = mongoose.model("Video", videoSchema);

export default Video;
