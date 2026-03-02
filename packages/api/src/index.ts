// packages/api/src/index.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth-routes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ Definir __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Cargar usuarios al iniciar
const USERS_FILE = path.join(__dirname, '../data/users.json');

console.log('📂 Buscando en:', USERS_FILE);

function loadUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      console.log('⚠️ Archivo users.json no encontrado en:', USERS_FILE);
      return [];
    }
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    const users = JSON.parse(data);
    console.log(`✅ Archivo encontrado`);
    console.log(`✅ ${users.length} usuarios cargados`);
    return users;
  } catch (error) {
    console.error('❌ Error al leer users.json:', error);
    return [];
  }
}

// Cargar usuarios al iniciar
loadUsers();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas adicionales (GET /api/users, POST /api/users, etc)
app.use('/api', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API available at http://localhost:${PORT}/api`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
});
