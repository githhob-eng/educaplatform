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
  creado_por_id?: string;
  comunidad_id: string;
  fecha_creacion: string;
}

export default function Overview() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<any>({});
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    }
    loadData();
  }, []);

  const loadData = () => {
    const hierarchyData = localStorage.getItem('hierarchy_users');
    if (hierarchyData) {
      try {
        const users = JSON.parse(hierarchyData);
        setAllUsers(users);
        calculateStats(users);
      } catch (e) {
        setAllUsers([]);
      }
    }
  };

  const calculateStats = (users: User[]) => {
    if (!user) return;

    if (user.rol === 'ADMIN') {
      // STATS PARA ADMIN
      const myNetwork = getMyNetworkUsers(users);
      const activeAdmins = myNetwork.filter(u => u.rol === 'ADMIN' && u.estado === 'ACTIVE').length;
      const activeTeachers = myNetwork.filter(u => u.rol === 'TEACHER' && u.estado === 'ACTIVE').length;
      const activeStudents = myNetwork.filter(u => u.rol === 'STUDENT' && u.estado === 'ACTIVE').length;
      const blockedUsers = myNetwork.filter(u => u.estado === 'BLOCKED').length;

      setStats({
        totalUsers: myNetwork.length,
        activeAdmins,
        activeTeachers,
        activeStudents,
        blockedUsers,
        activityRate: myNetwork.length > 0 ? Math.round(((myNetwork.length - blockedUsers) / myNetwork.length) * 100) : 0,
      });

      // Actividad reciente (últimos 5 usuarios creados)
      const recent = myNetwork
        .sort((a: any, b: any) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime())
        .slice(0, 5);
      setRecentActivity(recent);
    } else if (user.rol === 'TEACHER') {
      // STATS PARA PROFESOR
      const myStudents = users.filter(u => u.creado_por_id === user.id && u.rol === 'STUDENT');
      const activeCourses = 5; // Simulado
      const assignmentsPending = 3; // Simulado

      setStats({
        totalStudents: myStudents.length,
        activeStudents: myStudents.filter(u => u.estado === 'ACTIVE').length,
        blockedStudents: myStudents.filter(u => u.estado === 'BLOCKED').length,
        activeCourses,
        assignmentsPending,
      });

      const recent = myStudents
        .sort((a: any, b: any) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime())
        .slice(0, 5);
      setRecentActivity(recent);
    } else if (user.rol === 'STUDENT') {
      // STATS PARA ESTUDIANTE
      const enrolledCourses = 4; // Simulado
      const completedAssignments = 12; // Simulado
      const pendingAssignments = 3; // Simulado
      const averageGrade = 8.5; // Simulado

      setStats({
        enrolledCourses,
        completedAssignments,
        pendingAssignments,
        averageGrade,
        attendanceRate: 95,
      });

      setRecentActivity([
        { nombre: 'Matemáticas I', tipo: 'Calificación', fecha: new Date(), valor: 8.5 },
        { nombre: 'Historia', tipo: 'Tarea entregada', fecha: new Date(Date.now() - 86400000), valor: '✅' },
        { nombre: 'Inglés', tipo: 'Nueva tarea', fecha: new Date(Date.now() - 172800000), valor: 'Pendiente' },
      ]);
    }
  };

  const getMyNetworkUsers = (users: User[]) => {
    const result: User[] = [];
    const visited = new Set();

    const traverse = (userId: string) => {
      if (visited.has(userId)) return;
      visited.add(userId);

      const userObj = users.find(u => u.id === userId);
      if (userObj && userObj.id !== user.id) {
        result.push(userObj);
      }

      const children = users.filter(u => u.creado_por_id === userId);
      children.forEach(child => traverse(child.id));
    };

    traverse(user.id);
    return result;
  };

  const styles = {
    container: { padding: '0' },
    header: { marginBottom: '30px' },
    title: { fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' },
    subtitle: { fontSize: '16px', color: '#6b7280' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' },
    card: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    cardTitle: { fontSize: '13px', fontWeight: '600', color: '#6b7280', marginBottom: '10px' },
    cardValue: { fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '5px' },
    cardSubtitle: { fontSize: '12px', color: '#9ca3af' },
    section: { backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '20px' },
    sectionTitle: { fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px' },
    table: { width: '100%', borderCollapse: 'collapse' as const },
    th: { padding: '12px 15px', backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb', textAlign: 'left' as const, fontWeight: '600', color: '#6b7280', fontSize: '12px' },
    td: { padding: '12px 15px', borderBottom: '1px solid #e5e7eb', fontSize: '13px', color: '#374151' },
    badge: { display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' },
    badgeAdmin: { backgroundColor: '#dbeafe', color: '#0c4a6e' },
    badgeTeacher: { backgroundColor: '#fef3c7', color: '#92400e' },
    badgeStudent: { backgroundColor: '#d1fae5', color: '#065f46' },
    badgeActive: { backgroundColor: '#d1fae5', color: '#065f46' },
    badgeBlocked: { backgroundColor: '#fee2e2', color: '#dc2626' },
  };

  if (!user) return <div style={{ padding: '40px', textAlign: 'center' }}>⏳ Cargando...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          {user.rol === 'ADMIN' ? '📊 Dashboard Administrativo' : user.rol === 'TEACHER' ? '📚 Mi Aula' : '🎓 Mi Dashboard'}
        </h1>
        <p style={styles.subtitle}>
          {user.rol === 'ADMIN' ? 'Visión general de tu red' : user.rol === 'TEACHER' ? 'Gestiona tu aula y estudiantes' : 'Tu progreso académico'}
        </p>
      </div>

      {/* TARJETAS DE ESTADÍSTICAS */}
      <div style={styles.grid}>
        {user.rol === 'ADMIN' && (
          <>
            <div style={styles.card}>
              <div style={styles.cardTitle}>👥 Total de Usuarios</div>
              <div style={styles.cardValue}>{stats.totalUsers || 0}</div>
              <div style={styles.cardSubtitle}>En tu red</div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>👨‍💼 Administradores</div>
              <div style={styles.cardValue}>{stats.activeAdmins || 0}</div>
              <div style={styles.cardSubtitle}>Activos</div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>👨‍🏫 Profesores</div>
              <div style={styles.cardValue}>{stats.activeTeachers || 0}</div>
              <div style={styles.cardSubtitle}>Activos</div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>👨‍🎓 Estudiantes</div>
              <div style={styles.cardValue}>{stats.activeStudents || 0}</div>
              <div style={styles.cardSubtitle}>Activos</div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>🚫 Bloqueados</div>
              <div style={styles.cardValue} style={{ color: '#ef4444' }}>{stats.blockedUsers || 0}</div>
              <div style={styles.cardSubtitle}>Necesitan atención</div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>📈 Tasa de Actividad</div>
              <div style={styles.cardValue} style={{ color: '#10b981' }}>{stats.activityRate || 0}%</div>
              <div style={styles.cardSubtitle}>Usuarios activos</div>
            </div>
          </>
        )}

        {user.rol === 'TEACHER' && (
          <>
            <div style={styles.card}>
              <div style={styles.cardTitle}>👨‍🎓 Total de Estudiantes</div>
              <div style={styles.cardValue}>{stats.totalStudents || 0}</div>
              <div style={styles.cardSubtitle}>Inscritos</div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>✅ Estudiantes Activos</div>
              <div style={styles.cardValue} style={{ color: '#10b981' }}>{stats.activeStudents || 0}</div>
              <div style={styles.cardSubtitle}>Participando</div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>📚 Cursos Activos</div>
              <div style={styles.cardValue}>{stats.activeCourses || 0}</div>
              <div style={styles.cardSubtitle}>En progreso</div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>📝 Tareas Pendientes</div>
              <div style={styles.cardValue} style={{ color: '#f59e0b' }}>{stats.assignmentsPending || 0}</div>
              <div style={styles.cardSubtitle}>Por revisar</div>
            </div>
          </>
        )}

        {user.rol === 'STUDENT' && (
          <>
            <div style={styles.card}>
              <div style={styles.cardTitle}>📚 Cursos Inscritos</div>
              <div style={styles.cardValue}>{stats.enrolledCourses || 0}</div>
              <div style={styles.cardSubtitle}>En progreso</div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>✅ Tareas Entregadas</div>
              <div style={styles.cardValue} style={{ color: '#10b981' }}>{stats.completedAssignments || 0}</div>
              <div style={styles.cardSubtitle}>Completadas</div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>📝 Tareas Pendientes</div>
              <div style={styles.cardValue} style={{ color: '#f59e0b' }}>{stats.pendingAssignments || 0}</div>
              <div style={styles.cardSubtitle}>Por entregar</div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>⭐ Promedio</div>
              <div style={styles.cardValue} style={{ color: '#4f46e5' }}>{stats.averageGrade || 0}</div>
              <div style={styles.cardSubtitle}>Calificación</div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>📊 Asistencia</div>
              <div style={styles.cardValue} style={{ color: '#10b981' }}>{stats.attendanceRate || 0}%</div>
              <div style={styles.cardSubtitle}>Presentismo</div>
            </div>
          </>
        )}
      </div>

      {/* ACTIVIDAD RECIENTE */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          {user.rol === 'ADMIN' ? '🆕 Usuarios Recientes' : user.rol === 'TEACHER' ? '🆕 Estudiantes Recientes' : '🆕 Actividad Reciente'}
        </h2>

        {recentActivity.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Nombre</th>
                {user.rol === 'ADMIN' && <th style={styles.th}>Rol</th>}
                {user.rol === 'ADMIN' && <th style={styles.th}>Estado</th>}
                {user.rol === 'TEACHER' && <th style={styles.th}>Estado</th>}
                {user.rol === 'STUDENT' && <th style={styles.th}>Tipo</th>}
                {user.rol === 'STUDENT' && <th style={styles.th}>Valor</th>}
                <th style={styles.th}>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((activity, i) => (
                <tr key={i}>
                  <td style={styles.td}><strong>{activity.nombre}</strong></td>
                  {user.rol === 'ADMIN' && (
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        ...(activity.rol === 'ADMIN' ? styles.badgeAdmin : activity.rol === 'TEACHER' ? styles.badgeTeacher : styles.badgeStudent)
                      }}>
                        {activity.rol}
                      </span>
                    </td>
                  )}
                  {user.rol === 'ADMIN' && (
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        ...(activity.estado === 'ACTIVE' ? styles.badgeActive : styles.badgeBlocked)
                      }}>
                        {activity.estado === 'ACTIVE' ? '✅ Activo' : '🚫 Bloqueado'}
                      </span>
                    </td>
                  )}
                  {user.rol === 'TEACHER' && (
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        ...(activity.estado === 'ACTIVE' ? styles.badgeActive : styles.badgeBlocked)
                      }}>
                        {activity.estado === 'ACTIVE' ? '✅ Activo' : '🚫 Bloqueado'}
                      </span>
                    </td>
                  )}
                  {user.rol === 'STUDENT' && <td style={styles.td}>{activity.tipo}</td>}
                  {user.rol === 'STUDENT' && <td style={styles.td}>{activity.valor}</td>}
                  <td style={styles.td}>{new Date(activity.fecha_creacion || activity.fecha).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            Sin actividad reciente
          </div>
        )}
      </div>

      {/* ACCIONES RÁPIDAS */}
      {user.rol === 'ADMIN' && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>⚡ Acciones Rápidas</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => router.push('/dashboard/network')} style={{
              padding: '10px 20px',
              backgroundColor: '#4f46e5',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px'
            }}>🌐 Ir a Gestión 360°</button>
            <button onClick={() => router.push('/dashboard/admins')} style={{
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px'
            }}>👨‍💼 Gestionar Admins</button>
            <button onClick={() => router.push('/dashboard/teachers')} style={{
              padding: '10px 20px',
              backgroundColor: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px'
            }}>👨‍🏫 Gestionar Profesores</button>
          </div>
        </div>
      )}
    </div>
  );
}
