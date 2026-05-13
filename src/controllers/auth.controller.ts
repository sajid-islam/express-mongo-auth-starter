import express from 'express';
import { nanoid } from 'nanoid';
import { Role } from '../models/Role.ts';
import User from '../models/User.ts';
import {
  exchangeGithubCodeForTokens,
  fetchGithubUser,
  getGithubAuthUrl,
} from '../services/githubOAuth.services.ts';
import {
  exchangeCodeForTokens,
  fetchGoogleUser,
  getGoogleAuthUrl,
} from '../services/googleOAuth.services.ts';

const defaultRoleValue = 'user';

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

    const existingUser = await User.findOne({ email: user.email }).populate('role');
    const roleUser = await Role.findOne({ value: 'user' });
    if (existingUser && existingUser?.provider !== 'google') {
      return res.redirect(`${process.env.CLIENT_REDIRECT_URL}?error=provider_mismatch`);
    }
    if (!existingUser) {
      const newUser = new User({
        userId: user.id,
        name: user.name,
        email: user.email,
        photo_url: user.picture,
        provider: 'google',
        role: roleUser?.value,
        verified_email: user.verified_email,
      });
      await newUser.save();
    }

    const roleDoc = existingUser?.role as any;

    req.session.userSession = {
      userId: user.id,
      role: roleDoc?.value || defaultRoleValue,
      priority: roleDoc?.priority || 0,
    };
    req.session.save((err) => {
      if (err) {
        console.log('Session Error: ', err);
        res.status(500).json({ message: 'Session not saved, Try again' });
      }
      res.redirect(process.env.CLIENT_REDIRECT_URL!);
    });
  } catch (error) {
    console.log(error);
    return res.redirect(`${process.env.CLIENT_REDIRECT_URL}?error=google_login_failed`);
  }
};

export const githubLogin = async (req: express.Request, res: express.Response) => {
  try {
    const url = getGithubAuthUrl();
    res.redirect(url);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const githubCallback = async (req: express.Request, res: express.Response) => {
  try {
    const code = req.query.code;

    if (typeof code !== 'string') {
      return res.status(400).json({ message: 'Invalid or missing code' });
    }
    const tokens = await exchangeGithubCodeForTokens(code);
    const user = await fetchGithubUser(tokens.access_token);

    const existingUser = await User.findOne({ email: user.email }).populate('role');
    const roleUser = await Role.findOne({ value: 'user' });
    if (existingUser && existingUser?.provider !== 'github') {
      return res.redirect(`${process.env.CLIENT_REDIRECT_URL}?error=provider_mismatch`);
    }
    if (!existingUser) {
      const newUser = new User({
        userId: user.id,
        name: user.name,
        email: user.email,
        photo_url: user.avatar_url,
        provider: 'github',
        role: roleUser?._id,
        verified_email: true,
      });
      await newUser.save();
    }
    const roleDoc = existingUser?.role as any;
    req.session.userSession = {
      userId: user.id,
      role: roleDoc?.value || defaultRoleValue,
      priority: roleDoc?.priority || 0,
    };
    req.session.save((err) => {
      if (err) {
        console.log('Session Error: ', err);
        res.status(500).json({ message: 'Session not saved, Try again' });
      }

      res.redirect(process.env.CLIENT_REDIRECT_URL!);
    });
  } catch (error) {
    console.log('Error while github callback', error);
    return res.redirect(`${process.env.CLIENT_REDIRECT_URL}?error=github_login_failed`);
  }
};

export const emailRegister = async (req: express.Request, res: express.Response) => {
  try {
    const { name, email, password, confirmPassword, agreedTerms } = req.body;
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All field are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    if (!agreedTerms) {
      return res
        .status(400)
        .json({ success: false, message: 'Please agree to the terms and conditions' });
    }

    const existingUser = await User.findOne({ email: email });
    const roleUser = await Role.findOne({ value: 'user' });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exist' });
    }

    const userId = nanoid();

    const newUser = new User({
      name,
      email,
      password,
      userId,
      agreedTerms,
      role: roleUser?._id,
      provider: 'email',
    });

    await newUser.save();

    req.session.userSession = { userId, role: defaultRoleValue, priority: 0 };
    req.session.save((err) => {
      if (err) {
        console.log('Session Error: ', err);
        res.status(500).json({ success: false, message: 'Session not saved, Try again' });
      }
      return res.status(200).json({
        success: true,
        message: 'Registration successful',
        user: {
          name: newUser.name,
          email: newUser.email,
          userId: newUser.userId,
        },
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
export const emailLogin = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email }).populate('role');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.provider !== 'email') {
      return res.status(400).json({
        success: false,
        message: 'Please login using your provider',
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }
    const roleDoc = user.role as any;
    req.session.userSession = {
      userId: user.userId,
      role: roleDoc.value,
      priority: roleDoc.priority,
    };

    req.session.save((err) => {
      if (err) {
        console.log('Session Error:', err);
        return res.status(500).json({
          success: false,
          message: 'Session not saved, try again',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          name: user.name,
          email: user.email,
          userId: user.userId,
        },
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

export const logout = async (req: express.Request, res: express.Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.log('Error while logout user: ', err);
      res.status(500).json({ message: 'Failed to logout, try again' });
    }
    res.clearCookie('sid');
    return res.status(200).json({ message: 'Logout successfully!' });
  });
};
