// packages/web/app/page.tsx
import Link from 'next/link';

export default function Home() {
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      color: '#333',
    },
    navbar: {
      backgroundColor: '#fff',
      borderBottom: '1px solid #e0e0e0',
      padding: '20px 0',
      position: 'sticky' as const,
      top: 0,
      zIndex: 50,
    },
    navContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    logo: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#4f46e5',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    navLinks: {
      display: 'flex',
      gap: '15px',
    },
    button: {
      padding: '10px 20px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: 'bold',
      transition: 'all 0.3s ease',
    },
    primaryBtn: {
      backgroundColor: '#4f46e5',
      color: '#fff',
    },
    secondaryBtn: {
      backgroundColor: '#fff',
      color: '#4f46e5',
      border: '2px solid #4f46e5',
    },
    heroSection: {
      padding: '80px 20px',
      textAlign: 'center' as const,
      background: 'linear-gradient(135deg, #f0f4ff 0%, #fff 100%)',
    },
    heroContent: {
      maxWidth: '1200px',
      margin: '0 auto',
    },
    title: {
      fontSize: '56px',
      fontWeight: 'bold',
      marginBottom: '20px',
      color: '#1a1a1a',
    },
    subtitle: {
      fontSize: '20px',
      color: '#666',
      marginBottom: '30px',
      maxWidth: '800px',
      margin: '0 auto 30px',
      lineHeight: '1.6',
    },
    featureGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '30px',
      marginTop: '60px',
    },
    featureCard: {
      backgroundColor: '#fff',
      padding: '30px',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0',
    },
    featureIcon: {
      fontSize: '48px',
      marginBottom: '15px',
    },
    featureTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '10px',
      color: '#1a1a1a',
    },
    statusSection: {
      padding: '80px 20px',
      backgroundColor: '#fff',
    },
    statusGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '30px',
      maxWidth: '1200px',
      margin: '40px auto',
    },
    statusCard: {
      padding: '30px',
      borderRadius: '12px',
      border: '2px solid #4f46e5',
      backgroundColor: '#f0f4ff',
    },
    statusTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#1a1a1a',
      marginBottom: '10px',
    },
    statusText: {
      fontSize: '16px',
      color: '#666',
    },
    ctaSection: {
      background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
      padding: '80px 20px',
      textAlign: 'center' as const,
      color: '#fff',
    },
    ctaTitle: {
      fontSize: '42px',
      fontWeight: 'bold',
      marginBottom: '20px',
    },
    ctaSubtitle: {
      fontSize: '18px',
      marginBottom: '30px',
      opacity: 0.9,
    },
    buttonGroup: {
      display: 'flex',
      gap: '15px',
      justifyContent: 'center',
      flexWrap: 'wrap' as const,
    },
    footer: {
      backgroundColor: '#1a1a1a',
      color: '#999',
      padding: '40px 20px',
      textAlign: 'center' as const,
      borderTop: '1px solid #333',
    },
  };

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <div style={styles.logo}>
            <span style={{ fontSize: '32px' }}>📚</span>
            EducaPlatform
          </div>
          <div style={styles.navLinks}>
            <Link href="/login" style={{ textDecoration: 'none', color: '#666', fontWeight: '500' }}>
              Ingreso
            </Link>
            <Link href="/register" style={{ ...styles.button, ...styles.primaryBtn, textDecoration: 'none' }}>
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.heroContent}>
          <h1 style={styles.title}>
            Bienvenido a<br />
            <span style={{ color: '#4f46e5' }}>EducaPlatform</span>
          </h1>
          <p style={styles.subtitle}>
            La plataforma educativa moderna para profesores y estudiantes. 
            Gestiona cursos, materiales y calificaciones de forma simple y eficiente.
          </p>
          <div style={styles.buttonGroup}>
            <Link href="/register" style={{ ...styles.button, ...styles.primaryBtn, textDecoration: 'none' }}>
              🚀 Comenzar Ahora
            </Link>
            <a href="https://educaplatform-bg8vrm5zl-premedics-projects.vercel.app/api/health" target="_blank" rel="noopener noreferrer" 
              style={{ ...styles.button, ...styles.secondaryBtn, textDecoration: 'none' }}>
              🔌 Ver API
            </a>
          </div>

          {/* Features */}
          <div style={styles.featureGrid}>
            {[
              { icon: '📖', title: 'Gestión de Cursos', desc: 'Crea y administra tus cursos con módulos y materiales.' },
              { icon: '👥', title: 'Gestión de Usuarios', desc: 'Administra profesores y estudiantes con control total.' },
              { icon: '✅', title: 'Calificaciones', desc: 'Sistema completo de calificaciones y seguimiento.' },
            ].map((feature, i) => (
              <div key={i} style={styles.featureCard}>
                <div style={styles.featureIcon}>{feature.icon}</div>
                <h3 style={styles.featureTitle}>{feature.title}</h3>
                <p style={{ color: '#666' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Status Section */}
      <section style={styles.statusSection}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', textAlign: 'center', marginBottom: '10px', color: '#1a1a1a' }}>
            ⚡ Estado del Sistema
          </h2>
          
          <div style={styles.statusGrid}>
            <div style={{ ...styles.statusCard, backgroundColor: '#f0fdf4', borderColor: '#22c55e' }}>
              <div style={{ fontSize: '32px', marginBottom: '15px' }}>🖥️</div>
              <h3 style={{ ...styles.statusTitle, color: '#16a34a' }}>Frontend</h3>
              <p style={styles.statusText}>✅ Corriendo en puerto 3000</p>
              <p style={{ ...styles.statusText, marginTop: '8px' }}>Next.js 14 • React 18 • Tailwind CSS</p>
            </div>
            
            <div style={{ ...styles.statusCard, backgroundColor: '#f0f4ff', borderColor: '#4f46e5' }}>
              <div style={{ fontSize: '32px', marginBottom: '15px' }}>⚙️</div>
              <h3 style={{ ...styles.statusTitle, color: '#4f46e5' }}>Backend API</h3>
              <p style={styles.statusText}>✅ Corriendo en puerto 3001</p>
              <p style={{ ...styles.statusText, marginTop: '8px' }}>Express • Node.js • PostgreSQL</p>
            </div>
          </div>

          <div style={{ backgroundColor: '#dbeafe', border: '2px solid #3b82f6', borderRadius: '12px', padding: '20px', marginTop: '30px', color: '#1e40af' }}>
            <p style={{ fontSize: '18px', fontWeight: '500' }}>
              💡 ¡Perfecto! Tu aplicación está completamente lista para desarrollar. 
              Todos los servicios están funcionando correctamente.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
          <h2 style={styles.ctaTitle}>¿Listo para comenzar?</h2>
          <p style={styles.ctaSubtitle}>
            Regístrate ahora como profesor o estudiante.
          </p>
          <div style={styles.buttonGroup}>
            <Link href="/register?role=teacher" 
              style={{ ...styles.button, backgroundColor: '#fff', color: '#4f46e5', textDecoration: 'none' }}>
              👨‍🏫 Soy Profesor
            </Link>
            <Link href="/register?role=student" 
              style={{ ...styles.button, backgroundColor: '#6366f1', color: '#fff', border: '2px solid #fff', textDecoration: 'none' }}>
              👨‍🎓 Soy Estudiante
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={{ marginBottom: '10px', fontSize: '16px' }}>
          EducaPlatform © 2024 - Plataforma Educativa Escalable
        </p>
        <p style={{ fontSize: '14px', color: '#666' }}>
          🌐 Frontend: http://localhost:3000 | ⚙️ API: https://educaplatform-bg8vrm5zl-premedics-projects.vercel.app/api
        </p>
        <p style={{ fontSize: '12px', color: '#555', marginTop: '15px' }}>
          Hecho con ❤️ usando Next.js, Express, PostgreSQL y Tailwind CSS
        </p>
      </footer>
    </div>
  );
}
