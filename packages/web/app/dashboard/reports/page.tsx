// packages/web/app/dashboard/reports/page.tsx
'use client';

import { useState, useEffect } from 'react';

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState('overview');

  const styles = {
    container: { marginBottom: '30px' },
    header: {
      marginBottom: '30px',
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '20px',
    },
    tabs: {
      display: 'flex',
      gap: '10px',
      marginBottom: '30px',
      borderBottom: '2px solid #e5e7eb',
    },
    tab: {
      padding: '12px 20px',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '600',
      color: '#6b7280',
      borderBottom: '3px solid transparent',
      transition: 'all 0.3s',
    },
    tabActive: {
      color: '#4f46e5',
      borderBottom: '3px solid #4f46e5',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginBottom: '30px',
    },
    card: {
      backgroundColor: '#fff',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb',
    },
    cardTitle: {
      fontSize: '14px',
      color: '#6b7280',
      marginBottom: '8px',
    },
    cardValue: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '8px',
    },
    cardChange: {
      fontSize: '12px',
      color: '#10b981',
    },
    chartCard: {
      backgroundColor: '#fff',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb',
      marginBottom: '20px',
    },
    chartTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '20px',
    },
    chart: {
      height: '300px',
      backgroundColor: '#f3f4f6',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-around',
      padding: '20px',
      gap: '10px',
    },
    bar: {
      flex: 1,
      backgroundColor: '#4f46e5',
      borderRadius: '6px 6px 0 0',
      position: 'relative' as const,
      transition: 'all 0.3s',
    },
    barLabel: {
      position: 'absolute' as const,
      bottom: '-25px',
      left: '50%',
      transform: 'translateX(-50%)',
      fontSize: '12px',
      fontWeight: '600',
      color: '#6b7280',
      whiteSpace: 'nowrap',
    },
    barValue: {
      position: 'absolute' as const,
      top: '-25px',
      left: '50%',
      transform: 'translateX(-50%)',
      fontSize: '12px',
      fontWeight: '600',
      color: '#1f2937',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
    },
    th: {
      padding: '12px',
      backgroundColor: '#f9fafb',
      borderBottom: '2px solid #e5e7eb',
      textAlign: 'left' as const,
      fontWeight: '600',
      color: '#6b7280',
      fontSize: '12px',
    },
    td: {
      padding: '12px',
      borderBottom: '1px solid #e5e7eb',
      color: '#374151',
    },
  };

  const stats = [
    { icon: '📊', label: 'Ingresos Totales', value: '$45,230', change: '+12% vs mes pasado' },
    { icon: '👥', label: 'Usuarios Activos', value: '1,248', change: '+145 este mes' },
    { icon: '📚', label: 'Cursos', value: '45', change: '+3 nuevos' },
    { icon: '📈', label: 'Tasa de Conversión', value: '3.2%', change: '+0.5% vs mes pasado' },
  ];

  const enrollmentData = [
    { mes: 'Ene', valor: 120 },
    { mes: 'Feb', valor: 190 },
    { mes: 'Mar', valor: 150 },
    { mes: 'Abr', valor: 220 },
    { mes: 'May', valor: 280 },
    { mes: 'Jun', valor: 350 },
  ];

  const coursePerformance = [
    { nombre: 'Matemáticas Avanzadas', estudiantes: 45, promedio: 8.5, completado: 92 },
    { nombre: 'Programación Web', estudiantes: 32, promedio: 9.1, completado: 88 },
    { nombre: 'Física Moderna', estudiantes: 28, promedio: 7.8, completado: 75 },
    { nombre: 'Historia', estudiantes: 35, promedio: 8.2, completado: 85 },
  ];

  const maxEnrollment = Math.max(...enrollmentData.map(d => d.valor));

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📊 Reportes y Análisis</h1>

        <div style={styles.tabs}>
          {[
            { id: 'overview', label: 'Resumen' },
            { id: 'enrollment', label: 'Inscripciones' },
            { id: 'performance', label: 'Desempeño' },
          ].map((tab) => (
            <button
              key={tab.id}
              style={{
                ...styles.tab,
                ...(selectedReport === tab.id ? styles.tabActive : {}),
              }}
              onClick={() => setSelectedReport(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Report */}
      {selectedReport === 'overview' && (
        <>
          <div style={styles.grid}>
            {stats.map((stat, i) => (
              <div key={i} style={styles.card}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{stat.icon}</div>
                <p style={styles.cardTitle}>{stat.label}</p>
                <p style={styles.cardValue}>{stat.value}</p>
                <p style={styles.cardChange}>{stat.change}</p>
              </div>
            ))}
          </div>

          {/* Revenue Chart */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>💰 Ingresos Mensuales</h3>
            <div style={styles.chart}>
              {[
                { mes: 'Ene', valor: 3200 },
                { mes: 'Feb', valor: 4100 },
                { mes: 'Mar', valor: 3800 },
                { mes: 'Abr', valor: 5200 },
                { mes: 'May', valor: 6100 },
                { mes: 'Jun', valor: 8500 },
              ].map((item) => (
                <div
                  key={item.mes}
                  style={{
                    ...styles.bar,
                    height: `${(item.valor / 8500) * 100}%`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#6366f1';
                    e.currentTarget.style.transform = 'scaleY(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#4f46e5';
                    e.currentTarget.style.transform = 'scaleY(1)';
                  }}
                >
                  <div style={styles.barValue}>${item.valor}</div>
                  <div style={styles.barLabel}>{item.mes}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Enrollment Report */}
      {selectedReport === 'enrollment' && (
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>📈 Inscripciones Mensuales</h3>
          <div style={styles.chart}>
            {enrollmentData.map((item) => (
              <div
                key={item.mes}
                style={{
                  ...styles.bar,
                  height: `${(item.valor / maxEnrollment) * 100}%`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#10b981';
                  e.currentTarget.style.transform = 'scaleY(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#4f46e5';
                  e.currentTarget.style.transform = 'scaleY(1)';
                }}
              >
                <div style={styles.barValue}>{item.valor}</div>
                <div style={styles.barLabel}>{item.mes}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Report */}
      {selectedReport === 'performance' && (
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>📚 Desempeño por Curso</h3>
          <table style={styles.table}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={styles.th}>Curso</th>
                <th style={styles.th}>Estudiantes</th>
                <th style={styles.th}>Promedio</th>
                <th style={styles.th}>Completado</th>
              </tr>
            </thead>
            <tbody>
              {coursePerformance.map((course, i) => (
                <tr key={i}>
                  <td style={styles.td}><strong>{course.nombre}</strong></td>
                  <td style={styles.td}>{course.estudiantes}</td>
                  <td style={styles.td}>
                    <span style={{
                      padding: '4px 12px',
                      backgroundColor: '#d1fae5',
                      color: '#065f46',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}>
                      {course.promedio}/10
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={{
                      width: '100px',
                      height: '8px',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${course.completado}%`,
                        height: '100%',
                        backgroundColor: '#4f46e5',
                      }} />
                    </div>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{course.completado}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
