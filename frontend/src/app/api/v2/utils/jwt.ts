'use server';

import jwt, { SignOptions, Algorithm } from 'jsonwebtoken';
import { User } from '@/common/interfaces/User';

const SECRET_KEY = process.env.SECRET_KEY || 'default-secret-key';
const ALGORITHM: Algorithm = (process.env.ALGORITHM as Algorithm) || 'HS256';

export async function signJwt(
  payload: object,
  expiresIn: number = 7 * 24 * 60 * 60
): Promise<string> {
  const options: SignOptions = { algorithm: ALGORITHM, expiresIn };
  return jwt.sign(payload, SECRET_KEY, options);
}

export async function verifyJwt(token: string): Promise<User> {
  const decoded = jwt.verify(token, SECRET_KEY, { algorithms: [ALGORITHM] });
  return decoded as User;
}
