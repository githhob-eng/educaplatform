// packages/web/app/dashboard/network/page.tsx
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

export default function NetworkManagement360() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [filterRole, setFilterRole] = useState<'ALL' | 'ADMIN' | 'TEACHER' | 'STUDENT'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'BLOCKED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

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

      if (parsedUser.rol !== 'ADMIN') {
        router.push('/dashboard/overview');
        setLoading(false);
        return;
      }

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
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  }, [mounted, router]);

  const showMsg = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 4000);
  };

  // ✅ OBTENER TODA MI RED (COMO EN HIERARCHY)
  const getMyNetwork = (): User[] => {
    if (!user) return [];

    const result: User[] = [];
    const visited = new Set();

    const traverse = (userId: string) => {
      if (visited.has(userId)) return;
      visited.add(userId);

      const children = allUsers.filter(u => u.creado_por_id === userId);
      children.forEach(child => {
        result.push(child);
        traverse(child.id);
      });
    };

    traverse(user.id);
    return result;
  };

  // APLICAR FILTROS
  const getFilteredUsers = () => {
    let filtered = getMyNetwork();

    if (filterRole !== 'ALL') {
      filtered = filtered.filter(u => u.rol === filterRole);
    }

    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(u => u.estado === filterStatus);
    }

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(u =>
        u.nombre.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search) ||
        u.dni.includes(search)
      );
    }

    return filtered;
  };

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

  const myNetwork = getMyNetwork();
  const filteredUsers = getFilteredUsers();

  const stats = {
    total: myNetwork.length,
    admins: myNetwork.filter(u => u.rol === 'ADMIN').length,
    teachers: myNetwork.filter(u => u.rol === 'TEACHER').length,
    students: myNetwork.filter(u => u.rol === 'STUDENT').length,
    active: myNetwork.filter(u => u.estado === 'ACTIVE').length,
    blocked: myNetwork.filter(u => u.estado === 'BLOCKED').length,
  };

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
          🌐 Gestión 360° de Mi Red
        </h1>
        <p style={{ fontSize: '16px', color: '#6b7280' }}>
          Administra tu red completa: Admins, Profesores y Estudiantes
        </p>
      </div>

      {message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '14px',
          fontWeight: '600',
          backgroundColor: '#d1fae5',
          color: '#065f46',
          border: '1px solid #a7f3d0',
        }}>
          {message}
        </div>
      )}

      {/* ESTADÍSTICAS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px',
        marginBottom: '20px',
      }}>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>{stats.total}</div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Total Usuarios</div>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0c4a6e' }}>{stats.admins}</div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Admins</div>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400e' }}>{stats.teachers}</div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Profesores</div>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#065f46' }}>{stats.students}</div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Estudiantes</div>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{stats.active}</div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Activos</div>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>{stats.blocked}</div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Bloqueados</div>
        </div>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <input
          type="text"
          placeholder="🔍 Buscar por nombre, email o DNI..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '10px 12px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px',
            fontFamily: 'inherit',
            flex: 1,
            minWidth: '200px',
          }}
        />
        
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value as any)}
          style={{
            padding: '10px 12px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px',
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          <option value="ALL">📋 Todos</option>
          <option value="ADMIN">👨‍💼 Admins</option>
          <option value="TEACHER">👨‍🏫 Profesores</option>
          <option value="STUDENT">👨‍🎓 Estudiantes</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          style={{
            padding: '10px 12px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px',
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          <option value="ALL">🔄 Todos</option>
          <option value="ACTIVE">✅ Activos</option>
          <option value="BLOCKED">🚫 Bloqueados</option>
        </select>
      </div>

      {/* TABLA */}
      <div style={{
        backgroundColor: '#fff',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        overflowX: 'auto',
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px', margin: '0 0 20px 0' }}>
          Usuarios ({filteredUsers.length})
        </h2>

        {filteredUsers.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>Nombre</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>Rol</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>Email</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>DNI</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(usr => (
                <tr key={usr.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px 15px' }}><strong>{usr.nombre}</strong></td>
                  <td style={{ padding: '12px 15px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '600',
                      backgroundColor: usr.rol === 'ADMIN' ? '#dbeafe' : usr.rol === 'TEACHER' ? '#fef3c7' : '#d1fae5',
                      color: usr.rol === 'ADMIN' ? '#0c4a6e' : usr.rol === 'TEACHER' ? '#92400e' : '#065f46',
                    }}>
                      {usr.rol}
                    </span>
                  </td>
                  <td style={{ padding: '12px 15px' }}>{usr.email}</td>
                  <td style={{ padding: '12px 15px' }}>{usr.dni}</td>
                  <td style={{ padding: '12px 15px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '600',
                      backgroundColor: usr.estado === 'ACTIVE' ? '#d1fae5' : '#fee2e2',
                      color: usr.estado === 'ACTIVE' ? '#065f46' : '#dc2626',
                    }}>
                      {usr.estado === 'ACTIVE' ? '✅' : '🚫'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>📭</div>
            <p>No hay usuarios que coincidan con los filtros</p>
          </div>
        )}
      </div>
    </div>
  );
}
