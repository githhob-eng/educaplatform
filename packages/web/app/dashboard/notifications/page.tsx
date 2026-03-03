// packages/web/app/dashboard/notifications/page.tsx
'use client';

import { useState, useEffect } from 'react';

interface Notification {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'warning' | 'success' | 'error' | 'student_enrolled' | 'grade_assigned' | 'message_received' | 'course_created';
  enviado_por: string;
  enviado_por_id: string;
  fecha: string;
  leido_por: string[];
  para_usuarios: string[];
  prioridad: 'baja' | 'media' | 'alta';
}

interface User {
  id: string;
  nombre: string;
  email: string;
  dni: string;
  rol: string;
}

export default function NotificationsPage() {
  const [user, setUser] = useState<any>(null);
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchUser, setSearchUser] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showUserList, setShowUserList] = useState(false);
  const [filterUnread, setFilterUnread] = useState(false);
  const [newNotif, setNewNotif] = useState({
    titulo: '',
    mensaje: '',
    tipo: 'info' as const,
    prioridad: 'media' as const,
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch('http://https://educaplatform-bg8vrm5zl-premedics-projects.vercel.app/api/auth/users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error:', error);
    }

    const savedNotifications = localStorage.getItem('all_notifications');
    if (savedNotifications) {
      try {
        setAllNotifications(JSON.parse(savedNotifications));
      } catch (e) {
        initializeNotifications();
      }
    } else {
      initializeNotifications();
    }

    setLoading(false);
  };

  const initializeNotifications = () => {
    const initial: Notification[] = [
      {
        id: 'welcome-' + Date.now(),
        titulo: '¡Bienvenido a EducaPlatform!',
        mensaje: 'Te damos la bienvenida a nuestra plataforma educativa. Aquí podrás acceder a todos tus cursos, calificaciones y comunicarte con tus profesores.',
        tipo: 'success',
        enviado_por: 'Sistema',
        enviado_por_id: 'system',
        fecha: new Date().toISOString(),
        leido_por: [],
        para_usuarios: [],
        prioridad: 'media',
      },
    ];
    setAllNotifications(initial);
    localStorage.setItem('all_notifications', JSON.stringify(initial));
  };

  const updateNotifications = (newNotifications: Notification[]) => {
    setAllNotifications(newNotifications);
    localStorage.setItem('all_notifications', JSON.stringify(newNotifications));
  };

  const getUserNotifications = () => {
    if (!user) return [];
    
    return allNotifications
      .filter(n => {
        if (n.para_usuarios.length === 0) return true;
        return n.para_usuarios.includes(user.id);
      })
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  };

  const notifActuales = getUserNotifications();
  const sinLeer = notifActuales.filter(n => !n.leido_por.includes(user?.id));
  const mostradas = filterUnread ? sinLeer : notifActuales;

  const filteredUsers = searchUser.trim()
    ? users.filter(u =>
        u.nombre.toLowerCase().includes(searchUser.toLowerCase()) ||
        u.dni.includes(searchUser) ||
        u.email.toLowerCase().includes(searchUser.toLowerCase())
      )
    : [];

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateNotification = () => {
    if (!newNotif.titulo.trim() || !newNotif.mensaje.trim()) {
      setMessage('⚠️ Completa todos los campos');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (selectedUsers.length === 0) {
      setMessage('⚠️ Selecciona al menos un usuario');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const notif: Notification = {
      id: 'notif-' + Date.now(),
      titulo: newNotif.titulo,
      mensaje: newNotif.mensaje,
      tipo: newNotif.tipo,
      enviado_por: user?.nombre || 'Admin',
      enviado_por_id: user?.id,
      fecha: new Date().toISOString(),
      leido_por: [],
      para_usuarios: selectedUsers,
      prioridad: newNotif.prioridad,
    };

    const updated = [notif, ...allNotifications];
    updateNotifications(updated);
    setMessage(`✅ Notificación enviada a ${selectedUsers.length} usuario(s)`);
    setNewNotif({ titulo: '', mensaje: '', tipo: 'info', prioridad: 'media' });
    setSelectedUsers([]);
    setSearchUser('');
    setShowCreateForm(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleToggleRead = (id: string) => {
    const updated = allNotifications.map(n => {
      if (n.id === id) {
        const isRead = n.leido_por.includes(user.id);
        return {
          ...n,
          leido_por: isRead
            ? n.leido_por.filter(uid => uid !== user.id)
            : [...n.leido_por, user.id],
        };
      }
      return n;
    });
    updateNotifications(updated);
  };

  const handleDelete = (id: string) => {
    const updated = allNotifications.filter(n => n.id !== id);
    updateNotifications(updated);
    setMessage('✅ Notificación eliminada');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteAll = () => {
    const updated = allNotifications.filter(n => !notifActuales.includes(n));
    updateNotifications(updated);
    setMessage('✅ Todas las notificaciones fueron eliminadas');
    setTimeout(() => setMessage(''), 3000);
  };

  const getIconByType = (tipo: string) => {
    const icons: Record<string, string> = {
      'info': '📘',
      'warning': '⚠️',
      'success': '✅',
      'error': '❌',
      'student_enrolled': '🎓',
      'grade_assigned': '📊',
      'message_received': '💬',
      'course_created': '📚',
    };
    return icons[tipo] || '📌';
  };

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta':
        return { bg: '#fee2e2', border: '#fca5a5', dot: '#dc2626' };
      case 'media':
        return { bg: '#fef3c7', border: '#fcd34d', dot: '#f59e0b' };
      case 'baja':
        return { bg: '#d1fae5', border: '#a7f3d0', dot: '#10b981' };
      default:
        return { bg: '#f3f4f6', border: '#e5e7eb', dot: '#6b7280' };
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>⏳ Cargando...</div>;
  }

  return (
    <div style={{ padding: '0' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>🔔 Notificaciones</h1>
        <p style={{ fontSize: '16px', color: '#6b7280' }}>Centro de notificaciones en tiempo real</p>
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

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        {sinLeer.length > 0 && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#ef4444',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
          }}>
            🔴 {sinLeer.length} sin leer
          </span>
        )}
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#6b7280' }}>
          <input
            type="checkbox"
            checked={filterUnread}
            onChange={(e) => setFilterUnread(e.target.checked)}
            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
          />
          Solo sin leer
        </label>
        {notifActuales.length > 0 && (
          <button
            style={{
              padding: '10px 20px',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
            }}
            onClick={handleDeleteAll}
          >
            🗑️ Eliminar todas
          </button>
        )}
        {user?.rol && ['ADMIN', 'TEACHER'].includes(user.rol) && (
          <button
            style={{
              padding: '10px 20px',
              backgroundColor: '#4f46e5',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
            }}
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? '✕ Cancelar' : '➕ Nueva'}
          </button>
        )}
      </div>

      {showCreateForm && user?.rol && ['ADMIN', 'TEACHER'].includes(user.rol) && (
        <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ marginBottom: '15px', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>📨 Crear Notificación</h3>
          <input
            type="text"
            placeholder="Título"
            maxLength={50}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
              marginBottom: '12px',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
            value={newNotif.titulo}
            onChange={(e) => setNewNotif({ ...newNotif, titulo: e.target.value })}
          />
          <textarea
            placeholder="Mensaje"
            maxLength={200}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
              marginBottom: '12px',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              minHeight: '80px',
              resize: 'none',
            }}
            value={newNotif.mensaje}
            onChange={(e) => setNewNotif({ ...newNotif, mensaje: e.target.value })}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <select
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                marginBottom: '12px',
                fontFamily: 'inherit',
              }}
              value={newNotif.tipo}
              onChange={(e) => setNewNotif({ ...newNotif, tipo: e.target.value as any })}
            >
              <option value="info">📘 Información</option>
              <option value="warning">⚠️ Advertencia</option>
              <option value="success">✅ Éxito</option>
              <option value="error">❌ Error</option>
              <option value="grade_assigned">📊 Calificación</option>
              <option value="course_created">📚 Curso</option>
            </select>
            <select
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                marginBottom: '12px',
                fontFamily: 'inherit',
              }}
              value={newNotif.prioridad}
              onChange={(e) => setNewNotif({ ...newNotif, prioridad: e.target.value as any })}
            >
              <option value="baja">🟢 Baja</option>
              <option value="media">🟡 Media</option>
              <option value="alta">🔴 Alta</option>
            </select>
          </div>

          <div style={{ position: 'relative', marginBottom: '15px' }}>
            <input
              type="text"
              placeholder="Busca usuarios..."
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              onFocus={() => setShowUserList(true)}
            />
            {showUserList && searchUser.trim() && filteredUsers.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '8px',
                maxHeight: '250px',
                overflowY: 'auto',
                zIndex: 10,
                marginTop: '4px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}>
                {filteredUsers.map(u => (
                  <div
                    key={u.id}
                    style={{
                      padding: '10px 12px',
                      borderBottom: '1px solid #e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleSelectUser(u.id)}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                  >
                    <input
                      type="checkbox"
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      checked={selectedUsers.includes(u.id)}
                      onChange={() => {}}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '13px', color: '#1f2937' }}>{u.nombre}</div>
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>{u.dni} • {u.rol}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedUsers.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '15px' }}>
              {selectedUsers.map(userId => {
                const u = users.find(usr => usr.id === userId);
                return (
                  <div
                    key={userId}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#dbeafe',
                      color: '#0c4a6e',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}
                  >
                    {u?.nombre}
                    <button
                      style={{
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        padding: '0',
                        fontSize: '14px',
                        color: '#0c4a6e',
                      }}
                      onClick={() => handleSelectUser(userId)}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <button
            style={{
              width: '100%',
              padding: '10px 20px',
              backgroundColor: '#4f46e5',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
            }}
            onClick={handleCreateNotification}
          >
            ✅ Enviar a {selectedUsers.length} {selectedUsers.length === 1 ? 'usuario' : 'usuarios'}
          </button>
        </div>
      )}

      <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px' }}>
          📬 {filterUnread ? 'Sin leer' : 'Todas'} ({mostradas.length})
        </h2>

        {mostradas.length > 0 ? (
          <div>
            {mostradas.map(notif => {
              const isRead = notif.leido_por.includes(user?.id);
              const colors = getPriorityColor(notif.prioridad);
              return (
                <div
                  key={notif.id}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    border: '1px solid',
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr 100px',
                    gap: '16px',
                    alignItems: 'start',
                    backgroundColor: isRead ? '#f9fafb' : colors.bg,
                    borderColor: isRead ? '#e5e7eb' : colors.border,
                    opacity: isRead ? 0.8 : 1,
                  }}
                >
                  <div style={{ fontSize: '24px' }}>{getIconByType(notif.tipo)}</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>{notif.titulo}</div>
                    <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px', lineHeight: '1.5' }}>{notif.mensaje}</div>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#9ca3af', flexWrap: 'wrap' }}>
                      <span>👤 {notif.enviado_por}</span>
                      <span>🕒 {new Date(notif.fecha).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      {!isRead && <span style={{ color: '#2563eb', fontWeight: 'bold' }}>🔴 NUEVA</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <button
                      style={{
                        padding: '4px 8px',
                        fontSize: '11px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        backgroundColor: '#dbeafe',
                        color: '#0c4a6e',
                      }}
                      onClick={() => handleToggleRead(notif.id)}
                      title={isRead ? 'Marcar como no leída' : 'Marcar como leída'}
                    >
                      {isRead ? '↩️' : '✓'}
                    </button>
                    <button
                      style={{
                        padding: '4px 8px',
                        fontSize: '11px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                      }}
                      onClick={() => handleDelete(notif.id)}
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
            <p>{filterUnread ? 'No tienes notificaciones sin leer' : 'No tienes notificaciones aún'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
