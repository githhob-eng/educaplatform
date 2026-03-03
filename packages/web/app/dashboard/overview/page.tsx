// packages/web/app/dashboard/overview/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  nombre: string;
  email: string;
  dni: string;
  rol: 'ADMIN' | 'TEACHER' | 'STUDENT';
  estado: 'ACTIVE' | 'BLOCKED';
  password: string;
  creado_por_id?: string;
  comunidad_id: string;
  motivo_bloqueo?: string;
  fecha_creacion: string;
}

export default function OverviewPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalUsers: 0,
    admins: 0,
    teachers: 0,
    students: 0,
    activeUsers: 0,
    blockedUsers: 0,
    activityRate: 0,
    totalStudents: 0,
    activeStudents: 0,
    activeCourses: 0,
    assignmentsPending: 0,
    enrolledCourses: 0,
    completedAssignments: 0,
    pendingAssignments: 0,
    averageGrade: 0,
    attendanceRate: 0,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        router.push('/login');
        setLoading(false);
        return;
      }

      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      const hierarchyData = localStorage.getItem('hierarchy_users');
      let users: User[] = [];

      if (hierarchyData) {
        try {
          users = JSON.parse(hierarchyData);
        } catch (e) {
          console.error('Error:', e);
        }
      }

      setAllUsers(users);

      // Calcular estadísticas
      const adminCount = users.filter(u => u.rol === 'ADMIN').length;
      const teacherCount = users.filter(u => u.rol === 'TEACHER').length;
      const studentCount = users.filter(u => u.rol === 'STUDENT').length;
      const activeCount = users.filter(u => u.estado === 'ACTIVE').length;
      const blockedCount = users.filter(u => u.estado === 'BLOCKED').length;

      setStats({
        totalUsers: users.length,
        admins: adminCount,
        teachers: teacherCount,
        students: studentCount,
        activeUsers: activeCount,
        blockedUsers: blockedCount,
        activityRate: users.length > 0 ? Math.round((activeCount / users.length) * 100) : 0,
        totalStudents: studentCount,
        activeStudents: users.filter(u => u.rol === 'STUDENT' && u.estado === 'ACTIVE').length,
        activeCourses: 0,
        assignmentsPending: 0,
        enrolledCourses: 0,
        completedAssignments: 0,
        pendingAssignments: 0,
        averageGrade: 0,
        attendanceRate: 85,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  }, [mounted, router]);

  if (!mounted || loading) {
    return (
      <div style={{ padding: '60px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
        <p style={{ fontSize: '18px', color: '#6b7280' }}>Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: '60px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
        <p>No hay sesión</p>
      </div>
    );
  }

  const styles = {
    container: { padding: '0' },
    header: { marginBottom: '30px' },
    title: { fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' },
    subtitle: { fontSize: '16px', color: '#6b7280' },
    cardsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '40px',
    },
    card: {
      backgroundColor: '#fff',
      padding: '24px',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    cardTitle: { fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '12px' },
    cardValue: { fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' },
    cardSubtitle: { fontSize: '12px', color: '#9ca3af' },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📊 Panel de Control</h1>
        <p style={styles.subtitle}>Bienvenido, {user.nombre}</p>
      </div>

      <div style={styles.cardsGrid}>
        {user.rol === 'ADMIN' && (
          <>
            <div style={styles.card}>
              <div style={styles.cardTitle}>👥 Total de Usuarios</div>
              <div style={styles.cardValue}>{stats.totalUsers}</div>
              <div style={styles.cardSubtitle}>En tu red</div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>👨‍💼 Administradores</div>
              <div style={styles.cardValue}>{stats.admins}</div>
              <div style={styles.cardSubtitle}>Activos</div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>👨‍🏫 Profesores</div>
              <div style={styles.cardValue}>{stats.teachers}</div>
              <div style={styles.cardSubtitle}>En servicio</div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>👨‍🎓 Estudiantes</div>
              <div style={styles.cardValue}>{stats.students}</div>
              <div style={styles.cardSubtitle}>Inscritos</div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>✅ Activos</div>
              <div style={{ ...styles.cardValue, color: '#10b981' }}>{stats.activeUsers}</div>
              <div style={styles.cardSubtitle}>En línea</div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>🚫 Bloqueados</div>
              <div style={{ ...styles.cardValue, color: '#ef4444' }}>{stats.blockedUsers}</div>
              <div style={styles.cardSubtitle}>Necesitan atención</div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>📈 Tasa de Actividad</div>
              <div style={{ ...styles.cardValue, color: '#10b981' }}>{stats.activityRate}%</div>
              <div style={styles.cardSubtitle}>Usuarios activos</div>
            </div>
          </>
        )}

        {user.rol === 'TEACHER' && (
          <>
            <div style={styles.card}>
              <div style={styles.cardTitle}>👨‍🎓 Total de Estudiantes</div>
              <div style={styles.cardValue}>{stats.totalStudents}</div>
              <div style={styles.cardSubtitle}>Inscritos</div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>✅ Estudiantes Activos</div>
              <div style={{ ...styles.cardValue, color: '#10b981' }}>{stats.activeStudents}</div>
              <div style={styles.cardSubtitle}>Participando</div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>📚 Cursos Activos</div>
              <div style={styles.cardValue}>{stats.activeCourses}</div>
              <div style={styles.cardSubtitle}>En progreso</div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>📝 Tareas Pendientes</div>
              <div style={{ ...styles.cardValue, color: '#f59e0b' }}>{stats.assignmentsPending}</div>
              <div style={styles.cardSubtitle}>Por revisar</div>
            </div>
          </>
        )}

        {user.rol === 'STUDENT' && (
          <>
            <div style={styles.card}>
              <div style={styles.cardTitle}>📚 Cursos Inscritos</div>
              <div style={styles.cardValue}>{stats.enrolledCourses}</div>
              <div style={styles.cardSubtitle}>En progreso</div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>✅ Tareas Entregadas</div>
              <div style={{ ...styles.cardValue, color: '#10b981' }}>{stats.completedAssignments}</div>
              <div style={styles.cardSubtitle}>Completadas</div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>📝 Tareas Pendientes</div>
              <div style={{ ...styles.cardValue, color: '#f59e0b' }}>{stats.pendingAssignments}</div>
              <div style={styles.cardSubtitle}>Por entregar</div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>⭐ Promedio</div>
              <div style={{ ...styles.cardValue, color: '#4f46e5' }}>{stats.averageGrade}</div>
              <div style={styles.cardSubtitle}>Calificación</div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>📊 Asistencia</div>
              <div style={{ ...styles.cardValue, color: '#10b981' }}>{stats.attendanceRate}%</div>
              <div style={styles.cardSubtitle}>Presentismo</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
