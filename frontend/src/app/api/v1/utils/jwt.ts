'use server';

import jwt, { SignOptions, Algorithm } from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY || 'default-secret-key';
const ALGORITHM: Algorithm = (process.env.ALGORITHM as Algorithm) || 'HS256';

export function signJwt(payload: object, expiresIn: number = 7 * 24 * 60 * 60): string {
  const options: SignOptions = { algorithm: ALGORITHM, expiresIn };
  return jwt.sign(payload, SECRET_KEY, options);
}

export function verifyJwt(token: string): jwt.JwtPayload | string {
  return jwt.verify(token, SECRET_KEY, { algorithms: [ALGORITHM] });
}
