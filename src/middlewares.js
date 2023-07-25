export const localsMiddleware = (req, res, next) => {
  //console.log(req.session);
  console.log("session :::::::::::::::");
  //console.log(req.sessionID);
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "Bingtube";
  res.locals.loggedInUser = req.session.user || {};
  //console.log(req.session.user);
  //console.log(res.locals);
  next();
};

//user가 로그인 돼 있다면 요청을 계속하고, 아니면 로그인 페이지 이동
export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    return res.redirect("/login");
  }
};

//user가 로그인 돼 있지 않으면 요청을 계속하고, 아니면 홈으로 이동
export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    return res.redirect("/");
  }
};
