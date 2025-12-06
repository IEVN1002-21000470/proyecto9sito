import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InfoAcademicaService {
  private baseUrl = 'http://127.0.0.1:5000/api';

  constructor(private http: HttpClient) { }

  getVacantes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/bolsa`);
  }

  getCursos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/cursos`);
  }

  getDirectorio(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/directorio`);
  }

  getEventosCalendario(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/calendario`);
  }

  // --- Método para crear reporte ---
  crearReporte(reporte: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/reportes`, reporte);
  }
}
