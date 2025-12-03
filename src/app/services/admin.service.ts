import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UsuarioSistema {
  id: number;
  nombre: string;
  correo: string;
  rol: 'Estudiante' | 'Docente' | 'Admin';
  estado: string;
  fecha?: string;
  password?: string;
}

export interface ItemPendiente {
  id: number;
  tipo: 'Raite' | 'Mercado';
  descripcion: string;
  autor: string;
  fecha: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  // CORRECCIÓN: La URL base debe ser solo /api
  private apiUrl = 'http://127.0.0.1:5000/api';

  constructor(private http: HttpClient) { }

  // --- MÉTODOS DE USUARIOS (Ajustamos la ruta agregando /usuarios) ---
  
  getUsuarios(): Observable<UsuarioSistema[]> {
    return this.http.get<UsuarioSistema[]>(`${this.apiUrl}/usuarios`);
  }

  crearUsuario(usuario: any): Observable<any> {
    // Mapeo de datos
    const payload = {
      nombre: usuario.nombre,
      email: usuario.correo,
      password: usuario.password,
      rol: usuario.rol
    };
    return this.http.post<any>(`${this.apiUrl}/usuarios`, payload);
  }

  cambiarEstado(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuarios/${id}/estado`, {});
  }

  actualizarRol(id: number, nuevoRol: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuarios/${id}/rol`, { rol: nuevoRol });
  }

  resetearPassword(id: number, nuevaPass: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuarios/${id}/reset-password`, { password: nuevaPass });
  }

  // --- MÉTODOS DE MODERACIÓN (Ahora sí apuntarán a /api/moderacion/...) ---

  getPendientes(): Observable<ItemPendiente[]> {
    return this.http.get<ItemPendiente[]>(`${this.apiUrl}/moderacion/pendientes`);
  }

  moderarItem(tipo: 'Raite' | 'Mercado', id: number, accion: 'aprobar' | 'rechazar'): Observable<any> {
    const endpointTipo = tipo === 'Raite' ? 'raites' : 'mercado';
    return this.http.put(`${this.apiUrl}/moderacion/${endpointTipo}/${id}/${accion}`, {});
  }
  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/stats`); // Asegúrate que apiUrl sea /api
  }
}