// packages/api/src/auth-routes.ts
import express from 'express';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
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

// RUTA CORRECTA - packages/api/src → sube a packages/api → va a data/users.json
const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

console.log('🔍 Buscando en:', USERS_FILE);

function loadUsers(): User[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      console.log('✅ Archivo encontrado');
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      const users = JSON.parse(data);
      console.log(`✅ ${users.length} usuarios cargados`);
      return users;
    } else {
      console.log('❌ Archivo NO encontrado en:', USERS_FILE);
      return [];
    }
  } catch (error) {
    console.error('❌ Error:', error);
    return [];
  }
}

function saveUsers(users: User[]): void {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error('❌ Error guardando:', error);
  }
}

let users: User[] = loadUsers();

router.post('/login', (req, res) => {
  try {
    const { dni, password } = req.body;
    console.log(`\n🔐 Login - DNI: ${dni}`);

    if (!dni || !password) {
      return res.status(400).json({ status: 'error', message: 'Requeridos' });
    }

    users = loadUsers();
    const user = users.find((u) => String(u.dni) === String(dni));

    if (!user) {
      console.log(`❌ Usuario NO encontrado`);
      return res.status(401).json({ status: 'error', message: 'DNI o contraseña incorrectos' });
    }

    if (String(user.password) !== String(password)) {
      console.log(`❌ Contraseña incorrecta`);
      return res.status(401).json({ status: 'error', message: 'DNI o contraseña incorrectos' });
    }

    if (user.estado !== 'ACTIVE') {
      return res.status(401).json({ status: 'error', message: 'Usuario desactivado' });
    }

    console.log(`✅ Login exitoso: ${user.nombre}`);

    const token = jwt.sign(
      { userId: user.id, email: user.email, rol: user.rol },
      process.env.JWT_SECRET || 'secret-key',
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      status: 'success',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        dni: user.dni,
        rol: user.rol,
      },
    });
  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({ status: 'error', message: 'Error' });
  }
});

router.post('/register', (req, res) => {
  try {
    const { nombre, email, password, rol, dni } = req.body;

    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ status: 'error', message: 'Requeridos' });
    }

    users = loadUsers();

    if (users.find((u) => u.email === email)) {
      return res.status(409).json({ status: 'error', message: 'Email registrado' });
    }

    const newUser: User = {
      id: String(Date.now()),
      nombre,
      email,
      password,
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
      token,
      user: { id: newUser.id, nombre: newUser.nombre, email: newUser.email, dni: newUser.dni, rol: newUser.rol },
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ status: 'error', message: 'Error' });
  }
});

router.get('/users', (req, res) => {
  users = loadUsers();
  return res.status(200).json({ status: 'success', users, total: users.length });
});

router.get('/stats', (req, res) => {
  users = loadUsers();
  return res.status(200).json({
    status: 'success',
    stats: {
      total: users.length,
      admins: users.filter(u => u.rol === 'ADMIN').length,
      teachers: users.filter(u => u.rol === 'TEACHER').length,
      students: users.filter(u => u.rol === 'STUDENT').length,
    },
  });
});

router.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, email, password, rol, estado } = req.body;

  users = loadUsers();
  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({ status: 'error', message: 'No encontrado' });
  }

  users[index] = { ...users[index], nombre, email, password, rol, estado };
  saveUsers(users);

  return res.status(200).json({ status: 'success', user: users[index] });
});

router.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  users = loadUsers();
  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({ status: 'error', message: 'No encontrado' });
  }

  const deleted = users[index];
  users.splice(index, 1);
  saveUsers(users);

  return res.status(200).json({ status: 'success', user: deleted });
});

router.post('/logout', (req, res) => {
  return res.status(200).json({ status: 'success', message: 'Logout exitoso' });
});

router.get('/me', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ status: 'error', message: 'No autorizado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key') as any;
    users = loadUsers();
    const user = users.find(u => u.id === decoded.userId);

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'No encontrado' });
    }

    return res.status(200).json({ status: 'success', user });
  } catch (error) {
    return res.status(401).json({ status: 'error', message: 'Token inválido' });
  }
});

export default router;
