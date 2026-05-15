import MongoStore from 'connect-mongo';
import cors from 'cors';
import { configDotenv } from 'dotenv';
import express from 'express';
import session from 'express-session';
import { connectDB } from './config/db.ts';
import './models/index.ts';
import authRoutes from './routes/auth.routes.ts';
import blogRoutes from './routes/blog.routes.ts';
import userRoutes from './routes/user.routes.ts';

configDotenv();

const app = express();

app.use(express.json());
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(
  session({
    name: 'sid',
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: `${process.env.MONGODB_URI}`,
      ttl: 14 * 24 * 60 * 60,
      collectionName: 'sessions',
    }),
    cookie: {
      path: '/',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: 'lax',
      secure: false,
    },
  }),
);

const port = process.env.PORT || 3000;

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/blogs', blogRoutes);

app.get('/', (req, res) => {
  res.send("Yeooo! Man i'm working ");
});

(async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`I AM RUNNING ON PORT ${port}`);
  });
})();
