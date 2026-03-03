// packages/web/app/dashboard/users/page.tsx
'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  nombre: string;
  email: string;
  password?: string;
  rol: 'ADMIN' | 'TEACHER' | 'STUDENT';
  estado: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'STUDENT',
    estado: 'ACTIVE',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('https://educaplatform-bg8vrm5zl-premedics-projects.vercel.app/api/auth/users', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.nombre || !formData.email || !formData.password) {
      alert('Completa todos los campos');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (editingId) {
        const response = await fetch(`https://educaplatform-bg8vrm5zl-premedics-projects.vercel.app/api/auth/users/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            nombre: formData.nombre,
            email: formData.email,
            password: formData.password,
            rol: formData.rol,
            estado: formData.estado,
          }),
        });

        const data = await response.json();
        if (data.status === 'success') {
          fetchUsers();
          alert('✅ Usuario actualizado');
        } else {
          alert('❌ Error: ' + data.message);
          return;
        }
      } else {
        const response = await fetch('https://educaplatform-bg8vrm5zl-premedics-projects.vercel.app/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: formData.nombre,
            email: formData.email,
            password: formData.password,
            rol: formData.rol,
          }),
        });

        const data = await response.json();
        if (data.status === 'success') {
          fetchUsers();
          alert('✅ Usuario creado');
        } else {
          alert('❌ Error: ' + data.message);
          return;
        }
      }

      setFormData({ nombre: '', email: '', password: '', rol: 'STUDENT', estado: 'ACTIVE' });
      setEditingId(null);
      setShowForm(false);
    } catch (error) {
      alert('Error: ' + error);
    }
  };

  const handleEditUser = (user: User) => {
    setFormData({
      nombre: user.nombre,
      email: user.email,
      password: user.password || '',
      rol: user.rol,
      estado: user.estado,
    });
    setEditingId(user.id);
    setShowForm(true);
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('⚠️ ¿Estás SEGURO de que deseas ELIMINAR este usuario? No se puede deshacer.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://educaplatform-bg8vrm5zl-premedics-projects.vercel.app/api/auth/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.status === 'success') {
        fetchUsers();
        alert('✅ Usuario eliminado');
      } else {
        alert('❌ Error: ' + data.message);
      }
    } catch (error) {
      alert('Error: ' + error);
    }
  };

  const handleDisableUser = async (id: string) => {
    if (!confirm('¿Desactivar este usuario?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://educaplatform-bg8vrm5zl-premedics-projects.vercel.app/api/auth/users/${id}/disable`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.status === 'success') {
        fetchUsers();
        alert('✅ Usuario desactivado');
      } else {
        alert('❌ Error: ' + data.message);
      }
    } catch (error) {
      alert('Error: ' + error);
    }
  };

  const styles = {
    container: { marginBottom: '30px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    title: { fontSize: '28px', fontWeight: 'bold', color: '#1f2937' },
    stats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px' },
    statCard: { backgroundColor: '#fff', padding: '15px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' as const },
    statNumber: { fontSize: '24px', fontWeight: 'bold', color: '#4f46e5' },
    statLabel: { fontSize: '12px', color: '#6b7280', marginTop: '5px' },
    button: { padding: '10px 20px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
    table: { width: '100%', borderCollapse: 'collapse' as const, backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    th: { padding: '12px', backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb', textAlign: 'left' as const, fontWeight: '600', color: '#6b7280', fontSize: '11px' },
    td: { padding: '12px', borderBottom: '1px solid #e5e7eb', color: '#374151', fontSize: '13px' },
    badge: { display: 'inline-block', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' },
    badgeAdmin: { backgroundColor: '#fee2e2', color: '#991b1b' },
    badgeTeacher: { backgroundColor: '#fef3c7', color: '#92400e' },
    badgeStudent: { backgroundColor: '#d1fae5', color: '#065f46' },
    badgeActive: { backgroundColor: '#d1fae5', color: '#065f46' },
    badgeInactive: { backgroundColor: '#f3f4f6', color: '#6b7280' },
    actions: { display: 'flex', gap: '5px', flexWrap: 'wrap' as const },
    actionBtn: { padding: '5px 10px', fontSize: '11px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' },
    editBtn: { backgroundColor: '#3b82f6', color: '#fff' },
    deleteBtn: { backgroundColor: '#ef4444', color: '#fff' },
    disableBtn: { backgroundColor: '#f59e0b', color: '#fff' },
    modal: { display: 'none', position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    input: { padding: '8px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', fontFamily: 'inherit', width: '100%' },
    formGroup: { marginBottom: '15px', display: 'flex', flexDirection: 'column' as const, gap: '5px' },
    label: { fontWeight: '600', color: '#1f2937', fontSize: '13px' },
    buttonGroup: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '15px' },
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => u.rol === 'ADMIN').length,
    teachers: users.filter(u => u.rol === 'TEACHER').length,
    students: users.filter(u => u.rol === 'STUDENT').length,
    active: users.filter(u => u.estado === 'ACTIVE').length,
    inactive: users.filter(u => u.estado === 'INACTIVE').length,
  };

  const getRolBadge = (rol: string) => {
    const base = styles.badge;
    switch (rol) {
      case 'ADMIN': return { ...base, ...styles.badgeAdmin };
      case 'TEACHER': return { ...base, ...styles.badgeTeacher };
      case 'STUDENT': return { ...base, ...styles.badgeStudent };
      default: return base;
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>⏳ Cargando...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>👥 Gestión de Usuarios</h1>
        <button style={styles.button} onClick={() => { setFormData({ nombre: '', email: '', password: '', rol: 'STUDENT', estado: 'ACTIVE' }); setEditingId(null); setShowForm(true); }}>
          ➕ Nuevo Usuario
        </button>
      </div>

      <div style={styles.stats}>
        <div style={styles.statCard}><div style={styles.statNumber}>{stats.total}</div><div style={styles.statLabel}>Total</div></div>
        <div style={styles.statCard}><div style={styles.statNumber}>{stats.admins}</div><div style={styles.statLabel}>Admins</div></div>
        <div style={styles.statCard}><div style={styles.statNumber}>{stats.teachers}</div><div style={styles.statLabel}>Profesores</div></div>
        <div style={styles.statCard}><div style={styles.statNumber}>{stats.students}</div><div style={styles.statLabel}>Estudiantes</div></div>
        <div style={styles.statCard}><div style={styles.statNumber}>{stats.active}</div><div style={styles.statLabel}>Activos</div></div>
        <div style={styles.statCard}><div style={styles.statNumber}>{stats.inactive}</div><div style={styles.statLabel}>Inactivos</div></div>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Nombre</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Rol</th>
            <th style={styles.th}>Estado</th>
            <th style={styles.th}>Registro</th>
            <th style={styles.th}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td style={styles.td}><strong>{user.nombre}</strong></td>
              <td style={styles.td}>{user.email}</td>
              <td style={styles.td}><span style={getRolBadge(user.rol)}>{user.rol}</span></td>
              <td style={styles.td}><span style={{ ...styles.badge, ...(user.estado === 'ACTIVE' ? styles.badgeActive : styles.badgeInactive) }}>{user.estado}</span></td>
              <td style={styles.td}>{new Date(user.createdAt).toLocaleDateString('es-ES')}</td>
              <td style={styles.td}>
                <div style={styles.actions}>
                  <button style={{ ...styles.actionBtn, ...styles.editBtn }} onClick={() => handleEditUser(user)} title="Editar">✏️</button>
                  <button style={{ ...styles.actionBtn, ...styles.disableBtn }} onClick={() => handleDisableUser(user.id)} title="Desactivar">⛔</button>
                  <button style={{ ...styles.actionBtn, ...styles.deleteBtn }} onClick={() => handleDeleteUser(user.id)} title="Eliminar">🗑️</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <div style={{ ...styles.modal, display: 'flex' }} onClick={() => setShowForm(false)}>
          <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', width: '90%', maxWidth: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
              {editingId ? '✏️ Editar Usuario' : '➕ Nuevo Usuario'}
            </h2>

            <div style={styles.formGroup}>
              <label style={styles.label}>Nombre</label>
              <input style={styles.input} type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input style={styles.input} type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Contraseña</label>
              <input style={styles.input} type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Rol</label>
              <select style={styles.input} value={formData.rol} onChange={(e) => setFormData({ ...formData, rol: e.target.value as any })}>
                <option value="STUDENT">👨‍🎓 Estudiante</option>
                <option value="TEACHER">👨‍🏫 Profesor</option>
                <option value="ADMIN">🔐 Admin</option>
              </select>
            </div>

            {editingId && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Estado</label>
                <select style={styles.input} value={formData.estado} onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}>
                  <option value="ACTIVE">✅ Activo</option>
                  <option value="INACTIVE">❌ Inactivo</option>
                </select>
              </div>
            )}

            <div style={styles.buttonGroup}>
              <button style={{ ...styles.button, backgroundColor: '#6b7280' }} onClick={() => setShowForm(false)}>
                Cancelar
              </button>
              <button style={styles.button} onClick={handleSubmit}>
                {editingId ? '✏️ Actualizar' : '➕ Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
