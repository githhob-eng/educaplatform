// packages/web/app/dashboard/admins/page.tsx
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

export default function AdminsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

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
          console.error('Error parseando:', e);
        }
      }

      setAllUsers(users);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  }, [mounted, router]);

  // ✅ OBTENER TODOS LOS ADMINS EN LA RED
  const getMyAdmins = (): User[] => {
    if (!user) return [];

    const result: User[] = [];
    const visited = new Set();

    const traverse = (userId: string) => {
      if (visited.has(userId)) return;
      visited.add(userId);

      const children = allUsers.filter(u => u.creado_por_id === userId);
      children.forEach(child => {
        if (child.rol === 'ADMIN') {
          result.push(child);
        }
        traverse(child.id);
      });
    };

    traverse(user.id);
    return result;
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

  const myAdmins = getMyAdmins();

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
          👨‍💼 Gestión de Administradores
        </h1>
        <p style={{ fontSize: '16px', color: '#6b7280' }}>
          Administra todos los admins en tu red jerárquica
        </p>
      </div>

      <div
        style={{
          backgroundColor: '#fff',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px' }}>
          Mis Administradores ({myAdmins.length})
        </h2>

        {myAdmins.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>
                    Nombre
                  </th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>
                    DNI
                  </th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>
                    Email
                  </th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>
                    Estado
                  </th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {myAdmins.map(admin => (
                  <tr key={admin.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px 15px' }}>
                      <strong>{admin.nombre}</strong>
                    </td>
                    <td style={{ padding: '12px 15px' }}>{admin.dni}</td>
                    <td style={{ padding: '12px 15px' }}>{admin.email}</td>
                    <td style={{ padding: '12px 15px' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600',
                          backgroundColor: admin.estado === 'ACTIVE' ? '#d1fae5' : '#fee2e2',
                          color: admin.estado === 'ACTIVE' ? '#065f46' : '#dc2626',
                        }}
                      >
                        {admin.estado === 'ACTIVE' ? '✅ Activo' : '🚫 Bloqueado'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 15px', display: 'flex', gap: '5px' }}>
                      <button
                        style={{
                          padding: '6px 10px',
                          fontSize: '11px',
                          backgroundColor: '#3b82f6',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: '600',
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        style={{
                          padding: '6px 10px',
                          fontSize: '11px',
                          backgroundColor: '#f59e0b',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: '600',
                        }}
                      >
                        🚫
                      </button>
                      <button
                        style={{
                          padding: '6px 10px',
                          fontSize: '11px',
                          backgroundColor: '#ef4444',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: '600',
                        }}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>📭</div>
            <p>No hay administradores en tu red</p>
          </div>
        )}
      </div>
    </div>
  );
}
