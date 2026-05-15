import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userSession?: {
      _id: string;
      role: string;
      priority: number;
    };
  }
}
