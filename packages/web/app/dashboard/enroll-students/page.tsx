// packages/web/app/dashboard/enroll-students/page.tsx
'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  nombre: string;
  dni: string;
  email: string;
  rol: string;
}

interface Course {
  id: string;
  nombre: string;
}

interface Enrollment {
  id: string;
  curso_id: string;
  estudiante_id: string;
  estudiante_nombre: string;
  estado: string;
}

export default function EnrollStudentsPage() {
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchDni, setSearchDni] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newStudent, setNewStudent] = useState({
    nombre: '',
    dni: '',
    email: '',
    clave: '',
    repetirClave: '',
  });
  const [createMessage, setCreateMessage] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Obtener usuarios
      const usersRes = await fetch('http://https://educaplatform-bg8vrm5zl-premedics-projects.vercel.app/api/auth/users', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const usersData = await usersRes.json();
      const formattedUsers = (usersData.users || []).map((u: any) => ({
        ...u,
        dni: u.dni || u.id.substring(0, 8),
      }));
      setUsers(formattedUsers);

      // Simulamos cursos
      const mockCourses = [
        { id: '1', nombre: 'Matemáticas Avanzadas' },
        { id: '2', nombre: 'Programación Web' },
        { id: '3', nombre: 'Física Moderna' },
      ];
      setCourses(mockCourses);

      // Simulamos inscripciones
      const mockEnrollments = [
        { id: '1', curso_id: '1', estudiante_id: 'est1', estudiante_nombre: 'Juan García', estado: 'ACTIVO' },
      ];
      setEnrollments(mockEnrollments);

      setLoading(false);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setLoading(false);
    }
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleEnroll = () => {
    if (!selectedCourse) {
      setMessage('⚠️ Selecciona un curso');
      return;
    }
    if (selectedStudents.length === 0) {
      setMessage('⚠️ Selecciona al menos un estudiante');
      return;
    }

    const newEnrollments = selectedStudents.map(studentId => {
      const student = users.find(u => u.id === studentId);
      return {
        id: String(Date.now()),
        curso_id: selectedCourse,
        estudiante_id: studentId,
        estudiante_nombre: student?.nombre || 'Desconocido',
        estado: 'ACTIVO',
      };
    });

    setEnrollments([...enrollments, ...newEnrollments]);
    setMessage(`✅ ${selectedStudents.length} estudiante(s) inscrito(s) correctamente`);
    setSelectedStudents([]);

    setTimeout(() => setMessage(''), 3000);
  };

  const handleRemoveEnrollment = (enrollmentId: string) => {
    setEnrollments(enrollments.filter(e => e.id !== enrollmentId));
    setMessage('✅ Inscripción eliminada');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleCreateStudent = async () => {
    if (!newStudent.nombre || !newStudent.dni || !newStudent.email || !newStudent.clave) {
      setCreateMessage('⚠️ Completa todos los campos');
      return;
    }

    if (newStudent.clave !== newStudent.repetirClave) {
      setCreateMessage('⚠️ Las contraseñas no coinciden');
      return;
    }

    if (newStudent.dni.length < 6) {
      setCreateMessage('⚠️ El DNI debe tener al menos 6 caracteres');
      return;
    }

    // Verificar si DNI ya existe
    if (users.some(u => u.dni === newStudent.dni)) {
      setCreateMessage('⚠️ Ya existe un estudiante con ese DNI');
      return;
    }

    try {
      const response = await fetch('http://https://educaplatform-bg8vrm5zl-premedics-projects.vercel.app/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: newStudent.nombre,
          email: newStudent.email,
          password: newStudent.clave,
          rol: 'STUDENT',
          dni: newStudent.dni,
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        const createdStudent = {
          id: data.user.id,
          nombre: newStudent.nombre,
          dni: newStudent.dni,
          email: newStudent.email,
          rol: 'STUDENT',
        };

        setUsers([...users, createdStudent]);
        setCreateMessage(`✅ Estudiante ${newStudent.nombre} creado correctamente`);
        setNewStudent({ nombre: '', dni: '', email: '', clave: '', repetirClave: '' });
        setShowCreateForm(false);

        setTimeout(() => setCreateMessage(''), 3000);
      } else {
        setCreateMessage(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setCreateMessage('❌ Error al crear estudiante');
    }
  };

  const students = users.filter(u => u.rol === 'STUDENT');
  const filteredStudents = students.filter(s =>
    s.dni.toLowerCase().includes(searchDni.toLowerCase()) ||
    s.nombre.toLowerCase().includes(searchDni.toLowerCase())
  );
  const selectedCourseData = courses.find(c => c.id === selectedCourse);
  const courseEnrollments = selectedCourse
    ? enrollments.filter(e => e.curso_id === selectedCourse)
    : [];

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
    section: { marginBottom: '30px', backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    sectionTitle: { fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px' },
    sectionTitleWithButton: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' },
    select: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', marginBottom: '15px' },
    input: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', marginBottom: '12px', fontFamily: 'inherit' },
    searchInput: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', marginBottom: '15px' },
    studentsList: { maxHeight: '400px', overflowY: 'auto' as const, border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb' },
    studentItem: {
      padding: '12px 16px',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    checkbox: { width: '20px', height: '20px', cursor: 'pointer' },
    studentName: { fontWeight: '600', color: '#1f2937' },
    studentInfo: { fontSize: '12px', color: '#6b7280' },
    button: { padding: '10px 20px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
    buttonSmall: { padding: '8px 16px', fontSize: '13px' },
    buttonGreen: { backgroundColor: '#10b981' },
    buttonRed: { backgroundColor: '#ef4444' },
    buttonSecondary: { backgroundColor: '#6b7280' },
    enrollmentTable: { width: '100%', borderCollapse: 'collapse' as const },
    th: { padding: '12px 15px', backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb', textAlign: 'left' as const, fontWeight: '600', color: '#6b7280', fontSize: '12px' },
    td: { padding: '12px 15px', borderBottom: '1px solid #e5e7eb', fontSize: '13px', color: '#374151' },
    badge: { display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', backgroundColor: '#d1fae5', color: '#065f46' },
    deleteButton: { padding: '6px 12px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
    formContainer: { backgroundColor: '#f9fafb', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '15px' },
    formTitle: { marginTop: 0, marginBottom: '15px', fontSize: '14px', fontWeight: '600', color: '#1f2937' },
    emptyState: { textAlign: 'center' as const, padding: '40px', color: '#6b7280' },
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>⏳ Cargando...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📚 Inscribir Estudiantes</h1>
        <p style={styles.subtitle}>Gestiona la inscripción de estudiantes en tus cursos</p>
      </div>

      {message && <div style={styles.message}>{message}</div>}

      <div style={styles.grid}>
        {/* COLUMNA IZQUIERDA */}
        <div>
          {/* SELECCIONAR CURSO */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Seleccionar Curso</h2>
            <select
              style={styles.select}
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">-- Selecciona un curso --</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* CREAR ESTUDIANTE */}
          <div style={styles.section}>
            <div style={styles.sectionTitleWithButton}>
              <h2 style={styles.sectionTitle}>Crear Estudiante</h2>
              <button
                style={{ ...styles.button, ...styles.buttonSmall, ...styles.buttonGreen, marginBottom: 0 }}
                onClick={() => setShowCreateForm(!showCreateForm)}
              >
                {showCreateForm ? '✕ Cancelar' : '➕ Nuevo'}
              </button>
            </div>

            {showCreateForm && (
              <div style={styles.formContainer}>
                {createMessage && (
                  <div style={{
                    ...styles.message,
                    ...(createMessage.includes('Error') || createMessage.includes('⚠️') ? styles.errorMessage : {}),
                    marginBottom: '15px'
                  }}>
                    {createMessage}
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Nombre completo"
                  style={styles.input}
                  value={newStudent.nombre}
                  onChange={(e) => setNewStudent({ ...newStudent, nombre: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="DNI (sin espacios ni caracteres especiales)"
                  style={styles.input}
                  value={newStudent.dni}
                  onChange={(e) => setNewStudent({ ...newStudent, dni: e.target.value })}
                />
                <input
                  type="email"
                  placeholder="Email (solo para recuperar contraseña)"
                  style={styles.input}
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                />
                <input
                  type="password"
                  placeholder="Contraseña"
                  style={styles.input}
                  value={newStudent.clave}
                  onChange={(e) => setNewStudent({ ...newStudent, clave: e.target.value })}
                />
                <input
                  type="password"
                  placeholder="Repetir Contraseña"
                  style={styles.input}
                  value={newStudent.repetirClave}
                  onChange={(e) => setNewStudent({ ...newStudent, repetirClave: e.target.value })}
                />
                <button
                  style={{ ...styles.button, ...styles.buttonGreen, width: '100%' }}
                  onClick={handleCreateStudent}
                >
                  ✅ Crear Estudiante
                </button>
              </div>
            )}
          </div>

          {/* BUSCAR ESTUDIANTES */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Buscar Estudiantes</h2>
            <input
              type="text"
              placeholder="🔍 Buscar por DNI o nombre..."
              style={styles.searchInput}
              value={searchDni}
              onChange={(e) => setSearchDni(e.target.value)}
            />

            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '15px' }}>
              Disponibles: {filteredStudents.length}
            </p>

            {filteredStudents.length > 0 ? (
              <>
                <div style={styles.studentsList}>
                  {filteredStudents.map(student => (
                    <div
                      key={student.id}
                      style={styles.studentItem}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f0f4ff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      onClick={() => handleSelectStudent(student.id)}
                    >
                      <input
                        type="checkbox"
                        style={styles.checkbox}
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => {}}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={styles.studentName}>{student.nombre}</div>
                        <div style={styles.studentInfo}>DNI: {student.dni}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button style={{ ...styles.button, width: '100%', marginTop: '15px' }} onClick={handleEnroll}>
                  ✅ Inscribir {selectedStudents.length > 0 ? `(${selectedStudents.length})` : ''}
                </button>
              </>
            ) : (
              <div style={styles.emptyState}>
                <p>👥 No hay estudiantes que coincidan</p>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA - INSCRITOS */}
        <div>
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              {selectedCourseData
                ? `Inscritos en ${selectedCourseData.nombre}`
                : 'Selecciona un curso'}
            </h2>

            {selectedCourse ? (
              <>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '15px' }}>
                  Total inscritos: {courseEnrollments.length}
                </p>
                {courseEnrollments.length > 0 ? (
                  <table style={styles.enrollmentTable}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Estudiante</th>
                        <th style={styles.th}>DNI</th>
                        <th style={styles.th}>Estado</th>
                        <th style={styles.th}>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courseEnrollments.map(enrollment => {
                        const student = users.find(u => u.id === enrollment.estudiante_id);
                        return (
                          <tr key={enrollment.id}>
                            <td style={styles.td}><strong>{enrollment.estudiante_nombre}</strong></td>
                            <td style={styles.td}>{student?.dni || '-'}</td>
                            <td style={styles.td}>
                              <span style={styles.badge}>{enrollment.estado}</span>
                            </td>
                            <td style={styles.td}>
                              <button
                                style={styles.deleteButton}
                                onClick={() => handleRemoveEnrollment(enrollment.id)}
                              >
                                🗑️ Remover
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div style={styles.emptyState}>
                    <p>👥 No hay estudiantes inscritos</p>
                  </div>
                )}
              </>
            ) : (
              <div style={styles.emptyState}>
                <p>📚 Selecciona un curso arriba</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
