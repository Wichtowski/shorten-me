'use server';
import { NextApiRequest, NextApiResponse } from 'next';

type HealthResponse = {
  status: string;
  timestamp: string;
  service: string;
};

export default function handler(req: NextApiRequest, res: NextApiResponse<HealthResponse>) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'shortenme-api',
  });
}
