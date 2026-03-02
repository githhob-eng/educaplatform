# 📚 EducaPlatform

> **Plataforma educativa escalable, segura y modular para gestión de cursos en línea**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)](https://www.postgresql.org/)

---

## 🎯 Características Principales

### 👥 Sistema Multi-Rol
- **Admin**: Gestión total del sistema
- **Profesor**: Crear y gestionar cursos
- **Alumno**: Acceder a contenido educativo

### 📚 Gestión de Cursos
- Crear cursos con módulos y materiales
- Soporte para PDF, videos, imágenes y archivos
- Integración con Google Drive y YouTube
- Editor HTML para contenido personalizado

### 👨‍🏫 Panel de Profesor
- Crear estudiantes y gestionar inscritos
- Subir materiales educativos
- Registrar asistencia
- Calificar trabajos
- **Sistema de slots**: Comprar slots adicionales para más estudiantes

### 🎓 Panel de Alumno
- Ver cursos inscritos
- Acceder a materiales
- Ver calificaciones
- Descargar contenido
- Visualizar calendario académico

### 💳 Sistema de Pagos
- Integración con Shopify / TiendaNube
- Compra de slots adicionales para profesores
- Gestión de transacciones
- Historial de pagos

### 🔐 Seguridad
- Autenticación con JWT
- Control de acceso basado en roles (RBAC)
- Hash de contraseñas con bcrypt
- Rate limiting
- Auditoría de acciones
- HTTPS obligatorio

---

## 🏗 Stack Tecnológico

### Frontend
```
React 18 + Next.js 14 (App Router)
TypeScript
Tailwind CSS
NextAuth.js
Axios
Zustand (State Management)
React Hook Form
```

### Backend
```
Node.js + Express
TypeScript
PostgreSQL + Prisma ORM
JWT
Bcrypt
Google Drive API
YouTube API
```

### Infraestructura
```
Vercel (Frontend)
Railway/Render (Backend)
PostgreSQL (Base de Datos)
Google Drive (Almacenamiento)
YouTube (Videos)
Redis (Cache)
```

---

## 🚀 Inicio Rápido

### Requisitos
- Node.js v18+
- PostgreSQL v14+
- Git

### Instalación

1. **Clonar repositorio**
```bash
git clone https://github.com/tu-usuario/educaplatform.git
cd educaplatform
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
# Editar .env.local con tus datos
```

4. **Migrar base de datos**
```bash
npx prisma migrate dev --name init
```

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

Acceder a:
- Frontend: http://localhost:3000
- API: http://localhost:3001/api

---

## 📁 Estructura del Proyecto

```
educaplatform/
├── packages/
│   ├── web/                    # Frontend Next.js
│   │   ├── app/                # App Router (pages)
│   │   ├── components/         # Componentes React
│   │   ├── hooks/              # Custom hooks
│   │   ├── lib/                # Utilidades
│   │   └── types/              # TypeScript types
│   │
│   └── api/                    # Backend Express
│       ├── src/
│       │   ├── controllers/    # Controladores
│       │   ├── services/       # Lógica de negocio
│       │   ├── middleware/     # Middleware
│       │   └── routes/         # Definición de rutas
│       ├── prisma/
│       │   └── schema.prisma   # Esquema de BD
│       └── tests/              # Tests
│
├── docs/                       # Documentación
├── .env.example                # Variables de entorno
├── package.json                # Monorepo config
└── turbo.json                  # Turbo config
```

---

## 📊 Base de Datos

### Entidades Principales

```
Users (Usuarios)
├── Teachers (Profesores)
├── Students (Estudiantes)
│
Courses (Cursos)
├── Modules (Módulos)
│   └── Materials (Materiales)
├── Enrollments (Inscripciones)
├── Grades (Calificaciones)
└── Attendance (Asistencia)

Payments (Pagos)
PaymentPlans (Planes)
```

Ver [Documentación de BD](./docs/DATABASE.md) para detalles completos.

---

## 🔐 Autenticación y Autorización

### Flujo de Autenticación
1. Usuario ingresa credenciales
2. Backend valida contra BD
3. Genera JWT (24h) y Refresh Token (7d)
4. Token se almacena en httpOnly cookie
5. Cada request incluye Authorization header
6. Middleware valida y decodifica JWT

### Roles y Permisos

| Acción | Admin | Teacher | Student |
|--------|-------|---------|---------|
| Gestionar usuarios | ✅ | ❌ | ❌ |
| Crear cursos | ✅ | ✅ | ❌ |
| Subir materiales | ✅ | ✅ | ❌ |
| Ver cursos | ✅ | ✅ | ✅ |
| Calificar | ✅ | ✅ | ❌ |
| Ver calificaciones | ✅ | ✅ | ✅ |

---

## 💳 Sistema de Pagos

### Plan Gratuito (Profesor)
- 1 estudiante gratis
- Crear cursos ilimitados
- Materiales limitados

### Compra de Slots
```
Plan Básico:    5 estudiantes por $29.99
Plan Pro:       10 estudiantes por $49.99
Plan Enterprise: 20 estudiantes por $89.99
```

### Proveedores Soportados
- **Shopify**: Recomendado para tiendas
- **TiendaNube**: Alternativa local
- **Stripe**: (Futuro)

---

## 📡 API REST

Base URL: `http://localhost:3001/api`

### Autenticación
```
POST   /auth/register          Registrar usuario
POST   /auth/login             Iniciar sesión
POST   /auth/logout            Cerrar sesión
POST   /auth/refresh-token     Refrescar token
GET    /auth/me                Datos del usuario actual
```

### Usuarios
```
GET    /users                  Listar usuarios (Admin)
GET    /users/:id              Obtener usuario
PUT    /users/:id              Actualizar usuario
DELETE /users/:id              Eliminar usuario (Admin)
```

### Cursos
```
GET    /courses                Listar cursos
POST   /courses                Crear curso (Admin/Teacher)
GET    /courses/:id            Obtener detalles
PUT    /courses/:id            Actualizar curso
DELETE /courses/:id            Eliminar curso
GET    /courses/:id/students   Listar estudiantes
```

### Módulos
```
GET    /modules?courseId=...   Listar módulos
POST   /modules                Crear módulo (Teacher)
PUT    /modules/:id            Actualizar módulo
DELETE /modules/:id            Eliminar módulo
```

### Materiales
```
POST   /materials              Crear/subir material
DELETE /materials/:id          Eliminar material
```

### Calificaciones
```
GET    /grades?courseId=...    Listar calificaciones
POST   /grades                 Crear/actualizar (Teacher)
```

### Asistencia
```
POST   /attendance             Registrar asistencia (Teacher)
GET    /attendance/...         Ver asistencia
```

### Pagos
```
GET    /payments/plans         Listar planes
POST   /payments/create-checkout  Crear pago
GET    /payments/history       Historial de pagos
```

Ver [Documentación completa de API](./docs/API.md)

---

## 🎨 Interfaz de Usuario

### Dashboard Admin
- 📊 Analytics con KPIs
- 👥 Gestión de usuarios
- 📚 Gestión de cursos
- 💳 Gestión de pagos
- 📋 Auditoría

### Dashboard Profesor
- 📖 Mis cursos
- 👨‍🎓 Mis estudiantes
- 📄 Subir materiales
- 📝 Calificar
- ✅ Tomar asistencia
- 💰 Comprar slots

### Dashboard Alumno
- 📚 Cursos inscritos
- 📥 Descargar materiales
- 📊 Ver calificaciones
- 📅 Calendario académico

---

## 🚢 Deployment

### Frontend (Vercel)
```bash
vercel deploy
```

### Backend (Railway/Render)
Conectar repositorio y configurar variables de entorno.

### Base de Datos
```
Opción 1: Supabase (PostgreSQL alojado)
Opción 2: Railway (Postgres integrado)
Opción 3: Render (Free tier)
```

Ver [Guía de Deployment](./docs/DEPLOYMENT.md)

---

## 🧪 Testing

```bash
# Ejecutar tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

---

## 📝 Documentación

- [Setup e Instalación](./docs/SETUP.md)
- [API REST](./docs/API.md)
- [Schema de Base de Datos](./docs/DATABASE.md)
- [Sistema de Autenticación](./docs/AUTHENTICATION.md)
- [Sistema de Pagos](./docs/PAYMENT_SYSTEM.md)
- [Deployment](./docs/DEPLOYMENT.md)
- [Arquitectura](./docs/ARQUITECTURA_EDUCAPLATFORM.md)

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para cambios grandes:

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

### Guías de Contribución
- Seguir [Conventional Commits](https://www.conventionalcommits.org/)
- Mantener 80%+ cobertura de tests
- Seguir eslint config

---

## 🐛 Reporte de Bugs

Usar [GitHub Issues](https://github.com/tu-usuario/educaplatform/issues)

Template:
```markdown
## Descripción
Descripción clara del bug

## Pasos para reproducir
1. ...
2. ...

## Comportamiento esperado
...

## Comportamiento actual
...

## Logs/Screenshots
...
```

---

## 📄 Licencia

Este proyecto está bajo licencia [MIT](./LICENSE).

---

## 💬 Soporte

- **Email**: support@educaplatform.com
- **Discord**: [Enlace de servidor]
- **Issues**: GitHub Issues
- **Documentación**: https://docs.educaplatform.com

---

## 🙏 Agradecimientos

Gracias a todos los contribuidores y usuarios que ayudan a mejorar EducaPlatform.

---

## 📈 Roadmap

### v1.1 (Q1 2024)
- [ ] Integración con Stripe
- [ ] Notificaciones por email
- [ ] Calendario académico avanzado
- [ ] Certificados automáticos

### v1.2 (Q2 2024)
- [ ] Videoclases en vivo (Zoom/Meet)
- [ ] Chat en tiempo real
- [ ] Sistema de tareas y entregas
- [ ] Foro de discusión

### v2.0 (Q3 2024)
- [ ] App móvil iOS/Android
- [ ] Sincronización offline
- [ ] Gamificación y badges
- [ ] API GraphQL
- [ ] Marketplace de cursos

---

**Hecho con ❤️ por el equipo de EducaPlatform**

*Última actualización: Enero 2024*
