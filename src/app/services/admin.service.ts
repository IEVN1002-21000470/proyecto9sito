import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

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
  tipo: string; // Cambiado a string para ser flexible
  descripcion: string;
  autor: string;
  fecha: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://127.0.0.1:5000/api';
  isBrowser: boolean;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // --- USUARIOS ---
  getUsuarios(): Observable<UsuarioSistema[]> {
    return this.http.get<UsuarioSistema[]>(`${this.apiUrl}/usuarios`);
  }
  crearUsuario(usuario: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/usuarios`, {
      nombre: usuario.nombre, correo: usuario.correo, password: usuario.password, rol: usuario.rol
    });
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

  // --- MODERACIÓN (CORREGIDO) ---
  getPendientes(): Observable<ItemPendiente[]> {
    return this.http.get<ItemPendiente[]>(`${this.apiUrl}/moderacion/pendientes`);
  }

  moderarItem(tipo: string, id: number, accion: 'aprobar' | 'rechazar'): Observable<any> {
    // CORRECCIÓN CRÍTICA: Normalizamos el tipo para que coincida con el backend
    let endpointTipo = 'mercado';

    // Si el tipo es Raite, Raites, raite... lo mandamos al endpoint 'raites'
    if (tipo && tipo.toLowerCase().includes('raite')) {
        endpointTipo = 'raites';
    } else {
        endpointTipo = 'mercado';
    }

    return this.http.put(`${this.apiUrl}/moderacion/${endpointTipo}/${id}/${accion}`, {});
  }

  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/stats`);
  }

  // --- OTROS MÓDULOS ---
  crearVacante(vacante: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/bolsa`, vacante);
  }
  eliminarVacante(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/bolsa/${id}`);
  }
  crearCurso(curso: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cursos`, curso);
  }
  eliminarCurso(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/cursos/${id}`);
  }
  crearContacto(contacto: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/directorio`, contacto);
  }
  eliminarContacto(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/directorio/${id}`);
  }

  // --- REPORTES ---
  getReportes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reportes`);
  }
}
