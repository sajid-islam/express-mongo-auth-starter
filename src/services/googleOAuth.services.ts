export const getGoogleAuthUrl = () => {
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_OAUTH_CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&scope=openid%20email%20profile`;
};

export const exchangeCodeForTokens = async (code: string) => {
  const res = await fetch(
    `https://oauth2.googleapis.com/token?client_id=${process.env.GOOGLE_OAUTH_CLIENT_ID}&client_secret=${process.env.GOOGLE_OAUTH_CLIENT_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=${process.env.REDIRECT_URI}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }

  return res.json();
};

export const fetchGoogleUser = async (accessToken: string) => {
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return res.json();
};
