# git + nodeJS + blbel project 생성

1. 폴더생성
2. git init
3. git repositories 생성
4. git remote add origin https://github.com/bristolkon3802/bingtube
5. npm init
6. npm i express
7. .gitignore

babel - javascript 컴파일러
설치 API - https://babeljs.io/setup#installation 8. npm install --save-dev @babel/core 9. blbel.config.json 10. npm install @babel/core @babel/node --save-dev 11. npm i nodemon --save-dev - 매번 실행해서 확인할 필요 없이 확인 가능하게 확장 한다.

# server 설정

11. npm i morgan
    combined === 배포환경에서 사용, 불특정 다수가 접속하기 때문에 IP를 로그에 남겨줌
    common ===
    dev === 개발용을 위해 res에 따라 색상이 입혀진 축약된 로그 출력
    immediate === res대신 req에 따라 로그 작성
    short === 기본 설정보다 짧은 로그를 출력, 응답 시간 포함
    tiny === 최소화된 로그 출력
    skip === 로깅의 스킵여부를 결정, 기본 false / skip(rdq,res)
    stream === 로그 작성을 위한 Output stream옵션, 기본값은 process.stdout.

# Bingtybe Reloaded

12. Router
    url을 독립적인 방법으로 관리하기 위해 사용

/ -> 홈
/join -> 회원가입
/login -> 로그인
/search -> 검색

/users/:id -> See User
/users/logout -> 로그아웃
/users/edit -> Edit MY Profile
/users/remove -> Delete MY Profile

/videos/:id -> See 비디오 시청 페이지
/videos/:id/edit -> 비디오 수정 페이지
/videos/:id/remove -> 비디오 삭제 페이지
/videos/upload -> 비디오 업로드

13. Pug
    html을 자유롭게 사용가능하게 관리해준다.
    npm i pug
    app.set("view engine", "pug");
    \views\home.pug

    <!--
    base.pug 반복 or 공통 소스 입력
        직접 렌더링 하지 않고 pug 파일에 상속 함
    pug 파일 명은 소문자로만... or 공백 안됨
    #{} script 사용 선언
    inclued 상속
    block [name] 콘텐츠를 대신 넣을 수 있음
        block은 확장한 파일과 커뮤니케이션 할 수 있게 함
    -->

    conditionals
    if, if esle

14. MVP css
    <link rel="stylesheet" href="https://unpkg.com/mvp.css"> 
    기본적으로 HTML의 요소들을 예쁘게 만들어주는 역할을 함
    초반에 css 상관없이 테스트용으로 사용

15. template
    어떤 특정 유저에게만 보이게 한다

16. mixins
    코드 재사용

17. database
    MongoDB : https://www.mongodb.com/docs/manual/installation/ > Install MongoDB Community Edition
    간단하게 작동시킬 수 있고, 초보자들도 쉽게 이해할 수 있음 - document-based(문서 기반) 으로 만들어 짐 - JSON-like-document 그러므로 행으로 된 데이터를 저장할 필요가 없음

    윈도우 사용자는 설치에 어려움이 있을수 있음
    참조 : https://beyondcode.tistory.com/35

    1. https://www.mongodb.com/try/download/community-kubernetes-operator
    2. https://www.mongodb.com/try/download/shell
    3. 1번2번 다운로드 후 둘다 환경변수 설정 해야함
    4. 쉘에서 mongod으로 연결하고 탭하나를 또 열어 mongosh로 실행하면된다.

18. mongoose
    npm i mongoose

19. bcrypt - https://www.npmjs.com/package/bcrypt
    npm i bcrypt
    user password SHA256

    SHA256 - https://emn178.github.io/online-tools/sha256.html

src 구조
controllers : data를 가공하고 정의 하며 변경하여 뿌려준다.
models : db 구조를 및 데이터 형식을 스키마로 정의 한다.
routers : url을 분기하고 정의한다.
views : html을 정의한다.
mixins : 공통으로 사용하는 html의 구조 데이터를 재사용 가능하게 한다.
partials : 공통으로 사용하는 html을 정의한다.
base : html을 공통으로 사용하기 위한 base.
db.js : mongodb 사용 정의
init.js : database 와 Video를 import 해주는 용도로 사용.
server.js : express 프로젝트 전반적인 사용 등록

    1.models > User.js - userSchema 생성 해서 model을 만든다.
    2.init.js - User.js import 해준다.
    3.template
        rooRouter.js - render 후 경로 추가
            render - join.pug 생성, input 생성
            base.pug - nav join 경로 추가
        userController.js - get, post 생성 및 경로 추가
                          - CRUD 작업
    4.session - middlewares.js
              - localsMiddleware()

        app.use(
            session({
                secret: "Hello!",
                resave: true,
                saveUninitialized: true,
            })
        );

        /* express-session === cookie 정보 확인 */
        app.use((req, res, next) => {
            //console.log(req.headers);
            req.sessionStore.all((error, sessions) => {
                console.log(sessions);
                next();
            });
        });

        app.get("/add-one", (req, res, next) => {
            req.session.potato += 1;
            return res.send(`${req.session.id}\n${req.session.potato}`);
        });
    5. .env 파일 생성
        보여주면 안될것 기록
        .gitignore에 추가
        사용 : process.env.name
        22번 내용 사용

20. express-session -
    https://www.npmjs.com/package/express-session
    npm i express-session
    session ID가 cookie안에 저장되고,
    여기 있는 backend에도 저장된다는게 요점.

    connect-mongo - 서버가 재시작하더라도 세션은 database에 저장시키고 보관
    https://www.npmjs.com/package/connect-mongo
    npm install connect-mongo
    store: MongoStore.create({mongoUrl: "",})

    token
    backend가 로그인한 사용자에게만 쿠키를 주도록 설정

21. Cookies - 단지 정보를 주고 받는 방법인거고 자동처리됨
    cookie는 backend가 너의 브라우저에 주는 정보인데
    cookie에는 정해진 규칙이 있기 때문에, 너가 매번 backend에 request를 할 때
    브라우저는 알아서 그 request에 cookie를 덧붙이게 됨.
    Sign - 우리 backend가 쿠키를 줬다는걸 보여주기 위함.
    Domain - 쿠키를 만든 backend가 누구인지 알려줌.
    Expires - session의 종료 시점.
    Max-Age - 언제 세션이 만료되는지 알려줌.
    ookie: {maxAge: 240000, },

22. dotenv - process.env 사용가능하게 함.
    https://www.npmjs.com/package/dotenv
    npm i dotenv

    require("dotenv").config();
    init.js
    import "dotenv/config";

23. github login
    https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps

24. node-fetch
    node 18버전 부터는 fetch는 장착되어 있다.
    node 18이하 버전은 추가 해줘야 한다.
    https://www.npmjs.com/package/node-fetch
    npm i node-fetch
    npm install node-fetch@2.6.1

25. multer - 파일 업로드
    https://www.npmjs.com/package/multer
    npm i multer

    - DB에는 절대 파일을 저장하지 않고, DB에는 파일 위치만 저장

    multer 사용조건
    1.form 사용조건 삽입
    2.multer기본설정
    3.upload middleware만들기
    -middleware의 순서는 중요함
    -multer 후 post controller이 실행되어야 함
    4.route에서 사용

    5.server에 브라우저에게 폴더 위치 알려주기

26. user, video [ relationship ] 구축
    user.videos.push(newVideo.\_id);
    const video = await Video.findById(id).populate("owner");
    const user = await User.findById(id).populate("videos");

27. Webpack - webpack.config.js
    현재 사용하고있는 .js .png .sass .jpg 등등....의 파일들을 받아서
    다른 파일 .js .css .jpg .png 로 처리,변경 시켜줌

    1. npm i webpack webpack-cli
    2. npm i webpack webpack-cli -D
       1. javascript 연결
          1-1. /webpack.config.js 파일 생성
          1-2. src/client/js/main.js 폴더 or 파일 생성 (처리하기전)
          1-3. "assets": "webpack --config webpack.config.js" (webpack 처리 후)
          1-4. npm run assets
          1-5. npm install -D babel-loader
       2. css 연결
          2-1. src/client/scss/styles.scss 폴더 or 파일 생성
          2-2. npm install sass-loader sass webpack --save-dev
          2-3. npm install --save-dev css-loader
          2-4. npm install --save-dev style-loader
    3. npm run assets

    4. css만 별도로 분리
       4-1. npm install --save-dev mini-css-extract-plugin
    5. nodemon.json 생성
       5-1. 매번 저장할때마서 서버가 재시작하기 때문에 별도로 분리한다. webpack은 다른 console에서 실행시켜야 한다.
       5-2. 실행
       npm run dev:server
       npm run dev:assets

28. scss 적용
    scss폴더 구조 구성

29. javascript 로 비디오 플레이어 만들기

30. API Views - 템플릿을 렌더링하지 않음
    data attribute
    (data-id=\_id)

31. 비디오 시작, 종료, 다운로드
    npm i regenerator-runtime

    https://github.com/Dockerel/Dostagram/blob/master/src/controllers/userController.js
    https://blogofpjj.tistory.com/47
    https://velog.io/@kon6443/NodeJS-Kakao-REST-APIs-%ED%99%9C%EC%9A%A9%ED%95%9C-%EB%A1%9C%EA%B7%B8%EC%9D%B8-%EB%A1%9C%EA%B7%B8%EC%95%84%EC%9B%83-%EC%82%AC%EC%9A%A9%EC%9E%90-%EC%A0%95%EB%B3%B4-%EA%B0%80%EC%A0%B8%EC%98%A4%EA%B8%B0-%EC%97%B0%EA%B2%B0%ED%95%B4%EC%A0%9C

32. ffmpeg.wasm - 비디오를 변환하기 위해 사용자의 컴퓨터를 사용
    비디오 녹화 > webm 파일 생성 > mp4 파일 변환, 썸네일 추가

        npm install @ffmpeg/ffmpeg @ffmpeg/core
        npm i @ffmpeg/util

33. Flash Message - express-flash 사용자에게 flash message를 남길 수 있게 해줌
    npm i express-flash

34. 댓글 창 만들기

        1. commentSchema 작성 > init.js import > Video.js, User.js comment 추가
        2. frontend 작성 > commentSection.js 생성 > webpack.config.js 등록 > watch.pug script등록 댓글 창 form 작성 > commentSection.js fetch로 form request
        3. apiRouters post 주소 작성 > videoController.js createComment 등록
        4. 등록댓글 watch find(), scss

35. 도전 챌린지

    1. 댓글 삭제 기능 추가

36. Heroku 배포

    1.  백엔디 서버 빌드
        npm install --save-dev @babel/core @babel/cli
        npm run build:server
        npm start
    2.  webpack 빌드
        npm run build:assets
    3.  Heroku - https://www.heroku.com/

        - 서버를 아주 빠르게 배포할 수 있는 사이트

    4.  koyeb 를 사용해 배포
    5.  aws 서버 연결
        https://app.koyeb.com/
        create app > github 연걸 (git backurl 변경)
        http://localhost:4000/
        http://localhost:4000/users/github/finish
        https://bingtube-bingtube.koyeb.app/users/github/finish
        환경변수 설정

        배포 참조 : https://devbull.xyz/migrate-heroku-to-koyeb/

    6.  Multer S3 설정
        npm install --save multer-s3
        npm i aws-sdk
