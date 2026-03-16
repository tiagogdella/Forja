import session from 'express-session';
import memorystore from 'memorystore';

const MemoryStore = memorystore(session);

export const sessionMiddleware = session({
  store: new MemoryStore({
    checkPeriod: 86400000 // limpa sessões expiradas a cada 24h
  }),
  secret: process.env.SESSION_SECRET || 'hackeando-seu-treino-secret-2026',
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 dias
  },
  name: 'sessionId'
});
