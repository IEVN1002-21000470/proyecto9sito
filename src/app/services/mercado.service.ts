import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MercadoItem {
  id?: number;
  vendedor_id?: number;
  titulo: string;
  descripcion: string;
  precio: string;
  categoria: string;
  foto_url?: string;
  imagen?: string; // Para visualización del frontend si mapeas diferente
  estado?: string;
  vendedor?: string;
  telefono?: string;
  correo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MercadoService {
  private apiUrl = 'http://127.0.0.1:5000/api/mercado';

  constructor(private http: HttpClient) { }

  getArticulos(): Observable<MercadoItem[]> {
    return this.http.get<MercadoItem[]>(this.apiUrl);
  }

  publicarArticulo(item: MercadoItem, file: File | null, userId: number): Observable<any> {
    const formData = new FormData();
    formData.append('vendedor_id', userId.toString());
    formData.append('titulo', item.titulo);
    formData.append('descripcion', item.descripcion);
    formData.append('precio', item.precio);
    formData.append('categoria', item.categoria);
    if (file) {
      formData.append('imagen', file);
    }
    return this.http.post<any>(this.apiUrl, formData);
  }

  eliminarArticulo(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Método necesario para pausar/reactivar
  cambiarEstadoMercado(id: number, estado: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/estado`, { estado });
  }
}
