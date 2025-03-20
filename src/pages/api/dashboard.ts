import { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware } from '../../lib/middleware';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Your dashboard logic here
  res.status(200).json({ message: 'Welcome to the dashboard' });
};

export default authMiddleware(handler);