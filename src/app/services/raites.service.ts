import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Raite {
  id?: number;
  tipo: 'Conductor' | 'Pasajero';
  origen: string;
  destino: string;
  hora: string;
  cupo: number;
  nota?: string;
  usuario_id?: number;
  usuario?: string;
  foto?: string;
  telefono?: string;
  ids_pasajeros?: number[]; // IDs de usuarios que ya pidieron
  pasajeros?: any[];        // Lista detallada
}

@Injectable({
  providedIn: 'root'
})
export class RaitesService {
  private apiUrl = 'http://127.0.0.1:5000/api/raites';

  constructor(private http: HttpClient) { }

  getRaites(): Observable<Raite[]> {
    return this.http.get<Raite[]>(this.apiUrl);
  }

  crearRaite(raite: Raite): Observable<any> {
    return this.http.post<any>(this.apiUrl, raite);
  }

  // Enviar usuario_id en el body para validación
  solicitarCupo(id: number, usuario_id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/solicitar`, { usuario_id });
  }

  eliminarRaite(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
