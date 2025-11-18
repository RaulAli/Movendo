import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).send({ error: 'No se proporcionó un token' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).send({ error: 'Token malformado' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'SUPER_SECRET') as any;
      (req as any).user = decoded;
    } catch (error) {
      return res.status(401).send({ error: 'Token inválido' });
    }

    next();
  }
}
