export function isAuthorized(req) {
  // Allow local bypass
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  // Check auth_token cookie
  const { cookies } = req;
  const token = cookies.auth_token;
  const correctPassword = process.env.ADMIN_PASSWORD;

  if (token && token === correctPassword) {
    return true;
  }

  return false;
}
