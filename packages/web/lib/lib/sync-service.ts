// packages/web/lib/sync-service.ts
// Servicio para sincronizar usuarios con el backend

const API_URL = 'http://localhost:3001/api';

export const SyncService = {
  /**
   * Crear usuario en el backend
   */
  async createUser(userData: any) {
    try {
      console.log('🔄 Sincronizando usuario al backend...', userData.dni);
      
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Usuario creado en backend:', userData.dni);
        return { success: true, data };
      } else {
        const error = await response.json();
        console.error('❌ Error:', error.error);
        return { success: false, error: error.error };
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      return { success: false, error: 'Error de conexión con el backend' };
    }
  },

  /**
   * Eliminar usuario en el backend
   */
  async deleteUser(userId: string) {
    try {
      console.log('🔄 Eliminando usuario del backend...', userId);
      
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        console.log('✅ Usuario eliminado del backend:', userId);
        return { success: true };
      } else {
        console.error('❌ Error al eliminar');
        return { success: false };
      }
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      return { success: false };
    }
  },

  /**
   * Obtener usuarios del backend
   */
  async getUsers() {
    try {
      const response = await fetch(`${API_URL}/users`);
      if (response.ok) {
        const users = await response.json();
        console.log('✅ Usuarios obtenidos del backend:', users.length);
        return users;
      }
      return [];
    } catch (error) {
      console.error('❌ Error al obtener usuarios:', error);
      return [];
    }
  },
};
