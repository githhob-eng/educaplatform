// packages/web/app/dashboard/hierarchy/page.tsx
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

export default function HierarchyManagement() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        router.push('/login');
        setLoading(false);
        return;
      }

      const currentUser = JSON.parse(userStr) as User;
      
      if (currentUser.rol !== 'ADMIN') {
        router.push('/dashboard/overview');
        setLoading(false);
        return;
      }

      setUser(currentUser);

      const hierarchyStr = localStorage.getItem('hierarchy_users');
      let users: User[] = [];

      if (hierarchyStr) {
        try {
          users = JSON.parse(hierarchyStr);
          console.log('✅ Usuarios cargados:', users.length);
          console.log('Estructura:', users.map(u => `${u.nombre} (creado_por: ${u.creado_por_id || 'ROOT'})`));
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

  const toggleNode = (userId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const getChildren = (parentId: string | undefined): User[] => {
    if (!parentId) {
      // Si no hay parentId, retornar usuarios sin padre (raíces)
      return allUsers.filter(u => !u.creado_por_id || u.creado_por_id === '' || u.creado_por_id === 'undefined');
    }
    return allUsers.filter(u => u.creado_por_id === parentId);
  };

  const getDescendantCount = (userId: string | undefined): number => {
    let count = 0;
    const children = getChildren(userId);
    children.forEach(child => {
      count += 1 + getDescendantCount(child.id);
    });
    return count;
  };

  const renderNode = (userId: string | undefined, depth: number = 0): React.ReactNode => {
    const children = getChildren(userId);

    return children.map(nodeUser => {
      const childrenOfNode = getChildren(nodeUser.id);
      const descendantCount = getDescendantCount(nodeUser.id);
      const isExpanded = expandedNodes.has(nodeUser.id);

      return (
        <div key={nodeUser.id} style={{ marginLeft: `${depth * 30}px` }}>
          {/* NODO */}
          <div
            style={{
              padding: '12px 15px',
              backgroundColor: nodeUser.estado === 'ACTIVE' ? '#ecfdf5' : '#fef2f2',
              border: `2px solid ${nodeUser.estado === 'ACTIVE' ? '#10b981' : '#ef4444'}`,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: '50px',
              marginBottom: '8px',
            }}
          >
            {/* IZQUIERDA */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
              {/* TOGGLE */}
              {childrenOfNode.length > 0 ? (
                <button
                  onClick={() => toggleNode(nodeUser.id)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                    padding: '0',
                    width: '30px',
                  }}
                >
                  {isExpanded ? '▼' : '▶'}
                </button>
              ) : (
                <div style={{ width: '30px' }} />
              )}

              {/* INFO */}
              <div>
                <div style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '15px' }}>
                  {nodeUser.nombre}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  <span
                    style={{
                      padding: '2px 8px',
                      backgroundColor:
                        nodeUser.rol === 'ADMIN'
                          ? '#dbeafe'
                          : nodeUser.rol === 'TEACHER'
                          ? '#fef3c7'
                          : '#d1fae5',
                      borderRadius: '3px',
                      fontSize: '11px',
                      fontWeight: '600',
                      marginRight: '6px',
                    }}
                  >
                    {nodeUser.rol}
                  </span>
                  {nodeUser.email}
                  {descendantCount > 0 && (
                    <span style={{ marginLeft: '10px', fontWeight: '600', color: '#4f46e5' }}>
                      • {descendantCount} desc.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* BOTONES DERECHOS */}
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
              <button
                style={{
                  padding: '6px 10px',
                  fontSize: '12px',
                  backgroundColor: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
                title="Editar"
              >
                ✏️
              </button>
              <button
                style={{
                  padding: '6px 10px',
                  fontSize: '12px',
                  backgroundColor: '#f59e0b',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
                title="Bloquear"
              >
                🚫
              </button>
              <button
                style={{
                  padding: '6px 10px',
                  fontSize: '12px',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
                title="Eliminar"
              >
                🗑️
              </button>
            </div>
          </div>

          {/* HIJOS */}
          {isExpanded && childrenOfNode.length > 0 && (
            <div>
              {renderNode(nodeUser.id, depth + 1)}
            </div>
          )}
        </div>
      );
    });
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

  const myNetworkCount = getDescendantCount(undefined);

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
          🌳 Gestión Jerárquica de tu Red
        </h1>
        <p style={{ fontSize: '16px', color: '#6b7280' }}>
          Visualiza y gestiona tu estructura organizativa
        </p>
      </div>

      {/* LEYENDA */}
      <div
        style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '20px',
          border: '1px solid #e5e7eb',
        }}
      >
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#1f2937' }}>
          📋 Cómo funciona:
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', fontSize: '13px' }}>
          <div>
            <strong>▶️ Expandir:</strong> Click en la flecha para ver descendientes
          </div>
          <div>
            <strong>✏️ Editar:</strong> Cambiar nombre, email, DNI, contraseña
          </div>
          <div>
            <strong>🚫 Bloquear:</strong> El usuario no podrá loguear
          </div>
          <div>
            <strong>🗑️ Eliminar:</strong> Solo si NO tiene descendientes
          </div>
        </div>
      </div>

      {/* ÁRBOL */}
      <div
        style={{
          backgroundColor: '#fff',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px' }}>
          Tu Estructura ({myNetworkCount} usuarios en red)
        </h2>

        {allUsers.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>📭</div>
            <p>
              No hay datos. Crea usuarios desde <strong>Mi Red 360°</strong>
            </p>
          </div>
        ) : (
          <div>
            {renderNode(undefined)}
          </div>
        )}
      </div>
    </div>
  );
}
