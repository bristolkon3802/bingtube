import express from "express";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import apiRouter from "./routers/apiRouter";
import { localsMiddleware } from "./middlewares";

/* application 설정 시작 */
/* 
    express === req, res, cookies, 브라우저 정보, ip 등등 제공...
    request === 우리가 서버에 요청하는 것들
    response === 요청한 정보를 받는 것들
    handleHome(request, response) === controller
    middlewares === logger === controller
    morgan === middlewares를 return 해줌
        GET, path, status code등 모든 정보를 가지고 있음(GET /login 200 1.592 ms - 5)
            - 속성
            combined === 배포환경에서 사용, 불특정 다수가 접속하기 때문에 IP를 로그에 남겨줌
            common === 
            dev === 개발용을 위해 res에 따라 색상이 입혀진 축약된 로그 출력
            immediate === res대신 req에 따라 로그 작성
            short === 기본 설정보다 짧은 로그를 출력, 응답 시간 포함
            tiny === 최소화된 로그 출력
            skip === 로깅의 스킵여부를 결정, 기본 false / skip(rdq,res)
            stream === 로그 작성을 위한 Output stream옵션, 기본값은 process.stdout.
*/

//console.log(process.cwd());

/* express application 사용 선언 */
const app = express();
const logger = morgan("dev");

/* router, extended === middleware 가 있기에 사용 */
/* pug 사용 */
app.set("view engine", "pug");
/* 디렉토리경로 + views 위치 */
app.set("views", process.cwd() + "/src/views");
/* recorder 다운로드 설정 */
app.use((req, res, next) => {
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  next();
});
/* log 사용 */
app.use(logger);
/* form 데이터 사용 : 자바스크립트 object 형식 */
app.use(express.urlencoded({ extended: true }));
/* express-session */
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.DB_URL,
    }),
  })
);

/* router 사용 */
app.use(localsMiddleware);
app.use("/uploads", express.static("uploads")); //보여줄 폴더 브라우저에 알려주기
app.use("/static", express.static("assets")); //보여줄 폴더 브라우저에 알려주기
app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);
app.use("/api", apiRouter);

export default app;
