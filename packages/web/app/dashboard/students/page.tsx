// packages/web/app/dashboard/student/page.tsx
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
}

export default function StudentPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [blockingId, setBlockingId] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    dni: '',
    password: '',
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      // ✅ ADMIN y TEACHER pueden acceder
      if (!['ADMIN', 'TEACHER'].includes(parsedUser.rol)) {
        router.push('/dashboard/overview');
        return;
      }
    }
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/users');
      const data = await response.json();
      const allUsersData = data.users || [];
      setAllUsers(allUsersData);

      const hierarchyData = localStorage.getItem('hierarchy_users');
      let studentList: User[] = [];

      if (hierarchyData) {
        const hierarchyUsers = JSON.parse(hierarchyData);
        studentList = hierarchyUsers.filter((u: User) => u.rol === 'STUDENT');
      } else {
        studentList = allUsersData.filter((u: User) => u.rol === 'STUDENT');
      }

      setStudents(studentList);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  // ✅ SOLO ver estudiantes creados por mí
  const getVisibleStudents = (): User[] => {
    if (!user) return [];

    return students.filter(s => s.creado_por_id === user.id);
  };

  const canDeleteStudent = (studentId: string): { can: boolean; reason: string } => {
    const student = students.find(s => s.id === studentId);
    if (!student) return { can: false, reason: 'Estudiante no existe' };

    // Solo si lo creé yo directamente
    if (student.creado_por_id === user.id) {
      return { can: true, reason: 'Puedes eliminar este estudiante' };
    }

    return { can: false, reason: 'Solo puedes eliminar tus propios estudiantes' };
  };

  const handleCreate = () => {
    if (!formData.nombre.trim() || !formData.email.trim() || !formData.dni.trim() || !formData.password.trim()) {
      setMessage('⚠️ Completa todos los campos');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (students.some(s => s.dni === formData.dni)) {
      setMessage('⚠️ El DNI ya existe');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (students.some(s => s.email === formData.email)) {
      setMessage('⚠️ El email ya existe');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const newStudent: User = {
      id: 'user-' + Date.now(),
      nombre: formData.nombre,
      email: formData.email,
      dni: formData.dni,
      password: formData.password,
      rol: 'STUDENT',
      estado: 'ACTIVE',
      creado_por_id: user.id,
      comunidad_id: user.comunidad_id,
    };

    const updated = [...students, newStudent];
    setStudents(updated);
    
    const hierarchyUsers = localStorage.getItem('hierarchy_users');
    const allHierarchyUsers = hierarchyUsers ? JSON.parse(hierarchyUsers) : [];
    allHierarchyUsers.push(newStudent);
    localStorage.setItem('hierarchy_users', JSON.stringify(allHierarchyUsers));

    setMessage('✅ Estudiante creado correctamente');
    setFormData({ nombre: '', email: '', dni: '', password: '' });
    setShowCreateForm(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleBlock = (studentId: string) => {
    if (!blockReason.trim()) {
      setMessage('⚠️ Escribe un motivo de bloqueo');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const updated = students.map(s =>
      s.id === studentId
        ? { ...s, estado: 'BLOCKED', motivo_bloqueo: blockReason }
        : s
    );

    setStudents(updated);
    
    const hierarchyUsers = localStorage.getItem('hierarchy_users');
    const allHierarchyUsers = hierarchyUsers ? JSON.parse(hierarchyUsers) : [];
    const filtered = allHierarchyUsers.map((u: User) =>
      u.id === studentId ? { ...u, estado: 'BLOCKED', motivo_bloqueo: blockReason } : u
    );
    localStorage.setItem('hierarchy_users', JSON.stringify(filtered));

    setMessage('✅ Estudiante bloqueado');
    setBlockingId(null);
    setBlockReason('');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleUnblock = (studentId: string) => {
    const updated = students.map(s =>
      s.id === studentId
        ? { ...s, estado: 'ACTIVE', motivo_bloqueo: '' }
        : s
    );

    setStudents(updated);
    
    const hierarchyUsers = localStorage.getItem('hierarchy_users');
    const allHierarchyUsers = hierarchyUsers ? JSON.parse(hierarchyUsers) : [];
    const filtered = allHierarchyUsers.map((u: User) =>
      u.id === studentId ? { ...u, estado: 'ACTIVE', motivo_bloqueo: '' } : u
    );
    localStorage.setItem('hierarchy_users', JSON.stringify(filtered));

    setMessage('✅ Estudiante desbloqueado');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDelete = (studentId: string) => {
    const validation = canDeleteStudent(studentId);
    if (!validation.can) {
      setMessage('⚠️ ' + validation.reason);
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const updated = students.filter(s => s.id !== studentId);
    setStudents(updated);
    
    const hierarchyUsers = localStorage.getItem('hierarchy_users');
    const allHierarchyUsers = hierarchyUsers ? JSON.parse(hierarchyUsers) : [];
    const filtered = allHierarchyUsers.filter((u: User) => u.id !== studentId);
    localStorage.setItem('hierarchy_users', JSON.stringify(filtered));

    setMessage('✅ Estudiante eliminado');
    setDeleteConfirm(null);
    setTimeout(() => setMessage(''), 3000);
  };

  const styles = {
    container: { padding: '0' },
    header: { marginBottom: '30px' },
    title: { fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' },
    subtitle: { fontSize: '16px', color: '#6b7280' },
    warning: { padding: '12px 16px', backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', fontWeight: '600' },
    message: {
      padding: '12px 16px',
      borderRadius: '8px',
      marginBottom: '20px',
      fontSize: '14px',
      fontWeight: '600',
      backgroundColor: '#d1fae5',
      color: '#065f46',
      border: '1px solid #a7f3d0',
    },
    errorMessage: {
      backgroundColor: '#fee2e2',
      color: '#dc2626',
      borderColor: '#fecaca',
    },
    button: { padding: '10px 20px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', marginBottom: '20px' },
    section: { backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    sectionTitle: { fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px' },
    form: { backgroundColor: '#f9fafb', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e5e7eb' },
    formGroup: { marginBottom: '15px' },
    label: { display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#374151' },
    input: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' as const },
    textarea: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' as const, minHeight: '80px' },
    table: { width: '100%', borderCollapse: 'collapse' as const },
    th: { padding: '12px 15px', backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb', textAlign: 'left' as const, fontWeight: '600', color: '#6b7280', fontSize: '12px' },
    td: { padding: '12px 15px', borderBottom: '1px solid #e5e7eb', fontSize: '13px', color: '#374151' },
    badge: { display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' },
    badgeActive: { backgroundColor: '#d1fae5', color: '#065f46' },
    badgeBlocked: { backgroundColor: '#fee2e2', color: '#dc2626' },
    smallButton: { padding: '6px 10px', fontSize: '11px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' },
    deleteBtn: { backgroundColor: '#ef4444', color: '#fff' },
    blockBtn: { backgroundColor: '#f59e0b', color: '#fff' },
    unblockBtn: { backgroundColor: '#10b981', color: '#fff' },
    modal: { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', maxWidth: '400px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' },
    emptyState: { textAlign: 'center' as const, padding: '40px', color: '#6b7280' },
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>⏳ Cargando...</div>;

  if (user && !['ADMIN', 'TEACHER'].includes(user.rol)) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>❌ Acceso Denegado</h1>
        </div>
        <div style={{
          ...styles.message,
          ...styles.errorMessage,
        }}>
          Solo administradores y profesores pueden gestionar estudiantes
        </div>
      </div>
    );
  }

  const visibleStudents = getVisibleStudents();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>👥 Gestión de Estudiantes</h1>
        <p style={styles.subtitle}>Administra tus estudiantes</p>
      </div>

      <div style={styles.warning}>
        🔒 Aislamiento: Solo ves estudiantes que creaste tú
      </div>

      {message && (
        <div style={{
          ...styles.message,
          ...(message.includes('Error') || message.includes('⚠️') ? styles.errorMessage : {}),
        }}>
          {message}
        </div>
      )}

      <button style={styles.button} onClick={() => setShowCreateForm(!showCreateForm)}>
        {showCreateForm ? '✕ Cancelar' : '➕ Crear Estudiante'}
      </button>

      {showCreateForm && (
        <div style={styles.form}>
          <h3 style={{ marginBottom: '15px', fontSize: '14px', fontWeight: '600' }}>Crear Nuevo Estudiante</h3>
          <div style={styles.formGroup}>
            <label style={styles.label}>Nombre Completo</label>
            <input
              type="text"
              placeholder="Ej: María García"
              style={styles.input}
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              placeholder="estudiante@educaplatform.com"
              style={styles.input}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>DNI</label>
            <input
              type="text"
              placeholder="12345678"
              style={styles.input}
              value={formData.dni}
              onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              style={styles.input}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              style={{ ...styles.button, backgroundColor: '#6b7280', flex: 1 }}
              onClick={() => {
                setShowCreateForm(false);
                setFormData({ nombre: '', email: '', dni: '', password: '' });
              }}
            >
              Cancelar
            </button>
            <button style={{ ...styles.button, flex: 1 }} onClick={handleCreate}>
              Crear
            </button>
          </div>
        </div>
      )}

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Mis Estudiantes ({visibleStudents.length})</h2>
        {visibleStudents.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Nombre</th>
                <th style={styles.th}>DNI</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Estado</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibleStudents.map(student => (
                <tr key={student.id}>
                  <td style={styles.td}><strong>{student.nombre}</strong></td>
                  <td style={styles.td}>{student.dni}</td>
                  <td style={styles.td}>{student.email}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      ...(student.estado === 'ACTIVE' ? styles.badgeActive : styles.badgeBlocked),
                    }}>
                      {student.estado === 'ACTIVE' ? '✅ Activo' : '🚫 Bloqueado'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {student.estado === 'ACTIVE' ? (
                        <button
                          style={{ ...styles.smallButton, ...styles.blockBtn }}
                          onClick={() => setBlockingId(student.id)}
                        >
                          🚫 Bloquear
                        </button>
                      ) : (
                        <button
                          style={{ ...styles.smallButton, ...styles.unblockBtn }}
                          onClick={() => handleUnblock(student.id)}
                        >
                          ✅ Desbloquear
                        </button>
                      )}
                      <button
                        style={{ ...styles.smallButton, ...styles.deleteBtn }}
                        onClick={() => setDeleteConfirm(student.id)}
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={styles.emptyState}>
            <p>👥 No hay estudiantes creados</p>
          </div>
        )}
      </div>

      {blockingId && (
        <div style={styles.modal} onClick={() => setBlockingId(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>🚫 Bloquear Estudiante</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px' }}>¿Por qué deseas bloquear?</p>
            <textarea
              placeholder="Motivo del bloqueo..."
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              style={styles.textarea}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '15px' }}>
              <button style={{ ...styles.button, backgroundColor: '#6b7280' }} onClick={() => setBlockingId(null)}>
                Cancelar
              </button>
              <button style={{ ...styles.button, backgroundColor: '#f59e0b' }} onClick={() => handleBlock(blockingId)}>
                Bloquear
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div style={styles.modal} onClick={() => setDeleteConfirm(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>⚠️ Eliminar Estudiante</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
              ¿Realmente deseas borrar a <strong>#{students.find(s => s.id === deleteConfirm)?.nombre}</strong>?
            </p>
            <p style={{ fontSize: '12px', color: '#dc2626', fontWeight: '600', marginBottom: '20px' }}>
              (No se puede deshacer)
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button style={{ ...styles.button, backgroundColor: '#6b7280' }} onClick={() => setDeleteConfirm(null)}>
                Cancelar
              </button>
              <button style={{ ...styles.button, backgroundColor: '#ef4444' }} onClick={() => handleDelete(deleteConfirm)}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
