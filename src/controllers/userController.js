import bcrypt from "bcrypt";
import User from "../models/User";
import fetch from "node-fetch";

/* 로그인 규칙
  username + password 계정 생성을 하였더라도
  Github 로그인 시 email이 같다면 로그인 가능함.
*/

let kakaoTempData;

/* 계정 등록 */
export const getJoin = (req, res) =>
  res.render("join", { pageTitle: "계정 등록" });

export const postJoin = async (req, res) => {
  //패스워드 일치하는지 확인
  //패스워드 HASH256 으로 변환
  //username, email 등록된 계정있는지 확인
  //계정 등록 실패시 암호 저장 400 처리
  //계정 등록
  //errorMessage 처리
  const { name, email, username, password, password2, location } = req.body;
  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle: "Join",
      errorMessage: "Password 가 일치하지 않습니다.",
    });
  }
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (exists) {
    return res.status(400).render("join", {
      pageTitle: "Join",
      errorMessage: "email/username 이 중복됩니다.",
    });
  }
  try {
    const user = await User.create({
      name,
      email,
      username,
      password,
      location,
    });
  } catch (error) {
    //console.log(error);
    return res
      .status(400)
      .render("join", { pageTitle: "Join", errorMessage: error._message });
  }
  res.redirect("/login");
};

/* 로그인 */
export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "로그인" });

export const postLogin = async (req, res) => {
  //계정이 존재하는지 확인
  //패스워드 일치하는 지 확인
  //session 정보 추가
  const { username, password } = req.body;
  const pageTitle = "Login";
  const user = await User.findOne({ username, socialOnly: false });
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "username을 가진 User가 존재하지 않습니다.",
    });
  }
  //console.log("user 패스워드:",user.password);
  //compare === 유저의 정보가져와서 비교한다
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "패스워드가 일치하지 않습니다.",
    });
  }
  //session 설정
  //username + password 로그인 사용자
  req.session.loggedIn = true;
  req.session.user = user;
  //console.log("로그인 사용자!");
  return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
  //github url+email+user_info 정보 획득
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GITHUB_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  //github에서 받은 정보로 로그인 처리
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GITHUB_CLIENT,
    client_secret: process.env.GITHUB_SECRET,
    code: req.query.code,
  };
  //console.log(config);
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  //console.log(json);
  //res.send(JSON.stringify(json));
  if ("access_token" in tokenRequest) {
    //API에 접근
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    //console.log(userData);
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    //console.log(emailData);
    const emailObj = emailData.find(
      //1. github에서 주는 primary && verified 로 된 email을 찾는다.
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      //유저에게 Github로 로그인 했다는 걸 알려줌
      return res.redirect("/login");
    }
    //2. 1번을 찾았을 경우 실행 해서 로그인
    //로그인 가능한 사람은 1)Github으로 계정을 만든 사람이거나
    //                    2)username과 password로 계정을 만든 사람
    // 1),2)번 둘다 로그인 가능, 같은 email 이기때문에.
    // 2)번으로 계정을 만든 사람의 경우, Github을 통해서 로그인도 가능하다
    // 이런식으로 카카오 로그인 계정 생성도 가능
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      //DB에 Github email을 가진 user가 없다면 새로운 계정을 만들어서 로그인
      //socialOnly === 우리에게 해당 계정을 password로 로그인할 수 없다는 것을 알려줌
      //...............오직 소셜 로그인으로만 로그인 할 수 있음.
      user = await User.create({
        avatarUrl: userData.avatar_url,
        name: userData.name,
        username: userData.login,
        email: emailObj.email,
        password: "",
        socialOnly: true,
        location: userData.location,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const logout = (req, res) => {
  req.session.destroy();
  //req.session.loggedIn = false;
  //req.session.loggedInUser = null;
  //req.locals.loggedIn = req.session.loggedIn;
  //req.locals.loggedInUser = req.session.loggedInUser;
  return res.redirect("/");
};

export const getEdit = (req, res) => {
  return res.render("edit-profile", { pageTitle: "Edit Profile" });
};

//user의 프로파일 수정
//sessiond의 정보를 사용해서 유저의 id를 획득, 필요정보를 업데이트 한다.
export const postEdit = async (req, res) => {
  console.log(
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"
  );
  const {
    session: {
      user: { _id, avatarUrl, email: sessionEmail, username: sessionUsername },
    },
    body: { name, email, username, location },
    file,
  } = req;
  const pageTitle = "edit-profile";
  //email 중복 확인
  if (sessionEmail !== email && (await User.exists({ email }))) {
    return res.status(400).render("edit-profile", {
      pageTitle,
      errorMessage: "email은 사용중입니다.",
    });
  }
  if (sessionUsername !== username && (await User.exists({ username }))) {
    return res.status(400).render("edit-profile", {
      pageTitle,
      errorMessage: "username은 사용중입니다.",
    });
  }
  //프로파일 업로드
  console.log(file);
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? file.location : avatarUrl,
      name,
      email,
      username,
      location,
    },
    { new: true }
  );
  req.session.user = updatedUser;
  return res.redirect("/users/edit");
};

//사용자 비밀번호 변경
export const getChangePassword = (req, res) => {
  //로그인된 사용자의 정보를 확인 :  소셜로그인 사용자는 제외한다.
  if (req.session.user.socialOnly === true) {
    req.flash("error", "비밀번호를 변경할 수 없습니다.");
    return res.redirect("/");
  }
  return res.render("users/change-password", { pageTitle: "비밀번호 변경" });
};

export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { oldPassword, newPassword, newPasswordChk },
  } = req;
  //현재 유저의 정보를 가져온다.
  const user = await User.findById(_id);
  //현재 비밀번호 확인
  const ok = bcrypt.compare(oldPassword, user.password);
  if (!ok) {
    return res.status(400).render("users/change-password", {
      pageTitle: "비밀번호 변경",
      errorMessage: "현재 비밀번호가 일치하지 않습니다.",
    });
  }
  //새비밀번호 확인
  if (newPassword !== newPasswordChk) {
    return res.status(400).render("users/change-password", {
      pageTitle: "비밀번호 변경",
      errorMessage: "새로운 비밀번호가 일치하지 않습니다.",
    });
  }
  //비밀번호 변경
  //console.log("현재비밀번호 =", user.password);
  user.password = newPassword;
  //console.log("새로운비밀번호 =", user.password);
  await user.save();
  //console.log("바뀐비밀번호 =", user.password);
  req.flash("info", "비밀번호 변경");
  return res.redirect("/users/logout");
};

export const see = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate({
    path: "videos",
    populate: {
      path: "owner",
      model: "User",
    },
  });
  //console.log(user);
  if (!user) {
    return res.status(404).render("404", { pageTitle: "User not found." });
  }
  return res.render("users/profile", {
    pageTitle: user.name,
    user,
  });
};
