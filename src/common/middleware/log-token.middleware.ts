// src/common/middleware/log-token.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LogTokenMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    console.log('🛠 Authorization Header:', authHeader);

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      console.log('🔍 Token:', token);

      try {
        const decoded = require('jsonwebtoken').decode(token, {
          complete: true,
        });
        console.log('📦 JWT Decoded (tanpa verify):', decoded);
      } catch (err) {
        console.error('❌ Token gagal didecode:', err.message);
      }
    }

    next();
  }
}
