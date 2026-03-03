// src/services/authService.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient, UserRole } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

interface RegisterPayload {
  nombre: string;
  email: string;
  password: string;
  rol: UserRole;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface JWTPayload {
  sub: string;
  email: string;
  nombre: string;
  rol: UserRole;
  iat: number;
  exp: number;
}

export class AuthService {
  /**
   * Hash de contraseña
   */
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Verificar contraseña
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generar JWT
   */
  static generateToken(userId: string, email: string, nombre: string, rol: UserRole): string {
    const token = jwt.sign(
      {
        sub: userId,
        email,
        nombre,
        rol,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      {
        expiresIn: '24h',
        issuer: 'educaplatform',
        audience: 'educaplatform-client',
      }
    );

    return token;
  }

  /**
   * Generar Refresh Token
   */
  static generateRefreshToken(userId: string): string {
    const token = jwt.sign(
      { sub: userId },
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
      {
        expiresIn: '7d',
      }
    );

    return token;
  }

  /**
   * Verificar JWT
   */
  static verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      return decoded as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Registrar nuevo usuario
   */
  static async register(payload: RegisterPayload) {
    const { nombre, email, password, rol } = payload;

    // Verificar que el email no exista
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Hash de la contraseña
    const hashedPassword = await this.hashPassword(password);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        nombre,
        email,
        password: hashedPassword,
        rol,
        activo: true,
      },
    });

    // Si es profesor, crear registro de Teacher
    if (rol === UserRole.TEACHER) {
      await prisma.teacher.create({
        data: {
          id: uuidv4(),
          userId: user.id,
          slotsAlumnos: 1,
          slotsAlumnosUsados: 0,
        },
      });
    }

    // Si es estudiante, crear registro de Student
    if (rol === UserRole.STUDENT) {
      await prisma.student.create({
        data: {
          id: uuidv4(),
          userId: user.id,
          matricula: `MAT-${Date.now()}`,
        },
      });
    }

    // Generar tokens
    const accessToken = this.generateToken(user.id, user.email, user.nombre, user.rol);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Iniciar sesión
   */
  static async login(payload: LoginPayload) {
    const { email, password } = payload;

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Email o contraseña incorrectos');
    }

    // Verificar contraseña
    const isValidPassword = await this.verifyPassword(password, user.password);
    if (!isValidPassword) {
      throw new Error('Email o contraseña incorrectos');
    }

    // Verificar que el usuario está activo
    if (!user.activo) {
      throw new Error('El usuario ha sido desactivado');
    }

    // Generar tokens
    const accessToken = this.generateToken(user.id, user.email, user.nombre, user.rol);
    const refreshToken = this.generateRefreshToken(user.id);

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        accion: 'LOGIN',
        entidad: 'User',
        entidadId: user.id,
      },
    });

    return {
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refrescar token
   */
  static async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret') as { sub: string };

      const user = await prisma.user.findUnique({
        where: { id: decoded.sub },
      });

      if (!user || !user.activo) {
        throw new Error('Usuario no válido');
      }

      const newAccessToken = this.generateToken(user.id, user.email, user.nombre, user.rol);

      return {
        accessToken: newAccessToken,
        refreshToken: this.generateRefreshToken(user.id),
      };
    } catch (error) {
      throw new Error('Refresh token inválido');
    }
  }

  /**
   * Cambiar contraseña
   */
  static async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar contraseña antigua
    const isValidPassword = await this.verifyPassword(oldPassword, user.password);
    if (!isValidPassword) {
      throw new Error('Contraseña actual incorrecta');
    }

    // Hash de la nueva contraseña
    const hashedPassword = await this.hashPassword(newPassword);

    // Actualizar
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Registrar en auditoría
    await prisma.auditLog.create({
      data: {
        userId,
        accion: 'UPDATE',
        entidad: 'User',
        entidadId: userId,
        cambios: { campo: 'password' },
      },
    });

    return { message: 'Contraseña actualizada correctamente' };
  }

  /**
   * Recuperar contraseña (enviar email)
   */
  static async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // No revelar si el email existe o no
      return { message: 'Si el email existe, recibirá instrucciones de recuperación' };
    }

    // Generar token de reset temporal (válido por 1 hora)
    const resetToken = jwt.sign(
      { sub: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    // En producción: enviar email con el token
    console.log(`Reset token para ${email}: ${resetToken}`);

    return { message: 'Si el email existe, recibirá instrucciones de recuperación' };
  }

  /**
   * Resetear contraseña
   */
  static async resetPassword(token: string, newPassword: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { sub: string };

      const hashedPassword = await this.hashPassword(newPassword);

      await prisma.user.update({
        where: { id: decoded.sub },
        data: { password: hashedPassword },
      });

      return { message: 'Contraseña reseteada correctamente' };
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }
}
