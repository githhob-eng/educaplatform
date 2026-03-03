// packages/web/app/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState('https://wa.me/34911234567');
  const [blockedReason, setBlockedReason] = useState('');

  useEffect(() => {
    const savedLink = localStorage.getItem('whatsapp_link') || 'https://wa.me/34911234567';
    setWhatsappLink(savedLink);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBlockedReason('');
    setLoading(true);

    try {
      console.log('🔐 Intentando login con DNI:', dni);
      
      // ✅ CAMBIO CLAVE: POST a /api/auth/login (no GET a /api/auth/users)
      const response = await fetch('http://https://educaplatform-bg8vrm5zl-premedics-projects.vercel.app/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dni: dni.trim(),
          password: password,
        }),
      });

      console.log('📡 Respuesta del servidor:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error del servidor:', errorData);
        setError('❌ ' + (errorData.error || 'DNI o contraseña incorrectos'));
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('✅ Login exitoso:', data.user.nombre);

      // Validar si está bloqueado
      if (data.user.estado === 'BLOCKED') {
        setError('❌ Tu acceso se encuentra bloqueado');
        setBlockedReason(data.user.motivo_bloqueo || 'No especificado');
        setLoading(false);
        return;
      }

      if (data.user.estado !== 'ACTIVE') {
        setError('❌ Usuario inactivo');
        setLoading(false);
        return;
      }

      const token = 'token_' + Date.now();
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({
        id: data.user.id,
        nombre: data.user.nombre,
        email: data.user.email,
        dni: data.user.dni,
        rol: data.user.rol,
        comunidad_id: data.user.comunidad_id,
      }));

      console.log('🚀 Redirigiendo a dashboard...');

      if (data.user.rol === 'ADMIN') {
        router.push('/dashboard/overview');
      } else if (data.user.rol === 'TEACHER') {
        router.push('/dashboard/overview');
      } else {
        router.push('/dashboard/overview');
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError('❌ Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f5f7fa',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: '16px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
      padding: '40px',
      width: '100%',
      maxWidth: '400px',
      border: '1px solid #e5e7eb',
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '30px',
    },
    logo: {
      fontSize: '48px',
      marginBottom: '15px',
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '8px',
    },
    subtitle: {
      fontSize: '14px',
      color: '#6b7280',
    },
    form: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '6px',
    },
    label: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#374151',
    },
    input: {
      padding: '12px 14px',
      border: '1px solid #ddd',
      borderRadius: '10px',
      fontSize: '14px',
      fontFamily: 'inherit',
      transition: 'all 0.3s ease',
    },
    button: {
      padding: '12px 16px',
      backgroundColor: '#4f46e5',
      color: '#fff',
      border: 'none',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginTop: '10px',
    },
    buttonDisabled: {
      backgroundColor: '#9ca3af',
      cursor: 'not-allowed',
      transform: 'none',
    },
    error: {
      padding: '12px 14px',
      backgroundColor: '#fee2e2',
      color: '#dc2626',
      borderRadius: '10px',
      fontSize: '13px',
      fontWeight: '600',
      border: '1px solid #fecaca',
      marginBottom: '15px',
    },
    blockedBox: {
      padding: '12px 14px',
      backgroundColor: '#fee2e2',
      color: '#dc2626',
      borderRadius: '10px',
      fontSize: '12px',
      border: '1px solid #fecaca',
      marginTop: '10px',
    },
    blockedReason: {
      marginTop: '8px',
      padding: '10px',
      backgroundColor: '#fecaca',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '600',
    },
    footer: {
      textAlign: 'center' as const,
      marginTop: '25px',
      paddingTop: '20px',
      borderTop: '1px solid #e5e7eb',
    },
    footerTitle: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '10px',
    },
    link: {
      display: 'inline-block',
      backgroundColor: '#25d366',
      color: '#fff',
      padding: '10px 20px',
      borderRadius: '8px',
      textDecoration: 'none',
      fontWeight: '600',
      fontSize: '13px',
      transition: 'all 0.3s ease',
      marginTop: '8px',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>📚</div>
          <h1 style={styles.title}>EducaPlatform</h1>
          <p style={styles.subtitle}>Acceso a la plataforma</p>
        </div>

        {error && (
          <div style={styles.error}>
            {error}
            {blockedReason && (
              <div style={styles.blockedBox}>
                <div>📋 Motivo:</div>
                <div style={styles.blockedReason}>{blockedReason}</div>
              </div>
            )}
          </div>
        )}

        <form style={styles.form} onSubmit={handleLogin}>
          <div style={styles.formGroup}>
            <label style={styles.label}>🆔 DNI (sin espacios)</label>
            <input
              style={styles.input}
              type="text"
              placeholder="Ej: 12345678"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#4f46e5';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#ddd';
                e.currentTarget.style.boxShadow = 'none';
              }}
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>🔐 Contraseña</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#4f46e5';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#ddd';
                e.currentTarget.style.boxShadow = 'none';
              }}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#4338ca';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#4f46e5';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
            disabled={loading}
          >
            {loading ? '⏳ Ingresando...' : '🚀 Ingresar'}
          </button>
        </form>

        <div style={styles.footer}>
          <div style={styles.footerTitle}>¿Necesitas ayuda?</div>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.link}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#20ba58';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 211, 102, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#25d366';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            💬 Contáctanos
          </a>
        </div>
      </div>
    </div>
  );
}
