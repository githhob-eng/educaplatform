// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { UserRole } from '@prisma/client';

// Extender el tipo de Request para incluir usuario
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        nombre: string;
        rol: UserRole;
      };
      token?: string;
    }
  }
}

/**
 * Middleware para verificar JWT
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token no proporcionado',
    });
  }

  const decoded = AuthService.verifyToken(token);
  if (!decoded) {
    return res.status(403).json({
      success: false,
      message: 'Token inválido o expirado',
    });
  }

  req.user = {
    id: decoded.sub,
    email: decoded.email,
    nombre: decoded.nombre,
    rol: decoded.rol,
  };

  req.token = token;
  next();
}

/**
 * Middleware para verificar rol específico
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado',
      });
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tiene permisos para realizar esta acción',
      });
    }

    next();
  };
}

/**
 * Middleware para verificar que es Admin
 */
export const isAdmin = authorize(UserRole.ADMIN);

/**
 * Middleware para verificar que es Teacher
 */
export const isTeacher = authorize(UserRole.TEACHER);

/**
 * Middleware para verificar que es Student
 */
export const isStudent = authorize(UserRole.STUDENT);

/**
 * Middleware para verificar que es Admin o Teacher
 */
export const isAdminOrTeacher = authorize(UserRole.ADMIN, UserRole.TEACHER);

/**
 * Middleware para auditoría
 */
export function auditLog(action: string, entity: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Interceptar el response original
    const originalSend = res.send;

    res.send = function (data) {
      // Log solo si la acción fue exitosa (status < 300)
      if (res.statusCode < 300 && req.user) {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        prisma.auditLog.create({
          data: {
            userId: req.user.id,
            accion: action,
            entidad: entity,
            entidadId: req.params.id || 'N/A',
            cambios: req.body,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
          },
        }).catch((err: any) => console.error('Error logging audit:', err));
      }

      return originalSend.call(this, data);
    };

    next();
  };
}

/**
 * Middleware de Rate Limiting
 */
import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos
  message: 'Demasiados intentos de login, intente más tarde',
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100, // máximo 100 requests por minuto
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Middleware de manejo de errores
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

/**
 * Middleware de validación
 */
import { Schema } from 'joi';

export function validateRequest(schema: Schema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validación fallida',
        errors,
      });
    }

    req.body = value;
    next();
  };
}
