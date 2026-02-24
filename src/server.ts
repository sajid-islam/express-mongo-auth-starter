import MongoStore from "connect-mongo";
import cors from "cors";
import { configDotenv } from "dotenv";
import express from "express";
import session from "express-session";
import { connectDB } from "./config/db.ts";
import authRoutes from "./routes/auth.routes.ts";

configDotenv();

const app = express();

app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@crkatgcluster.6ogfclp.mongodb.net/CrackAnythingDB?appName=CrkAtgCluster`,
      ttl: 14 * 24 * 60 * 60,
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: "lax",
      secure: true,
    },
  }),
);

const port = process.env.PORT || 3000;

// Routes
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Yeooo! Man i'm working ");
});

(async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`I AM RUNNING ON PORT ${port}`);
  });
})();
