export const appConfig = {
  port: parseInt(process.env.PORT, 10) || 3000,
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  travelFusion: {
    loginId: process.env.TRAVEL_FUSION_LOGIN_ID || 'MSRB7P7FM78HR97L',
    apiUrl: 'https://api.travelfusion.com',
  },
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
  },
};