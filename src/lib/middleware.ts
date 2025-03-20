// filepath: /home/mitali/my-new-app/src/lib/middleware.ts
import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';

import jwt from 'jsonwebtoken';

interface CustomNextApiRequest extends NextApiRequest {
    user?: any;
  }

export function authMiddleware(handler: NextApiHandler) {
  return async (req: CustomNextApiRequest, res: NextApiResponse) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ error: 'JWT_SECRET is not defined' });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  };
}
