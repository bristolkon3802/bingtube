import mongoos from "mongoose";

mongoos.connect(process.env.DB_URL);

/* mongodb 연결 - mongosh */
const db = mongoos.connection;

const handleOpen = () => console.log("✅ Connected to DB");
const handleError = (error) => console.log("❌ DB Error", error);
db.on("error", handleError);
db.once("open", handleOpen);
