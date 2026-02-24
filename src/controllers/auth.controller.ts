import express from 'express';
import {
  exchangeCodeForTokens,
  fetchGoogleUser,
  getGoogleAuthUrl,
} from '../services/googleOAuth.services.ts';

export const googleLogin = (req: express.Request, res: express.Response) => {
  const url = getGoogleAuthUrl();
  res.redirect(url);
};

export const googleCallback = async (req: express.Request, res: express.Response) => {
  const code = req.query.code;
  if (typeof code !== 'string') {
    return res.status(400).json({ message: 'Invalid or Missing Code' });
  }
  try {
    const tokens = await exchangeCodeForTokens(code);
    const user = await fetchGoogleUser(tokens.access_token);

    // TODO: Store user profile in database

    req.session.userSession = { userId: user.id };
    res.redirect(process.env.CLIENT_REDIRECT_URL!);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
