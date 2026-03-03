// packages/web/lib/sync-users-service.ts
// Servicio para sincronizar usuarios entre frontend y backend

export class SyncUsersService {
  private static API_URL = 'https://educaplatform-bg8vrm5zl-premedics-projects.vercel.app/api';

  /**
   * Sincronizar un nuevo usuario al backend
   */
  static async syncUserToBackend(user: any): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        console.log('✅ Usuario sincronizado al backend:', user.dni);
        return true;
      } else {
        console.error('❌ Error al sincronizar usuario:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('❌ Error de conexión al sincronizar:', error);
      // Continuar sin error - el usuario se guarda localmente
      return false;
    }
  }

  /**
   * Obtener todos los usuarios del backend
   */
  static async getAllUsersFromBackend(): Promise<any[]> {
    try {
      const response = await fetch(`${this.API_URL}/users`);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Usuarios obtenidos del backend:', data.length);
        return data;
      }
      return [];
    } catch (error) {
      console.error('❌ Error al obtener usuarios del backend:', error);
      return [];
    }
  }

  /**
   * Sincronizar usuario eliminado
   */
  static async syncDeleteUserToBackend(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_URL}/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('✅ Usuario eliminado del backend:', userId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error al eliminar usuario del backend:', error);
      return false;
    }
  }
}
