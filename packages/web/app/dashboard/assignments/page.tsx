// packages/web/app/dashboard/assignments/page.tsx
'use client';

import { useState, useEffect } from 'react';

interface Assignment {
  id: string;
  titulo: string;
  descripcion: string;
  curso: string;
  profesor: string;
  fechaVencimiento: string;
  estado: 'POR_HACER' | 'ENTREGADO' | 'CALIFICADO' | 'VENCIDO';
  calificacion?: number;
  archivo?: string;
  feedback?: string;
}

export default function AssignmentsPage() {
  const [user, setUser] = useState<any>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: '1',
      titulo: 'Proyecto Final - Calculadora',
      descripcion: 'Crea una calculadora en JavaScript con interfaz gráfica',
      curso: 'Programación Web',
      profesor: 'Ing. López',
      fechaVencimiento: '2024-03-05',
      estado: 'POR_HACER',
      archivo: undefined,
    },
    {
      id: '2',
      titulo: 'Análisis de Caso - Historia',
      descripcion: 'Analiza el impacto de la Revolución Francesa en 2 páginas',
      curso: 'Historia',
      profesor: 'Prof. Martínez',
      fechaVencimiento: '2024-03-01',
      estado: 'ENTREGADO',
      calificacion: 8.5,
      feedback: 'Excelente análisis y redacción. Muy bien documentado.',
    },
    {
      id: '3',
      titulo: 'Problema Set 5',
      descripcion: 'Resuelve los 10 problemas de la página 45-47',
      curso: 'Matemáticas',
      profesor: 'Dr. García',
      fechaVencimiento: '2024-02-28',
      estado: 'VENCIDO',
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [filter, setFilter] = useState<string>('TODOS');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const filteredAssignments =
    filter === 'TODOS'
      ? assignments
      : assignments.filter((a) => a.estado === filter);

  const getDaysUntilDue = (fecha: string) => {
    const hoy = new Date();
    const vencimiento = new Date(fecha);
    const diff = vencimiento.getTime() - hoy.getTime();
    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return dias;
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'POR_HACER':
        return '#f59e0b';
      case 'ENTREGADO':
        return '#3b82f6';
      case 'CALIFICADO':
        return '#10b981';
      case 'VENCIDO':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'POR_HACER':
        return '⏳ Por Hacer';
      case 'ENTREGADO':
        return '📤 Entregado';
      case 'CALIFICADO':
        return '✅ Calificado';
      case 'VENCIDO':
        return '🔴 Vencido';
      default:
        return estado;
    }
  };

  const styles = {
    container: { marginBottom: '30px' },
    header: { marginBottom: '20px' },
    title: { fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' },
    stats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' },
    statCard: { backgroundColor: '#fff', padding: '15px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', textAlign: 'center' as const },
    statNumber: { fontSize: '24px', fontWeight: 'bold', color: '#4f46e5', marginBottom: '5px' },
    statLabel: { fontSize: '12px', color: '#6b7280' },
    filterContainer: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' as const },
    filterButton: { padding: '8px 16px', border: '1px solid #e5e7eb', backgroundColor: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
    filterButtonActive: { backgroundColor: '#4f46e5', color: '#fff', borderColor: '#4f46e5' },
    assignmentCard: { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', marginBottom: '15px', cursor: 'pointer', transition: 'all 0.2s' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' },
    cardTitle: { fontSize: '16px', fontWeight: 'bold', color: '#1f2937', flex: 1 },
    cardBadge: { display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', color: '#fff' },
    cardInfo: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '12px', fontSize: '13px', color: '#6b7280' },
    cardDescription: { fontSize: '13px', color: '#374151', marginBottom: '12px', lineHeight: '1.5' },
    cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #e5e7eb' },
    dueDate: { fontSize: '12px', fontWeight: '600' },
    dueDateSoon: { color: '#ef4444' },
    dueDateOk: { color: '#10b981' },
    button: { padding: '8px 16px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
    modal: { display: 'none', position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: '#fff', borderRadius: '12px', padding: '30px', width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' as const },
    emptyState: { textAlign: 'center' as const, padding: '40px', color: '#6b7280' },
  };

  const pendingCount = assignments.filter(a => a.estado === 'POR_HACER').length;
  const overdueCount = assignments.filter(a => a.estado === 'VENCIDO').length;
  const submittedCount = assignments.filter(a => a.estado === 'ENTREGADO' || a.estado === 'CALIFICADO').length;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📝 Mis Tareas</h1>

        {/* Estadísticas */}
        <div style={styles.stats}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{pendingCount}</div>
            <div style={styles.statLabel}>Por Hacer</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{overdueCount}</div>
            <div style={styles.statLabel}>Vencidas</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{submittedCount}</div>
            <div style={styles.statLabel}>Entregadas</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{assignments.length}</div>
            <div style={styles.statLabel}>Total</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div style={styles.filterContainer}>
        {['TODOS', 'POR_HACER', 'ENTREGADO', 'CALIFICADO', 'VENCIDO'].map((tipo) => (
          <button
            key={tipo}
            style={{
              ...styles.filterButton,
              ...(filter === tipo ? styles.filterButtonActive : {}),
            }}
            onClick={() => setFilter(tipo)}
          >
            {tipo === 'TODOS' ? '📊 Todas' : tipo === 'POR_HACER' ? '⏳ Por Hacer' : tipo === 'ENTREGADO' ? '📤 Entregadas' : tipo === 'CALIFICADO' ? '✅ Calificadas' : '🔴 Vencidas'}
          </button>
        ))}
      </div>

      {/* Tareas */}
      {filteredAssignments.length > 0 ? (
        <div>
          {filteredAssignments.map((assignment) => {
            const diasRestantes = getDaysUntilDue(assignment.fechaVencimiento);
            return (
              <div
                key={assignment.id}
                style={styles.assignmentCard}
                onClick={() => setSelectedAssignment(assignment)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>{assignment.titulo}</h3>
                  <span style={{ ...styles.cardBadge, backgroundColor: getEstadoColor(assignment.estado) }}>
                    {getEstadoLabel(assignment.estado)}
                  </span>
                </div>

                <div style={styles.cardInfo}>
                  <div>📚 {assignment.curso}</div>
                  <div>👨‍🏫 {assignment.profesor}</div>
                </div>

                <p style={styles.cardDescription}>{assignment.descripcion}</p>

                {assignment.feedback && (
                  <div style={{ backgroundColor: '#f0fdf4', padding: '10px 12px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px', borderLeft: '3px solid #10b981' }}>
                    <p style={{ fontWeight: '600', color: '#065f46', marginBottom: '3px' }}>📝 Feedback</p>
                    <p style={{ color: '#047857' }}>{assignment.feedback}</p>
                  </div>
                )}

                <div style={styles.cardFooter}>
                  <div>
                    <span style={styles.dueDate}>
                      📅 Vence: {assignment.fechaVencimiento}
                      {assignment.estado !== 'VENCIDO' && assignment.estado !== 'CALIFICADO' && (
                        <span style={diasRestantes <= 3 ? styles.dueDateSoon : styles.dueDateOk}>
                          {' '}
                          ({diasRestantes} días)
                        </span>
                      )}
                    </span>
                  </div>
                  {assignment.calificacion && (
                    <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#4f46e5' }}>
                      {assignment.calificacion}/10
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <p style={{ fontSize: '40px', marginBottom: '10px' }}>✅</p>
          <p>¡No hay tareas en esta categoría!</p>
        </div>
      )}

      {/* Modal de detalle */}
      {selectedAssignment && (
        <div
          style={{ ...styles.modal, display: 'flex' }}
          onClick={() => setSelectedAssignment(null)}
        >
          <div
            style={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px' }}>
              {selectedAssignment.titulo}
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '15px' }}>
              {selectedAssignment.descripcion}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>Curso</p>
                <p style={{ fontWeight: '600' }}>{selectedAssignment.curso}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>Profesor</p>
                <p style={{ fontWeight: '600' }}>{selectedAssignment.profesor}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>Vence</p>
                <p style={{ fontWeight: '600' }}>{selectedAssignment.fechaVencimiento}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>Estado</p>
                <p style={{ fontWeight: '600', color: getEstadoColor(selectedAssignment.estado) }}>
                  {getEstadoLabel(selectedAssignment.estado)}
                </p>
              </div>
            </div>
            {selectedAssignment.feedback && (
              <div style={{ backgroundColor: '#f0fdf4', padding: '15px', borderRadius: '8px', marginBottom: '20px', borderLeft: '3px solid #10b981' }}>
                <p style={{ fontWeight: '600', color: '#065f46', marginBottom: '8px' }}>📝 Feedback del Profesor</p>
                <p style={{ color: '#047857' }}>{selectedAssignment.feedback}</p>
              </div>
            )}
            <button
              style={{ ...styles.button, width: '100%' }}
              onClick={() => setSelectedAssignment(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
