// packages/web/app/dashboard/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [whatsappLink, setWhatsappLink] = useState('https://wa.me/34911234567');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Solo admin puede acceder
      if (parsedUser.rol !== 'ADMIN') {
        window.location.href = '/dashboard/overview';
      }
    }

    // Cargar configuración guardada
    const savedWhatsapp = localStorage.getItem('whatsapp_link') || 'https://wa.me/34911234567';
    setWhatsappLink(savedWhatsapp);
  }, []);

  const handleSave = async () => {
    if (!whatsappLink.includes('wa.me') && !whatsappLink.includes('whatsapp')) {
      setMessage('⚠️ Link de WhatsApp inválido');
      return;
    }

    setLoading(true);

    try {
      // Guardar en localStorage (en producción sería en la BD)
      localStorage.setItem('whatsapp_link', whatsappLink);

      setMessage('✅ Configuración guardada correctamente');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ Error al guardar configuración');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: { padding: '0' },
    header: { marginBottom: '30px' },
    title: { fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' },
    subtitle: { fontSize: '16px', color: '#6b7280' },
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
    section: { backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px' },
    sectionTitle: { fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px' },
    formGroup: { marginBottom: '20px' },
    label: { fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' },
    input: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' as const },
    description: { fontSize: '12px', color: '#6b7280', marginTop: '6px' },
    button: { padding: '10px 20px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
    buttonDisabled: { backgroundColor: '#9ca3af', cursor: 'not-allowed' },
    infoBox: { backgroundColor: '#dbeafe', border: '1px solid #93c5fd', borderRadius: '8px', padding: '12px 14px', fontSize: '12px', color: '#0c4a6e', lineHeight: '1.6' },
    previewBox: { backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginTop: '20px' },
    previewTitle: { fontWeight: '600', color: '#1f2937', marginBottom: '10px' },
    previewText: { fontSize: '13px', color: '#6b7280', lineHeight: '1.6' },
    exampleList: { fontSize: '12px', color: '#6b7280', marginTop: '10px', paddingLeft: '20px' },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>⚙️ Configuración del Sistema</h1>
        <p style={styles.subtitle}>Gestiona el link de soporte por WhatsApp</p>
      </div>

      {message && (
        <div style={{
          ...styles.message,
          ...(message.includes('Error') || message.includes('⚠️') ? styles.errorMessage : {})
        }}>
          {message}
        </div>
      )}

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>💬 Link de WhatsApp</h2>

        <div style={styles.infoBox}>
          🔔 Este link aparecerá en la pantalla de login para que los usuarios puedan contactar por WhatsApp si necesitan ayuda.
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Link de WhatsApp</label>
          <input
            style={styles.input}
            type="text"
            placeholder="https://wa.me/34911234567"
            value={whatsappLink}
            onChange={(e) => setWhatsappLink(e.target.value)}
          />
          <div style={styles.description}>
            Ejemplos:
            <div style={styles.exampleList}>
              • https://wa.me/34911234567 (solo número)<br/>
              • https://wa.me/message/xxxxx (conversación existente)<br/>
              • https://chat.whatsapp.com/xxxxx (grupo de WhatsApp)
            </div>
          </div>
        </div>

        <button
          style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }}
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? '⏳ Guardando...' : '💾 Guardar Configuración'}
        </button>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>👁️ Vista Previa</h2>
        <p style={styles.label}>Así verán los usuarios esta información en el login:</p>
        
        <div style={styles.previewBox}>
          <div style={styles.previewTitle}>¿Necesitas ayuda?</div>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              backgroundColor: '#25d366',
              color: '#fff',
              padding: '10px 20px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '13px',
              marginTop: '8px',
            }}
          >
            💬 Contáctanos
          </a>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>ℹ️ Información del Sistema</h2>
        <div style={styles.infoBox}>
          <strong>Usuario conectado:</strong> {user?.nombre} ({user?.rol})<br/>
          <strong>DNI:</strong> {user?.dni || user?.id}<br/>
          <strong>Email:</strong> {user?.email}<br/>
          <strong>Versión:</strong> EducaPlatform v1.0
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>📝 Usuarios de Prueba</h2>
        <div style={styles.infoBox}>
          <strong>Admin:</strong><br/>
          DNI: 11111111 | Contraseña: admin123<br/>
          <br/>
          <strong>Profesor:</strong><br/>
          DNI: 22222222 | Contraseña: admin123<br/>
          <br/>
          <strong>Estudiante:</strong><br/>
          DNI: 33333333 | Contraseña: admin123
        </div>
      </div>
    </div>
  );
}
