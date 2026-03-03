// packages/api/src/routes/auth-routes.ts
import express, { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();

// ✅ Definir __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta del archivo de usuarios
const USERS_FILE = path.join(__dirname, '../../data/users.json');

console.log('📂 Ruta de usuarios:', USERS_FILE);

// ✅ Función para leer usuarios del JSON
function loadUsers(): any[] {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      console.log('⚠️ Archivo no existe:', USERS_FILE);
      return [];
    }
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    const users = JSON.parse(data);
    console.log('✅ Usuarios cargados:', users.length);
    return users;
  } catch (error) {
    console.error('❌ Error al leer users.json:', error);
    return [];
  }
}

// ✅ Función para guardar usuarios en JSON
function saveUsers(users: any[]): boolean {
  try {
    const dir = path.dirname(USERS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    console.log('✅ Usuarios guardados');
    return true;
  } catch (error) {
    console.error('❌ Error al guardar users.json:', error);
    return false;
  }
}

// ✅ LOGIN - POST /auth/login
router.post('/login', (req: Request, res: Response) => {
  console.log('🔐 Intento de login:', req.body.dni);
  
  const { dni, password } = req.body;

  if (!dni || !password) {
    console.log('❌ DNI o contraseña vacíos');
    return res.status(400).json({ error: 'DNI y contraseña requeridos' });
  }

  const users = loadUsers();
  console.log('👥 Total de usuarios:', users.length);
  
  const user = users.find((u: any) => u.dni === dni);
  
  if (!user) {
    console.log('❌ Usuario no encontrado:', dni);
    return res.status(401).json({ error: 'DNI o contraseña incorrectos' });
  }

  console.log('✅ Usuario encontrado:', user.nombre);
  console.log('Contraseña esperada:', user.password);
  console.log('Contraseña ingresada:', password);

  if (user.password !== password) {
    console.log('❌ Contraseña incorrecta');
    return res.status(401).json({ error: 'DNI o contraseña incorrectos' });
  }

  if (user.estado === 'BLOCKED') {
    console.log('❌ Usuario bloqueado');
    return res.status(403).json({ 
      error: 'Usuario bloqueado',
      motivo: user.motivo_bloqueo || 'Sin especificar'
    });
  }

  console.log('✅ Login exitoso:', user.nombre);
  const userResponse = { ...user };
  delete userResponse.password;

  return res.json({
    success: true,
    user: userResponse,
  });
});

// ✅ OBTENER TODOS LOS USUARIOS - GET /users
router.get('/users', (req: Request, res: Response) => {
  const users = loadUsers();
  const usersResponse = users.map((u: any) => {
    const { password, ...userWithoutPassword } = u;
    return userWithoutPassword;
  });

  return res.json(usersResponse);
});

// ✅ CREAR USUARIO - POST /users
router.post('/users', (req: Request, res: Response) => {
  console.log('➕ Creando usuario:', req.body.dni);
  
  const { nombre, email, dni, rol, password, creado_por_id, comunidad_id } = req.body;

  if (!nombre || !email || !dni || !rol || !password) {
    return res.status(400).json({ 
      error: 'Campos requeridos: nombre, email, dni, rol, password' 
    });
  }

  const users = loadUsers();

  if (users.some((u: any) => u.dni === dni)) {
    console.log('❌ DNI ya existe:', dni);
    return res.status(409).json({ error: 'El DNI ya existe' });
  }

  if (users.some((u: any) => u.email === email)) {
    console.log('❌ Email ya existe:', email);
    return res.status(409).json({ error: 'El email ya existe' });
  }

  const newUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    nombre,
    email,
    dni,
    rol,
    password,
    estado: 'ACTIVE',
    creado_por_id: creado_por_id || undefined,
    comunidad_id: comunidad_id || 'default',
    fecha_creacion: new Date().toISOString(),
  };

  users.push(newUser);
  if (!saveUsers(users)) {
    return res.status(500).json({ error: 'Error al guardar usuario' });
  }

  console.log('✅ Usuario creado:', nombre);
  const { password: _, ...userResponse } = newUser;
  return res.status(201).json({
    success: true,
    user: userResponse,
  });
});

// ✅ ACTUALIZAR USUARIO - PUT /users/:id
router.put('/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  const users = loadUsers();
  const userIndex = users.findIndex((u: any) => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  if (updates.dni && updates.dni !== users[userIndex].dni) {
    if (users.some((u: any) => u.dni === updates.dni)) {
      return res.status(409).json({ error: 'El DNI ya existe' });
    }
  }

  if (updates.email && updates.email !== users[userIndex].email) {
    if (users.some((u: any) => u.email === updates.email)) {
      return res.status(409).json({ error: 'El email ya existe' });
    }
  }

  users[userIndex] = {
    ...users[userIndex],
    ...updates,
    fecha_creacion: users[userIndex].fecha_creacion,
  };

  if (!saveUsers(users)) {
    return res.status(500).json({ error: 'Error al actualizar usuario' });
  }

  const { password: _, ...userResponse } = users[userIndex];
  return res.json({
    success: true,
    user: userResponse,
  });
});

// ✅ ELIMINAR USUARIO - DELETE /users/:id
router.delete('/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  const users = loadUsers();
  const userIndex = users.findIndex((u: any) => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  console.log('🗑️ Eliminando usuario:', users[userIndex].nombre);
  users.splice(userIndex, 1);

  if (!saveUsers(users)) {
    return res.status(500).json({ error: 'Error al eliminar usuario' });
  }

  return res.json({
    success: true,
    message: 'Usuario eliminado',
  });
});

// ✅ HEALTH CHECK - GET /health
router.get('/health', (req: Request, res: Response) => {
  return res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
