// packages/web/app/dashboard/layout.tsx
'use client';

import '../globals.css';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface Notification {
  id: string;
  leido_por: string[];
  para_usuarios?: string[];
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationsCount, setNotificationsCount] = useState(0);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    
    updateNotificationCount();
    
    const interval = setInterval(updateNotificationCount, 1000);
    return () => clearInterval(interval);
  }, [router]);

  const updateNotificationCount = () => {
    const userData = localStorage.getItem('user');
    const allNotifs = localStorage.getItem('all_notifications');
    
    if (userData && allNotifs) {
      try {
        const user = JSON.parse(userData);
        const notifs: Notification[] = JSON.parse(allNotifs);
        
        const userNotifs = notifs.filter(n => {
          if (!n.para_usuarios || n.para_usuarios.length === 0) return true;
          return n.para_usuarios.includes(user.id);
        });
        
        const unread = userNotifs.filter(n => !n.leido_por?.includes(user.id)).length;
        setNotificationsCount(unread);
      } catch (e) {
        setNotificationsCount(0);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const isActive = (path: string) => pathname === path;

  // ✅ MENÚ DIFERENCIADO POR ROL
  const getMenuItems = () => {
    if (!user) return [];

    if (user.rol === 'ADMIN') {
      return [
        { icon: '📊', label: 'Panel', href: '/dashboard/overview' },
        { icon: '🌳', label: 'Control Jerárquico', href: '/dashboard/hierarchy' },
        { icon: '🌐', label: 'Mi Red 360°', href: '/dashboard/network' },
        { icon: '👨‍💼', label: 'Admins', href: '/dashboard/admins' },
        { icon: '👨‍🏫', label: 'Profesores', href: '/dashboard/teachers' },
        { icon: '👥', label: 'Estudiantes', href: '/dashboard/student' },
        { icon: '📚', label: 'Cursos', href: '/dashboard/courses' },
        { icon: '💬', label: 'Mensajes', href: '/dashboard/messages' },
        { icon: '🔔', label: 'Notificaciones', href: '/dashboard/notifications', badge: notificationsCount },
        { icon: '📊', label: 'Reportes', href: '/dashboard/reports' },
        { icon: '⚙️', label: 'Configuración', href: '/dashboard/settings' },
      ];
    }

    if (user.rol === 'TEACHER') {
      return [
        { icon: '📊', label: 'Mi Dashboard', href: '/dashboard/overview' },
        { icon: '👥', label: 'Mis Estudiantes', href: '/dashboard/student' },
        { icon: '📚', label: 'Mis Cursos', href: '/dashboard/courses' },
        { icon: '💬', label: 'Mensajes', href: '/dashboard/messages' },
        { icon: '🔔', label: 'Notificaciones', href: '/dashboard/notifications', badge: notificationsCount },
        { icon: '📝', label: 'Tareas', href: '/dashboard/assignments' },
        { icon: '📊', label: 'Calificaciones', href: '/dashboard/grades' },
      ];
    }

    if (user.rol === 'STUDENT') {
      return [
        { icon: '📊', label: 'Mi Dashboard', href: '/dashboard/overview' },
        { icon: '📚', label: 'Mis Cursos', href: '/dashboard/courses' },
        { icon: '💬', label: 'Mensajes', href: '/dashboard/messages' },
        { icon: '🔔', label: 'Notificaciones', href: '/dashboard/notifications', badge: notificationsCount },
        { icon: '📝', label: 'Tareas', href: '/dashboard/assignments' },
      ];
    }

    return [];
  };

  const menuItems = getMenuItems();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      {/* SIDEBAR */}
      <aside
        style={{
          width: sidebarOpen ? '280px' : '90px',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e8eef5',
          padding: sidebarOpen ? '30px 20px' : '20px 12px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* LOGO */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '40px',
            padding: '0 8px',
          }}
        >
          <div
            style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#4f46e5',
            }}
          >
            📚
          </div>
          {sidebarOpen && (
            <div
              style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#1f2937',
                letterSpacing: '-0.5px',
              }}
            >
              Educa
            </div>
          )}
        </div>

        {/* MENU */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {menuItems.map((item, index) => {
            const active = isActive(item.href);
            return (
              <button
                key={`${item.href}-${index}`}
                onClick={() => router.push(item.href)}
                style={{
                  padding: sidebarOpen ? '12px 16px' : '12px 8px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: active ? '#f0f4ff' : 'transparent',
                  color: active ? '#4f46e5' : '#6b7280',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '14px',
                  fontWeight: active ? '600' : '500',
                  transition: 'all 0.2s ease',
                  borderLeft: active ? '3px solid #4f46e5' : '3px solid transparent',
                  paddingLeft: sidebarOpen ? '16px' : '8px',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
                {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
                
                {/* BADGE DE NOTIFICACIONES */}
                {item.badge && item.badge > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '8px',
                      backgroundColor: '#ef4444',
                      color: '#fff',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 'bold',
                    }}
                  >
                    {item.badge > 99 ? '+99' : item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* TOGGLE BUTTON */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb',
            cursor: 'pointer',
            color: '#6b7280',
            fontSize: '16px',
            transition: 'all 0.2s ease',
            marginTop: '20px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
          }}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* TOPBAR */}
        <header
          style={{
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e8eef5',
            padding: '16px 30px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ fontSize: '24px' }}>👋</div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                }}
              >
                {user?.nombre}
              </h2>
              <p
                style={{
                  margin: '4px 0 0 0',
                  fontSize: '12px',
                  color: '#9ca3af',
                }}
              >
                {user?.rol === 'ADMIN' ? '👨‍💼 Administrador' : user?.rol === 'TEACHER' ? '👨‍🏫 Profesor' : '👨‍🎓 Estudiante'}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fecaca';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fee2e2';
            }}
          >
            Salir
          </button>
        </header>

        {/* CONTENT */}
        <main
          style={{
            flex: 1,
            padding: '30px 40px',
            overflowY: 'auto',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
