// packages/api/src/auth.ts
import express from 'express';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const router = express.Router();

interface User {
  id: string;
  email: string;
  password: string;
  nombre: string;
  rol: 'ADMIN' | 'TEACHER' | 'STUDENT';
  estado: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

const dataDir = path.join(process.cwd(), 'packages', 'api', 'data');
const USERS_FILE = path.join(dataDir, 'users.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function loadUsers(): User[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.log('Creando archivo de usuarios...');
  }

  const defaultUsers: User[] = [
    {
      id: '1',
      email: 'admin@educaplatform.com',
      password: 'admin123',
      nombre: 'Admin',
      rol: 'ADMIN',
      estado: 'ACTIVE',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      email: 'profesor@educaplatform.com',
      password: 'admin123',
      nombre: 'Profesor Test',
      rol: 'TEACHER',
      estado: 'ACTIVE',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      email: 'estudiante@educaplatform.com',
      password: 'admin123',
      nombre: 'Estudiante Test',
      rol: 'STUDENT',
      estado: 'ACTIVE',
      createdAt: new Date().toISOString(),
    },
  ];

  saveUsers(defaultUsers);
  return defaultUsers;
}

function saveUsers(users: User[]): void {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    console.log(`✅ ${users.length} usuarios guardados`);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Middleware para verificar token
function verifyToken(req: any, res: any, next: any) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Token requerido',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret-key'
    ) as any;
    req.userId = decoded.userId;
    req.userRol = decoded.rol;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Token inválido',
    });
  }
}

// Función para determinar jerarquía
function getRolHierarchy(rol: string): number {
  switch (rol) {
    case 'ADMIN':
      return 3;
    case 'TEACHER':
      return 2;
    case 'STUDENT':
      return 1;
    default:
      return 0;
  }
}

let users: User[] = loadUsers();

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email y contraseña son requeridos',
      });
    }

    users = loadUsers();
    const user = users.find((u) => u.email === email && u.estado === 'ACTIVE');
    
    if (!user || password !== user.password) {
      return res.status(401).json({
        status: 'error',
        message: 'Email o contraseña incorrectos',
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, rol: user.rol },
      process.env.JWT_SECRET || 'secret-key',
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      status: 'success',
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error en el servidor',
    });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, nombre, rol } = req.body;

    if (!email || !password || !nombre || !rol) {
      return res.status(400).json({
        status: 'error',
        message: 'Todos los campos son requeridos',
      });
    }

    users = loadUsers();

    if (users.find((u) => u.email === email)) {
      return res.status(409).json({
        status: 'error',
        message: 'El email ya está registrado',
      });
    }

    const newUser: User = {
      id: String(Date.now()),
      email,
      password,
      nombre,
      rol: rol as any,
      estado: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, rol: newUser.rol },
      process.env.JWT_SECRET || 'secret-key',
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      status: 'success',
      message: 'Registro exitoso',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        nombre: newUser.nombre,
        rol: newUser.rol,
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error en el servidor',
    });
  }
});

// UPDATE - Actualizar usuario
router.put('/users/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, password, rol, estado } = req.body;
    const userRol = req.userRol;

    // Validaciones
    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({
        status: 'error',
        message: 'Todos los campos son requeridos',
      });
    }

    users = loadUsers();
    const userIndex = users.findIndex((u) => u.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuario no encontrado',
      });
    }

    const targetUser = users[userIndex];

    // Verificar jerarquía: Solo ADMIN puede editar otros usuarios
    if (userRol !== 'ADMIN' && req.userId !== id) {
      return res.status(403).json({
        status: 'error',
        message: 'No tienes permiso para editar este usuario',
      });
    }

    // No permitir cambiar a alguien a rol superior si no eres ADMIN
    if (userRol !== 'ADMIN' && getRolHierarchy(rol) > getRolHierarchy(userRol)) {
      return res.status(403).json({
        status: 'error',
        message: 'No puedes asignar un rol superior al tuyo',
      });
    }

    users[userIndex] = {
      ...users[userIndex],
      nombre,
      email,
      password,
      rol: rol as any,
      estado: estado || 'ACTIVE',
    };

    saveUsers(users);

    return res.status(200).json({
      status: 'success',
      message: 'Usuario actualizado',
      user: users[userIndex],
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error en el servidor',
    });
  }
});

// DELETE - Eliminar usuario con protección
router.delete('/users/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userRol = req.userRol;

    // Solo ADMIN puede eliminar usuarios
    if (userRol !== 'ADMIN') {
      return res.status(403).json({
        status: 'error',
        message: 'Solo administradores pueden eliminar usuarios',
      });
    }

    // No se puede eliminar a sí mismo
    if (req.userId === id) {
      return res.status(400).json({
        status: 'error',
        message: 'No puedes eliminar tu propia cuenta',
      });
    }

    users = loadUsers();
    const userIndex = users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuario no encontrado',
      });
    }

    const deletedUser = users[userIndex];
    users.splice(userIndex, 1);
    saveUsers(users);

    console.log(`🗑️ Usuario eliminado: ${deletedUser.email}`);

    return res.status(200).json({
      status: 'success',
      message: 'Usuario eliminado',
      user: deletedUser,
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error en el servidor',
    });
  }
});

// DISABLE - Desactivar usuario sin eliminar
router.patch('/users/:id/disable', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userRol = req.userRol;

    if (userRol !== 'ADMIN') {
      return res.status(403).json({
        status: 'error',
        message: 'Solo administradores pueden desactivar usuarios',
      });
    }

    if (req.userId === id) {
      return res.status(400).json({
        status: 'error',
        message: 'No puedes desactivar tu propia cuenta',
      });
    }

    users = loadUsers();
    const userIndex = users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuario no encontrado',
      });
    }

    users[userIndex].estado = 'INACTIVE';
    saveUsers(users);

    return res.status(200).json({
      status: 'success',
      message: 'Usuario desactivado',
      user: users[userIndex],
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error en el servidor',
    });
  }
});

// Me
router.get('/me', verifyToken, (req, res) => {
  try {
    users = loadUsers();
    const user = users.find((u) => u.id === req.userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuario no encontrado',
      });
    }

    return res.status(200).json({
      status: 'success',
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
        estado: user.estado,
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(401).json({
      status: 'error',
      message: 'Token inválido',
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  return res.status(200).json({
    status: 'success',
    message: 'Logout exitoso',
  });
});

// GET /api/auth/users - Obtener todos los usuarios
router.get('/users', verifyToken, (req, res) => {
  users = loadUsers();
  return res.status(200).json({
    status: 'success',
    users: users.map(u => ({
      id: u.id,
      email: u.email,
      nombre: u.nombre,
      rol: u.rol,
      estado: u.estado,
      createdAt: u.createdAt,
    })),
    total: users.length,
  });
});

// STATS - Estadísticas de usuarios
router.get('/stats', verifyToken, (req, res) => {
  users = loadUsers();
  return res.status(200).json({
    status: 'success',
    stats: {
      total: users.length,
      admins: users.filter(u => u.rol === 'ADMIN').length,
      teachers: users.filter(u => u.rol === 'TEACHER').length,
      students: users.filter(u => u.rol === 'STUDENT').length,
      active: users.filter(u => u.estado === 'ACTIVE').length,
      inactive: users.filter(u => u.estado === 'INACTIVE').length,
    },
  });
});

// CHANGE PASSWORD - Cambiar contraseña del usuario actual
router.post('/change-password', verifyToken, (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Se requieren ambas contraseñas',
      });
    }

    users = loadUsers();
    const user = users.find((u) => u.id === req.userId);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuario no encontrado',
      });
    }

    if (user.password !== currentPassword) {
      return res.status(401).json({
        status: 'error',
        message: 'Contraseña actual incorrecta',
      });
    }

    user.password = newPassword;
    saveUsers(users);

    return res.status(200).json({
      status: 'success',
      message: 'Contraseña actualizada',
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error en el servidor',
    });
  }
});

export default router;
