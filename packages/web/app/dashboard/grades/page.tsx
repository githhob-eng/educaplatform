// packages/web/app/dashboard/grades/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Grade {
  id: string;
  estudiante_id: string;
  estudiante_nombre: string;
  estudiante_dni: string;
  tipo: 'EXAMEN' | 'TAREA';
  materia: string;
  calificacion: number;
  comentario: string;
  fecha: string;
  profesor_nombre: string;
}

export default function GradesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    estudiante_id: '',
    tipo: 'EXAMEN' as const,
    materia: '',
    calificacion: 7,
    comentario: '',
  });
  const [filterEstudiante, setFilterEstudiante] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      if (!['ADMIN', 'TEACHER'].includes(parsedUser.rol)) {
        router.push('/dashboard/overview');
      }
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch('https://educaplatform-bg8vrm5zl-premedics-projects.vercel.app/api/auth/users');
      const data = await response.json();
      const studentList = (data.users || []).filter((u: any) => u.rol === 'STUDENT');
      setStudents(studentList);
    } catch (error) {
      console.error('Error:', error);
    }

    // Calificaciones mock
    const mockGrades: Grade[] = [
      {
        id: '1',
        estudiante_id: '1',
        estudiante_nombre: 'Juan García',
        estudiante_dni: '12345678',
        tipo: 'EXAMEN',
        materia: 'Matemáticas Avanzadas',
        calificacion: 8.5,
        comentario: 'Excelente desempeño',
        fecha: '2024-02-15',
        profesor_nombre: 'Prof. Carlos',
      },
      {
        id: '2',
        estudiante_id: '2',
        estudiante_nombre: 'María López',
        estudiante_dni: '87654321',
        tipo: 'TAREA',
        materia: 'Programación Web',
        calificacion: 9.0,
        comentario: 'Código limpio y bien documentado',
        fecha: '2024-02-10',
        profesor_nombre: 'Prof. Carlos',
      },
    ];

    setGrades(mockGrades);
    setLoading(false);
  };

  const handleCreateGrade = () => {
    if (!formData.estudiante_id || !formData.materia) {
      setMessage('⚠️ Completa todos los campos');
      return;
    }

    const student = students.find(s => s.id === formData.estudiante_id);
    const newGrade: Grade = {
      id: String(Date.now()),
      estudiante_id: formData.estudiante_id,
      estudiante_nombre: student?.nombre || 'Desconocido',
      estudiante_dni: student?.dni || '-',
      tipo: formData.tipo,
      materia: formData.materia,
      calificacion: formData.calificacion,
      comentario: formData.comentario,
      fecha: new Date().toISOString().split('T')[0],
      profesor_nombre: user?.nombre || 'Prof.',
    };

    setGrades([...grades, newGrade]);
    setMessage('✅ Calificación registrada');
    setFormData({ estudiante_id: '', tipo: 'EXAMEN', materia: '', calificacion: 7, comentario: '' });
    setShowCreateForm(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteGrade = (id: string) => {
    setGrades(grades.filter(g => g.id !== id));
    setMessage('✅ Calificación eliminada');
    setTimeout(() => setMessage(''), 3000);
  };

  const filteredGrades = filterEstudiante
    ? grades.filter(g => g.estudiante_nombre.toLowerCase().includes(filterEstudiante.toLowerCase()) || g.estudiante_dni.includes(filterEstudiante))
    : grades;

  const promedioGeneral = grades.length > 0
    ? (grades.reduce((sum, g) => sum + g.calificacion, 0) / grades.length).toFixed(2)
    : '0.00';

  const styles = {
    container: { padding: '0' },
    header: { marginBottom: '30px' },
    title: { fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' },
    subtitle: { fontSize: '16px', color: '#6b7280' },
    message: { padding: '12px 16px', borderRadius: '8px', backgroundColor: '#d1fae5', color: '#065f46', marginBottom: '20px', border: '1px solid #a7f3d0' },
    stats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' },
    statCard: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' as const },
    statValue: { fontSize: '28px', fontWeight: 'bold', color: '#4f46e5' },
    statLabel: { fontSize: '12px', color: '#6b7280' },
    button: { padding: '10px 20px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
    section: { backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    sectionTitle: { fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' },
    form: { backgroundColor: '#f9fafb', padding: '20px', borderRadius: '12px', marginBottom: '20px' },
    input: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', marginBottom: '12px', fontFamily: 'inherit', boxSizing: 'border-box' as const },
    select: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', marginBottom: '12px', fontFamily: 'inherit' },
    table: { width: '100%', borderCollapse: 'collapse' as const },
    th: { padding: '12px', backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb', textAlign: 'left' as const, fontWeight: '600', fontSize: '12px', color: '#6b7280' },
    td: { padding: '12px', borderBottom: '1px solid #e5e7eb', fontSize: '13px' },
    badge: { display: 'inline-block', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' },
    badgeExamen: { backgroundColor: '#dbeafe', color: '#0c4a6e' },
    badgeTarea: { backgroundColor: '#fce7f3', color: '#9d174d' },
    deleteButton: { padding: '4px 8px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
    emptyState: { textAlign: 'center' as const, padding: '40px', color: '#6b7280' },
  };

  if (loading) return <div style={{ padding: '40px' }}>⏳ Cargando...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📊 Calificaciones</h1>
        <p style={styles.subtitle}>Registra y gestiona las calificaciones de los estudiantes</p>
      </div>

      {message && <div style={styles.message}>{message}</div>}

      {/* ESTADÍSTICAS */}
      <div style={styles.stats}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{grades.length}</div>
          <div style={styles.statLabel}>Total Calificaciones</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{promedioGeneral}</div>
          <div style={styles.statLabel}>Promedio General</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{grades.filter(g => g.tipo === 'EXAMEN').length}</div>
          <div style={styles.statLabel}>Exámenes</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{grades.filter(g => g.tipo === 'TAREA').length}</div>
          <div style={styles.statLabel}>Tareas</div>
        </div>
      </div>

      {['ADMIN', 'TEACHER'].includes(user?.rol) && (
        <div style={{ marginBottom: '20px' }}>
          <button style={styles.button} onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? '✕ Cancelar' : '➕ Asignar Calificación'}
          </button>
        </div>
      )}

      {showCreateForm && (
        <div style={styles.form}>
          <h3 style={{ marginBottom: '15px', fontSize: '14px', fontWeight: '600' }}>Nueva Calificación</h3>
          <select style={styles.select} value={formData.estudiante_id} onChange={(e) => setFormData({ ...formData, estudiante_id: e.target.value })}>
            <option value="">-- Selecciona un estudiante --</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.nombre} ({s.dni})</option>
            ))}
          </select>
          <select style={styles.select} value={formData.tipo} onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}>
            <option value="EXAMEN">📝 Examen</option>
            <option value="TAREA">📋 Tarea</option>
          </select>
          <input style={styles.input} type="text" placeholder="Materia/Tema" value={formData.materia} onChange={(e) => setFormData({ ...formData, materia: e.target.value })} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <input style={{ ...styles.input, flex: 1 }} type="number" placeholder="Calificación (0-10)" value={formData.calificacion} onChange={(e) => setFormData({ ...formData, calificacion: parseFloat(e.target.value) })} min="0" max="10" step="0.5" />
          </div>
          <textarea style={{ ...styles.input, minHeight: '60px' }} placeholder="Comentario (opcional)" value={formData.comentario} onChange={(e) => setFormData({ ...formData, comentario: e.target.value })} />
          <button style={{ ...styles.button, width: '100%' }} onClick={handleCreateGrade}>✅ Registrar</button>
        </div>
      )}

      <div style={styles.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={styles.sectionTitle}>Registro de Calificaciones ({filteredGrades.length})</h2>
          <input type="text" placeholder="Buscar por nombre o DNI..." style={{ ...styles.input, width: '250px', marginBottom: 0 }} value={filterEstudiante} onChange={(e) => setFilterEstudiante(e.target.value)} />
        </div>

        {filteredGrades.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Estudiante</th>
                <th style={styles.th}>DNI</th>
                <th style={styles.th}>Tipo</th>
                <th style={styles.th}>Materia</th>
                <th style={styles.th}>Calificación</th>
                <th style={styles.th}>Fecha</th>
                <th style={styles.th}>Profesor</th>
                {['ADMIN', 'TEACHER'].includes(user?.rol) && <th style={styles.th}>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filteredGrades.map(grade => (
                <tr key={grade.id}>
                  <td style={styles.td}><strong>{grade.estudiante_nombre}</strong></td>
                  <td style={styles.td}>{grade.estudiante_dni}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, ...(grade.tipo === 'EXAMEN' ? styles.badgeExamen : styles.badgeTarea) }}>
                      {grade.tipo === 'EXAMEN' ? '📝 Examen' : '📋 Tarea'}
                    </span>
                  </td>
                  <td style={styles.td}>{grade.materia}</td>
                  <td style={styles.td}><strong style={{ fontSize: '14px', color: grade.calificacion >= 7 ? '#10b981' : '#ef4444' }}>{grade.calificacion}/10</strong></td>
                  <td style={styles.td}>{new Date(grade.fecha).toLocaleDateString()}</td>
                  <td style={styles.td}>{grade.profesor_nombre}</td>
                  {['ADMIN', 'TEACHER'].includes(user?.rol) && (
                    <td style={styles.td}>
                      <button style={styles.deleteButton} onClick={() => handleDeleteGrade(grade.id)}>🗑️</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={styles.emptyState}>
            <p>📊 No hay calificaciones registradas</p>
          </div>
        )}
      </div>
    </div>
  );
}
