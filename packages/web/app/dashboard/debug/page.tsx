// packages/web/app/dashboard/debug/page.tsx
// ⚠️ SOLO PARA DESARROLLO - ELIMINAR EN PRODUCCIÓN
'use client';

import { useState, useEffect } from 'react';

export default function DebugHierarchyData() {
  const [user, setUser] = useState<any>(null);
  const [hierarchyData, setHierarchyData] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    const data = localStorage.getItem('hierarchy_users');
    if (data) {
      setHierarchyData(JSON.parse(data));
    }
  }, []);

  const showMsg = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 3000);
  };

  // SINCRONIZAR BACKEND
  const syncToBackend = async () => {
    try {
      for (const usr of hierarchyData) {
        const existing = await fetch(`http://localhost:3001/api/users`);
        const existingUsers = await existing.json();
        const userExists = existingUsers.find((u: any) => u.id === usr.id);

        if (!userExists) {
          const response = await fetch('http://localhost:3001/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(usr),
          });
          if (response.ok) {
            console.log(`✅ ${usr.nombre} sincronizado`);
          }
        }
      }
      showMsg('✅ Sincronización completada');
    } catch (error) {
      showMsg('❌ Error en sincronización');
    }
  };

  // LIMPIAR Y RECARGAR
  const reloadData = () => {
    const data = localStorage.getItem('hierarchy_users');
    if (data) {
      setHierarchyData(JSON.parse(data));
      showMsg('✅ Datos recargados');
    }
  };

  // EXPORTAR DATOS
  const exportData = () => {
    const dataStr = JSON.stringify(hierarchyData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hierarchy_users.json';
    a.click();
    showMsg('✅ Archivo descargado');
  };

  // CREAR DATOS DE PRUEBA
  const createTestData = () => {
    const testUsers = [
      {
        id: 'prof-test-1',
        nombre: 'Profesor Test',
        email: 'prof@test.com',
        dni: '99999999',
        rol: 'TEACHER',
        estado: 'ACTIVE',
        password: 'test123',
        creado_por_id: user?.id,
        comunidad_id: 'default',
        fecha_creacion: new Date().toISOString(),
      },
      {
        id: 'student-test-1',
        nombre: 'Estudiante Test',
        email: 'student@test.com',
        dni: '88888888',
        rol: 'STUDENT',
        estado: 'ACTIVE',
        password: 'test123',
        creado_por_id: 'prof-test-1',
        comunidad_id: 'default',
        fecha_creacion: new Date().toISOString(),
      },
    ];

    const updated = [...hierarchyData, ...testUsers];
    setHierarchyData(updated);
    localStorage.setItem('hierarchy_users', JSON.stringify(updated));
    showMsg('✅ Datos de prueba creados');
  };

  // LIMPIAR TODO
  const clearAll = () => {
    if (confirm('⚠️ ¿Realmente deseas eliminar TODOS los datos de prueba?')) {
      localStorage.setItem('hierarchy_users', JSON.stringify([
        {
          id: 'admin-root',
          nombre: 'Admin',
          email: 'admin@educaplatform.com',
          dni: '11111111',
          rol: 'ADMIN',
          estado: 'ACTIVE',
          password: 'admin123',
          comunidad_id: 'root',
          fecha_creacion: '2024-01-01T00:00:00Z',
        },
      ]));
      setHierarchyData([]);
      showMsg('✅ Datos limpiados');
      window.location.reload();
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', color: '#dc2626' }}>
        🔧 Debug - Gestión de Datos Jerárquicos
      </h1>

      {message && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '20px',
          borderRadius: '8px',
          backgroundColor: message.includes('✅') ? '#d1fae5' : '#fee2e2',
          color: message.includes('✅') ? '#065f46' : '#dc2626',
          fontWeight: '600',
        }}>
          {message}
        </div>
      )}

      {/* BOTONES DE ACCIÓN */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          onClick={reloadData}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          🔄 Recargar Datos
        </button>
        <button
          onClick={syncToBackend}
          style={{
            padding: '10px 20px',
            backgroundColor: '#10b981',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          📤 Sincronizar al Backend
        </button>
        <button
          onClick={createTestData}
          style={{
            padding: '10px 20px',
            backgroundColor: '#8b5cf6',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          ✨ Crear Datos de Prueba
        </button>
        <button
          onClick={exportData}
          style={{
            padding: '10px 20px',
            backgroundColor: '#f59e0b',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          📥 Exportar JSON
        </button>
        <button
          onClick={clearAll}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          🗑️ Limpiar Todo
        </button>
      </div>

      {/* INFO USUARIO ACTUAL */}
      <div style={{
        backgroundColor: '#f0f4ff',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        borderLeft: '4px solid #4f46e5',
      }}>
        <h3 style={{ marginTop: 0, color: '#1f2937' }}>👤 Usuario Actual:</h3>
        <p><strong>Nombre:</strong> {user?.nombre}</p>
        <p><strong>ID:</strong> {user?.id}</p>
        <p><strong>Rol:</strong> {user?.rol}</p>
      </div>

      {/* TABLA DE USUARIOS */}
      <div style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        overflowX: 'auto',
      }}>
        <h3 style={{ marginTop: 0, color: '#1f2937' }}>📊 Usuarios en localStorage ({hierarchyData.length}):</h3>
        
        {hierarchyData.length > 0 ? (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '13px',
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Nombre</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Rol</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>DNI</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Creado Por</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {hierarchyData.map((usr) => (
                <tr key={usr.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px' }}><strong>{usr.nombre}</strong></td>
                  <td style={{ padding: '12px' }}>
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
                  <td style={{ padding: '12px' }}>{usr.dni}</td>
                  <td style={{ padding: '12px' }}>{usr.email}</td>
                  <td style={{ padding: '12px' }}>
                    {usr.creado_por_id ? hierarchyData.find(u => u.id === usr.creado_por_id)?.nombre || usr.creado_por_id : 'Root'}
                  </td>
                  <td style={{ padding: '12px' }}>
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
          <p style={{ color: '#6b7280' }}>No hay usuarios. Crea datos de prueba con el botón arriba.</p>
        )}
      </div>

      {/* JSON RAW */}
      <div style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        marginTop: '20px',
      }}>
        <h3 style={{ marginTop: 0, color: '#1f2937' }}>📋 JSON Raw:</h3>
        <pre style={{
          backgroundColor: '#1f2937',
          color: '#10b981',
          padding: '15px',
          borderRadius: '6px',
          overflowX: 'auto',
          fontSize: '12px',
        }}>
          {JSON.stringify(hierarchyData, null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fef3c7', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
        <p style={{ margin: 0, fontSize: '13px' }}>
          ⚠️ <strong>Esta página es solo para desarrollo.</strong> Elimínala antes de producción.
        </p>
      </div>
    </div>
  );
}
