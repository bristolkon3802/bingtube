import bcrypt from "bcrypt";
import mongoose from "mongoose";

/* unique === 오직 하나만 존재 */
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  avatarUrl: String,
  socialOnly: { type: Boolean, default: false },
  username: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String, required: true },
  location: String,
  videos: [
    { type: mongoose.Schema.Types.ObjectId, request: true, ref: "Video" },
  ],
});

userSchema.pre("save", async function () {
  //video 업로드할때마다 password 변경을 방지한다.
  if (this.isModified("password")) {
    //console.log("user password", this.password);
    this.password = await bcrypt.hash(this.password, 5);
    //console.log("hashed password", this.password);
  }
});

const User = mongoose.model("User", userSchema);

export default User;
