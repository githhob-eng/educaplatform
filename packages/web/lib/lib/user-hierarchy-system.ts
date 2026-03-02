// Sistema de jerarquía de usuarios
// Este archivo contiene la lógica de administración jerárquica

export interface UserHierarchy {
  id: string;
  nombre: string;
  email: string;
  dni: string;
  rol: 'ADMIN' | 'TEACHER' | 'STUDENT';
  estado: 'ACTIVE' | 'BLOCKED';
  password: string;
  creado_por_id?: string; // ID del admin que lo creó
  comunidad_id: string; // ID de la comunidad a la que pertenece
  fecha_creacion: string;
}

export interface Comunidad {
  id: string;
  admin_id: string;
  nombre: string;
  descripcion: string;
  fecha_creacion: string;
}

export class UserHierarchyManager {
  private users: UserHierarchy[] = [];
  private comunidades: Comunidad[] = [];

  // Cargar datos
  load() {
    const savedUsers = localStorage.getItem('hierarchy_users');
    const savedComunidades = localStorage.getItem('hierarchy_comunidades');
    
    if (savedUsers) this.users = JSON.parse(savedUsers);
    if (savedComunidades) this.comunidades = JSON.parse(savedComunidades);
  }

  // Guardar datos
  save() {
    localStorage.setItem('hierarchy_users', JSON.stringify(this.users));
    localStorage.setItem('hierarchy_comunidades', JSON.stringify(this.comunidades));
  }

  // Crear usuario en comunidad
  createUser(user: UserHierarchy, adminCreadorId: string): { success: boolean; message: string } {
    // Validar DNI único
    if (this.users.some(u => u.dni === user.dni)) {
      return { success: false, message: 'El DNI ya existe' };
    }

    // Validar email único
    if (this.users.some(u => u.email === user.email)) {
      return { success: false, message: 'El email ya existe' };
    }

    const adminCreador = this.users.find(u => u.id === adminCreadorId);
    if (!adminCreador || adminCreador.rol !== 'ADMIN') {
      return { success: false, message: 'Admin creador no válido' };
    }

    user.creado_por_id = adminCreadorId;
    user.comunidad_id = adminCreador.comunidad_id;
    user.fecha_creacion = new Date().toISOString();

    this.users.push(user);
    this.save();

    return { success: true, message: 'Usuario creado exitosamente' };
  }

  // Obtener descendencia de un admin
  getDescendants(adminId: string): UserHierarchy[] {
    return this.users.filter(u => u.creado_por_id === adminId);
  }

  // Obtener ascendencia (quien lo creó y sus creadores)
  getAscendants(userId: string): UserHierarchy[] {
    const ascendants: UserHierarchy[] = [];
    let currentUserId = userId;

    while (true) {
      const user = this.users.find(u => u.id === currentUserId);
      if (!user || !user.creado_por_id) break;

      const creator = this.users.find(u => u.id === user.creado_por_id);
      if (!creator) break;

      ascendants.push(creator);
      currentUserId = creator.id;
    }

    return ascendants;
  }

  // Obtener hermanos (otros usuarios creados por el mismo admin)
  getSiblings(userId: string): UserHierarchy[] {
    const user = this.users.find(u => u.id === userId);
    if (!user || !user.creado_por_id) return [];

    return this.users.filter(u => u.creado_por_id === user.creado_por_id && u.id !== userId);
  }

  // Validar si un admin puede eliminar a otro usuario
  canDeleteUser(adminId: string, targetUserId: string): { can: boolean; reason: string } {
    const admin = this.users.find(u => u.id === adminId);
    const target = this.users.find(u => u.id === targetUserId);

    if (!admin || admin.rol !== 'ADMIN') {
      return { can: false, reason: 'No eres admin' };
    }

    if (!target) {
      return { can: false, reason: 'Usuario no existe' };
    }

    // Un admin no puede eliminarse a sí mismo
    if (adminId === targetUserId) {
      return { can: false, reason: 'No puedes eliminarte a ti mismo' };
    }

    // Un admin no puede eliminar su ascendencia (creador o creador del creador)
    const ascendants = this.getAscendants(adminId);
    if (ascendants.some(a => a.id === targetUserId)) {
      return { can: false, reason: 'No puedes eliminar a tu ascendencia' };
    }

    // Un admin puede eliminar su descendencia
    if (target.creado_por_id === adminId) {
      return { can: true, reason: 'Puedes eliminar este usuario' };
    }

    return { can: false, reason: 'No tienes permiso para eliminar este usuario' };
  }

  // Eliminar usuario y reasignar descendencia
  deleteUserWithReassignment(adminId: string, targetUserId: string): { success: boolean; message: string; reassignedCount?: number } {
    const validation = this.canDeleteUser(adminId, targetUserId);
    if (!validation.can) {
      return { success: false, message: validation.reason };
    }

    // Obtener descendientes del usuario a eliminar
    const descendants = this.getDescendants(targetUserId);

    // Reasignar descendientes al admin que elimina
    descendants.forEach(desc => {
      desc.creado_por_id = adminId;
    });

    // Eliminar usuario
    this.users = this.users.filter(u => u.id !== targetUserId);

    this.save();

    return {
      success: true,
      message: `Usuario eliminado. ${descendants.length} usuarios reasignados`,
      reassignedCount: descendants.length,
    };
  }

  // Obtener usuarios visibles para un admin (su comunidad)
  getVisibleUsers(adminId: string): UserHierarchy[] {
    const admin = this.users.find(u => u.id === adminId);
    if (!admin) return [];

    // Los admins ven todos en su comunidad
    if (admin.rol === 'ADMIN') {
      return this.users.filter(u => u.comunidad_id === admin.comunidad_id);
    }

    // Los profesores ven solo sus estudiantes
    if (admin.rol === 'TEACHER') {
      return this.users.filter(u => u.creado_por_id === adminId);
    }

    return [];
  }

  // Obtener profesores visibles para un admin
  getVisibleTeachers(adminId: string): UserHierarchy[] {
    const visibleUsers = this.getVisibleUsers(adminId);
    return visibleUsers.filter(u => u.rol === 'TEACHER');
  }

  // Obtener estudiantes visibles para un admin/profesor
  getVisibleStudents(userId: string): UserHierarchy[] {
    const user = this.users.find(u => u.id === userId);
    if (!user) return [];

    if (user.rol === 'ADMIN') {
      return this.users.filter(u => u.comunidad_id === user.comunidad_id && u.rol === 'STUDENT');
    }

    if (user.rol === 'TEACHER') {
      return this.users.filter(u => u.creado_por_id === userId && u.rol === 'STUDENT');
    }

    return [];
  }

  // Enviar notificación de reasignación
  notifyReassignment(newAdminId: string, reassignedCount: number): void {
    const notification = {
      id: 'notif-' + Date.now(),
      titulo: '👥 Usuarios reasignados',
      mensaje: `Se te asignaron ${reassignedCount} usuario(s) de una eliminación en cascada`,
      tipo: 'info',
      enviado_por: 'Sistema',
      enviado_por_id: 'system',
      fecha: new Date().toISOString(),
      leido_por: [],
      para_usuarios: [newAdminId],
      prioridad: 'media',
    };

    const notifications = localStorage.getItem('all_notifications');
    const notifList = notifications ? JSON.parse(notifications) : [];
    notifList.push(notification);
    localStorage.setItem('all_notifications', JSON.stringify(notifList));
  }

  // Obtener todos los usuarios
  getAllUsers(): UserHierarchy[] {
    return this.users;
  }

  // Obtener usuario por ID
  getUserById(id: string): UserHierarchy | undefined {
    return this.users.find(u => u.id === id);
  }

  // Actualizar usuario
  updateUser(id: string, updates: Partial<UserHierarchy>): boolean {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return false;

    this.users[index] = { ...this.users[index], ...updates };
    this.save();
    return true;
  }
}

export const hierarchyManager = new UserHierarchyManager();
