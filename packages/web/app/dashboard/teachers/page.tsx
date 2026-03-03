// packages/web/app/dashboard/teachers/page.tsx
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

export default function TeachersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
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
      // ✅ SOLO ADMIN puede acceder a esta página
      if (parsedUser.rol !== 'ADMIN') {
        router.push('/dashboard/overview');
        return;
      }
    }
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await fetch('http://https://educaplatform-bg8vrm5zl-premedics-projects.vercel.app/api/auth/users');
      const data = await response.json();
      const allUsersData = data.users || [];
      setAllUsers(allUsersData);

      const hierarchyData = localStorage.getItem('hierarchy_users');
      let teacherList: User[] = [];

      if (hierarchyData) {
        const hierarchyUsers = JSON.parse(hierarchyData);
        teacherList = hierarchyUsers.filter((u: User) => u.rol === 'TEACHER');
      } else {
        teacherList = allUsersData.filter((u: User) => u.rol === 'TEACHER');
      }

      setTeachers(teacherList);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  // ✅ SOLO ver profesores creados por mí o por mi descendencia (ADMIN solamente)
  const getVisibleTeachers = (): User[] => {
    if (!user || user.rol !== 'ADMIN') return [];

    const visible = teachers.filter(t => {
      // Si lo creé yo directamente
      if (t.creado_por_id === user.id) return true;
      
      // Si lo creó mi descendencia admin
      const creator = allUsers.find(u => u.id === t.creado_por_id);
      if (creator && isInMyDescendants(creator.id)) return true;
      
      return false;
    });

    return visible;
  };

  // ✅ Verificar si un usuario está en mi descendencia admin
  const isInMyDescendants = (targetId: string): boolean => {
    const target = allUsers.find(u => u.id === targetId);
    if (!target || target.rol !== 'ADMIN') return false;

    let currentId = target.id;
    while (true) {
      const current = allUsers.find(u => u.id === currentId);
      if (!current || !current.creado_por_id) break;
      
      if (current.creado_por_id === user.id) return true;
      currentId = current.creado_por_id;
    }

    return false;
  };

  // ✅ Solo ADMIN puede eliminar sus profesores
  const canDeleteTeacher = (teacherId: string): { can: boolean; reason: string } => {
    if (user.rol !== 'ADMIN') {
      return { can: false, reason: 'Solo admins pueden eliminar profesores' };
    }

    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) return { can: false, reason: 'Profesor no existe' };

    // Solo si lo creé yo directamente
    if (teacher.creado_por_id === user.id) {
      return { can: true, reason: 'Puedes eliminar este profesor' };
    }

    return { can: false, reason: 'Solo puedes eliminar tus propios profesores' };
  };

  const handleCreate = () => {
    // ✅ Validación adicional
    if (user.rol !== 'ADMIN') {
      setMessage('⚠️ Solo los administradores pueden crear profesores');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (!formData.nombre.trim() || !formData.email.trim() || !formData.dni.trim() || !formData.password.trim()) {
      setMessage('⚠️ Completa todos los campos');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (teachers.some(t => t.dni === formData.dni)) {
      setMessage('⚠️ El DNI ya existe');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (teachers.some(t => t.email === formData.email)) {
      setMessage('⚠️ El email ya existe');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const newTeacher: User = {
      id: 'user-' + Date.now(),
      nombre: formData.nombre,
      email: formData.email,
      dni: formData.dni,
      password: formData.password,
      rol: 'TEACHER',
      estado: 'ACTIVE',
      creado_por_id: user.id,
      comunidad_id: user.comunidad_id,
    };

    const updated = [...teachers, newTeacher];
    setTeachers(updated);
    
    const hierarchyUsers = localStorage.getItem('hierarchy_users');
    const allHierarchyUsers = hierarchyUsers ? JSON.parse(hierarchyUsers) : [];
    allHierarchyUsers.push(newTeacher);
    localStorage.setItem('hierarchy_users', JSON.stringify(allHierarchyUsers));

    setMessage('✅ Profesor creado correctamente');
    setFormData({ nombre: '', email: '', dni: '', password: '' });
    setShowCreateForm(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDelete = (teacherId: string) => {
    const validation = canDeleteTeacher(teacherId);
    if (!validation.can) {
      setMessage('⚠️ ' + validation.reason);
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const updated = teachers.filter(t => t.id !== teacherId);
    setTeachers(updated);
    
    const hierarchyUsers = localStorage.getItem('hierarchy_users');
    const allHierarchyUsers = hierarchyUsers ? JSON.parse(hierarchyUsers) : [];
    const filtered = allHierarchyUsers.filter((u: User) => u.id !== teacherId);
    localStorage.setItem('hierarchy_users', JSON.stringify(filtered));

    setMessage('✅ Profesor eliminado');
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
    table: { width: '100%', borderCollapse: 'collapse' as const },
    th: { padding: '12px 15px', backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb', textAlign: 'left' as const, fontWeight: '600', color: '#6b7280', fontSize: '12px' },
    td: { padding: '12px 15px', borderBottom: '1px solid #e5e7eb', fontSize: '13px', color: '#374151' },
    smallButton: { padding: '6px 10px', fontSize: '11px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' },
    deleteBtn: { backgroundColor: '#ef4444', color: '#fff', opacity: 1, cursor: 'pointer' },
    deleteBtnDisabled: { backgroundColor: '#ef4444', color: '#fff', opacity: 0.5, cursor: 'not-allowed' },
    modal: { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', maxWidth: '400px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' },
    emptyState: { textAlign: 'center' as const, padding: '40px', color: '#6b7280' },
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>⏳ Cargando...</div>;

  // ✅ Si no es ADMIN, mostrar error
  if (user && user.rol !== 'ADMIN') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>❌ Acceso Denegado</h1>
        </div>
        <div style={{
          ...styles.message,
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          borderColor: '#fecaca',
        }}>
          Solo los administradores pueden gestionar profesores
        </div>
      </div>
    );
  }

  const visibleTeachers = getVisibleTeachers();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>👨‍🏫 Gestión de Profesores</h1>
        <p style={styles.subtitle}>Crea y administra profesores (solo admins)</p>
      </div>

      <div style={styles.warning}>
        🔒 Aislamiento: Solo ves profesores que creaste tú o tu descendencia admin directa
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
        {showCreateForm ? '✕ Cancelar' : '➕ Crear Profesor'}
      </button>

      {showCreateForm && (
        <div style={styles.form}>
          <h3 style={{ marginBottom: '15px', fontSize: '14px', fontWeight: '600' }}>Crear Nuevo Profesor</h3>
          <div style={styles.formGroup}>
            <label style={styles.label}>Nombre Completo</label>
            <input
              type="text"
              placeholder="Ej: Juan García"
              style={styles.input}
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              placeholder="profesor@educaplatform.com"
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
        <h2 style={styles.sectionTitle}>Mis Profesores ({visibleTeachers.length})</h2>
        {visibleTeachers.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Nombre</th>
                <th style={styles.th}>DNI</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibleTeachers.map(teacher => {
                const canDelete = canDeleteTeacher(teacher.id).can;
                return (
                  <tr key={teacher.id}>
                    <td style={styles.td}><strong>{teacher.nombre}</strong></td>
                    <td style={styles.td}>{teacher.dni}</td>
                    <td style={styles.td}>{teacher.email}</td>
                    <td style={styles.td}>
                      <button
                        style={{ ...styles.smallButton, ...(canDelete ? styles.deleteBtn : styles.deleteBtnDisabled) }}
                        onClick={() => canDelete && setDeleteConfirm(teacher.id)}
                        disabled={!canDelete}
                      >
                        🗑️ Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={styles.emptyState}>
            <p>👨‍🏫 No hay profesores creados</p>
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div style={styles.modal} onClick={() => setDeleteConfirm(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>⚠️ Eliminar Profesor</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
              ¿Realmente deseas borrar a <strong>#{teachers.find(t => t.id === deleteConfirm)?.nombre}</strong>?
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
