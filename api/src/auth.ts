// packages/api/src/auth.ts
import express from 'express';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// FIX para __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface User {
  id: string;
  email: string;
  password: string;
  nombre: string;
  dni: string;
  rol: 'ADMIN' | 'TEACHER' | 'STUDENT';
  estado: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

// RUTA CORRECTA - Sin duplicación de carpetas
const USERS_FILE = path.join(process.cwd(), 'packages', 'api', 'data', 'users.json');

function ensureDirectory(): void {
  const dir = path.dirname(USERS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Carpeta creada: ${dir}`);
  }
}

function loadUsers(): User[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      const users = JSON.parse(data);
      console.log(`✅ ARCHIVO ENCONTRADO: ${USERS_FILE}`);
      console.log(`✅ ${users.length} usuarios cargados`);
      return users;
    }
  } catch (error) {
    console.error('❌ Error leyendo users.json:', error);
  }

  console.log('📝 Creando archivo de usuarios por defecto...');
  const defaultUsers: User[] = [
    {
      id: '1',
      email: 'admin@educaplatform.com',
      password: 'admin123',
      nombre: 'Admin',
      dni: '11111111',
      rol: 'ADMIN',
      estado: 'ACTIVE',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      email: 'profesor@educaplatform.com',
      password: 'admin123',
      nombre: 'Profesor Test',
      dni: '22222222',
      rol: 'TEACHER',
      estado: 'ACTIVE',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      email: 'estudiante@educaplatform.com',
      password: 'admin123',
      nombre: 'Estudiante Test',
      dni: '33333333',
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
    ensureDirectory();
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    console.log(`✅ ${users.length} usuarios guardados en ${USERS_FILE}`);
  } catch (error) {
    console.error('❌ Error guardando usuarios:', error);
  }
}

let users: User[] = loadUsers();

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, dni, password } = req.body;

    // Aceptar login por email O por DNI
    const loginValue = email || dni;
    console.log(`\n🔐 LOGIN INTENTO: ${loginValue}`);

    if (!loginValue || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'DNI/Email y contraseña son requeridos',
      });
    }

    users = loadUsers();
    console.log(`📝 Total de usuarios en BD: ${users.length}`);

    // Buscar por DNI o por email
    const user = users.find((u) => {
      const userDni = (u.dni || '').toString().replace(/[^0-9]/g, '');
      const inputDni = loginValue.toString().replace(/[^0-9]/g, '');
      return userDni === inputDni || u.email === loginValue;
    });

    if (!user) {
      console.log(`❌ Usuario NO encontrado: ${loginValue}`);
      return res.status(401).json({
        status: 'error',
        message: 'DNI o contraseña incorrectos',
      });
    }

    console.log(`✅ Usuario encontrado: ${user.nombre}`);
    console.log(`🔑 Comparando contraseña...`);

    if (password !== user.password) {
      console.log(`❌ Contraseña incorrecta`);
      return res.status(401).json({
        status: 'error',
        message: 'DNI o contraseña incorrectos',
      });
    }

    console.log(`✅ Login exitoso: ${user.nombre}`);

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
        dni: user.dni,
        rol: user.rol,
      },
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error en el servidor',
    });
  }
});

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { email, password, nombre, rol, dni } = req.body;

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
      dni: dni || String(Date.now()).slice(-8),
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
        dni: newUser.dni,
        rol: newUser.rol,
      },
    });
  } catch (error) {
    console.error('Error en register:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error en el servidor',
    });
  }
});

// UPDATE
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, password, rol, estado, dni } = req.body;

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

    users[userIndex] = {
      ...users[userIndex],
      nombre,
      email,
      password,
      dni: dni || users[userIndex].dni,
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

// DELETE
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

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

// DISABLE
router.patch('/users/:id/disable', async (req, res) => {
  try {
    const { id } = req.params;

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

// ME
router.get('/me', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'No autorizado',
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret-key'
    ) as any;

    users = loadUsers();
    const user = users.find((u) => u.id === decoded.userId);
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
        dni: user.dni,
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

// LOGOUT
router.post('/logout', (req, res) => {
  return res.status(200).json({
    status: 'success',
    message: 'Logout exitoso',
  });
});

// GET USERS
router.get('/users', (req, res) => {
  users = loadUsers();
  return res.status(200).json({
    status: 'success',
    users: users.map(u => ({
      id: u.id,
      email: u.email,
      nombre: u.nombre,
      dni: u.dni,
      rol: u.rol,
      estado: u.estado,
      createdAt: u.createdAt,
    })),
    total: users.length,
  });
});

// STATS
router.get('/stats', (req, res) => {
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

// CHANGE PASSWORD
router.post('/change-password', (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Se requieren ambas contraseñas',
      });
    }

    users = loadUsers();
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret-key'
    ) as any;

    const user = users.find((u) => u.id === decoded.userId);

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
