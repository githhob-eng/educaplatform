// packages/web/app/dashboard/courses/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Course {
  id: string;
  nombre: string;
  descripcion: string;
  capacidad: number;
  inscritos: number;
  profesor_id?: string;
  profesor_nombre?: string;
  estado: 'ACTIVO' | 'SUSPENDIDO';
  fechaCreacion: string;
}

export default function CoursesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([
    {
      id: '1',
      nombre: 'Matemáticas Avanzadas',
      descripcion: 'Curso de cálculo y álgebra lineal',
      capacidad: 30,
      inscritos: 25,
      profesor_id: '2',
      profesor_nombre: 'Prof. Carlos',
      estado: 'ACTIVO',
      fechaCreacion: '2024-01-15',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    capacidad: 30,
    profesor_id: '',
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      if (!['ADMIN', 'TEACHER'].includes(parsedUser.rol)) {
        router.push('/dashboard/overview');
      }
    }
    setLoading(false);
  }, []);

  const handleCreate = () => {
    if (!formData.nombre.trim()) {
      setMessage('⚠️ Completa todos los campos');
      return;
    }

    const newCourse: Course = {
      id: String(Date.now()),
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      capacidad: formData.capacidad,
      inscritos: 0,
      profesor_id: formData.profesor_id || undefined,
      profesor_nombre: formData.profesor_id ? 'Prof. ' + formData.profesor_id : 'Sin asignar',
      estado: 'ACTIVO',
      fechaCreacion: new Date().toISOString(),
    };

    setCourses([...courses, newCourse]);
    setMessage('✅ Curso creado exitosamente');
    setFormData({ nombre: '', descripcion: '', capacidad: 30, profesor_id: '' });
    setShowCreateForm(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleEdit = (course: Course) => {
    setEditingId(course.id);
    setFormData({
      nombre: course.nombre,
      descripcion: course.descripcion,
      capacidad: course.capacidad,
      profesor_id: course.profesor_id || '',
    });
  };

  const handleSaveEdit = () => {
    setCourses(courses.map(c =>
      c.id === editingId
        ? {
            ...c,
            nombre: formData.nombre,
            descripcion: formData.descripcion,
            capacidad: formData.capacidad,
          }
        : c
    ));
    setMessage('✅ Curso actualizado');
    setEditingId(null);
    setFormData({ nombre: '', descripcion: '', capacidad: 30, profesor_id: '' });
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDelete = (courseId: string) => {
    setCourses(courses.filter(c => c.id !== courseId));
    setMessage('✅ Curso eliminado');
    setDeleteConfirm(null);
    setTimeout(() => setMessage(''), 3000);
  };

  const styles = {
    container: { padding: '0' },
    header: { marginBottom: '30px' },
    title: { fontSize: '32px', fontWeight: 'bold', color: '#1f2937' },
    subtitle: { fontSize: '16px', color: '#6b7280' },
    message: { padding: '12px 16px', borderRadius: '8px', backgroundColor: '#d1fae5', color: '#065f46', marginBottom: '20px' },
    button: { padding: '10px 20px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
    section: { backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '20px' },
    sectionTitle: { fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
    card: { backgroundColor: '#f9fafb', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' },
    cardTitle: { fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' },
    cardDescription: { fontSize: '13px', color: '#6b7280', marginBottom: '15px' },
    cardActions: { display: 'flex', gap: '8px', flexWrap: 'wrap' as const },
    smallButton: { padding: '6px 12px', fontSize: '12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' },
    editButton: { backgroundColor: '#4f46e5', color: '#fff' },
    deleteButton: { backgroundColor: '#ef4444', color: '#fff' },
    form: { backgroundColor: '#f9fafb', padding: '20px', borderRadius: '12px', marginBottom: '20px' },
    input: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '12px', fontFamily: 'inherit', boxSizing: 'border-box' as const },
  };

  if (loading) return <div style={{ padding: '40px' }}>⏳ Cargando...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📚 Gestión de Cursos</h1>
        <p style={styles.subtitle}>Crea y administra los cursos</p>
      </div>

      {message && <div style={styles.message}>{message}</div>}

      {user?.rol === 'ADMIN' && (
        <button style={styles.button} onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? '✕ Cancelar' : '➕ Crear Curso'}
        </button>
      )}

      {showCreateForm && (
        <div style={styles.form}>
          <input style={styles.input} type="text" placeholder="Nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
          <textarea style={{ ...styles.input, minHeight: '80px' }} placeholder="Descripción" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} />
          <input style={styles.input} type="number" placeholder="Capacidad" value={formData.capacidad} onChange={(e) => setFormData({ ...formData, capacidad: parseInt(e.target.value) })} min="1" />
          <button style={{ ...styles.button, width: '100%' }} onClick={editingId ? handleSaveEdit : handleCreate}>
            {editingId ? 'Guardar' : 'Crear'}
          </button>
        </div>
      )}

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Cursos ({courses.length})</h2>
        <div style={styles.grid}>
          {courses.map(course => (
            <div key={course.id} style={styles.card}>
              <div style={styles.cardTitle}>{course.nombre}</div>
              <div style={styles.cardDescription}>{course.descripcion}</div>
              <div style={{ fontSize: '13px', marginBottom: '15px' }}>👥 {course.inscritos}/{course.capacidad}</div>
              <div style={styles.cardActions}>
                {user?.rol === 'ADMIN' && (
                  <>
                    <button style={{ ...styles.smallButton, ...styles.editButton }} onClick={() => handleEdit(course)}>✏️</button>
                    <button style={{ ...styles.smallButton, ...styles.deleteButton }} onClick={() => setDeleteConfirm(course.id)}>🗑️</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {deleteConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setDeleteConfirm(null)}>
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Eliminar Curso</h3>
            <p>¿Borrar <strong>#{courses.find(c => c.id === deleteConfirm)?.nombre}</strong>? (No se puede deshacer)</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button style={{ ...styles.button, backgroundColor: '#6b7280' }} onClick={() => setDeleteConfirm(null)}>Cancelar</button>
              <button style={{ ...styles.button, backgroundColor: '#ef4444' }} onClick={() => handleDelete(deleteConfirm)}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
