import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service'; // <--- Asegúrate que la ruta sea correcta

export interface Aviso {
  id?: number;
  titulo: string;
  contenido: string;
  categoria: string;
  fecha?: string;
  imagen_url?: string;
  autor?: string;
  autor_id?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AvisosService {

  private apiUrl = 'http://127.0.0.1:5000/api/avisos';

  // CORRECCIÓN AQUÍ: Inyectamos AuthService
  constructor(private http: HttpClient, private authService: AuthService) { }

  getAvisos(): Observable<Aviso[]> {
    return this.http.get<Aviso[]>(this.apiUrl);
  }

  crearAviso(aviso: Aviso, archivoImagen: File | null): Observable<any> {
    const formData = new FormData();
    
    formData.append('titulo', aviso.titulo);
    formData.append('contenido', aviso.contenido);
    formData.append('categoria', aviso.categoria);

    const usuarioId = this.authService.usuarioActual?.id?.toString() || '1'; 
    formData.append('autor_id', usuarioId); 

    if (archivoImagen) {
      formData.append('imagen', archivoImagen);
    }

    return this.http.post(this.apiUrl, formData);
  }

  // Editar
  actualizarAviso(id: number, aviso: Aviso, archivoImagen: File | null): Observable<any> {
    const formData = new FormData();
    formData.append('titulo', aviso.titulo);
    formData.append('contenido', aviso.contenido);
    formData.append('categoria', aviso.categoria);
    
    if (archivoImagen) {
      formData.append('imagen', archivoImagen);
    }

    return this.http.put(`${this.apiUrl}/${id}`, formData);
  }

  // Eliminar
  eliminarAviso(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}