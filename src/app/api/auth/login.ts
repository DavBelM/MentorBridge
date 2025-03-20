// filepath: /home/mitali/my-new-app/src/pages/api/auth/login.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { loginUser } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, password } = req.body;
    try {
      const { token, user } = await loginUser(email, password);
      res.status(200).json({ token, user });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ error: errorMessage });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}