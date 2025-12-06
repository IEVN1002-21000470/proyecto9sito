import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://127.0.0.1:5000/api';
  private usuarioKey = '9sito_user';
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // --- LOGIN ---
  login(credentials: {email: string, password: string}): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        if (response.exito && this.isBrowser) {
          localStorage.setItem(this.usuarioKey, JSON.stringify(response.usuario));
        }
      })
    );
  }

  // --- ACTUALIZAR PERFIL ---
  actualizarPerfil(id: number, datos: { telefono: string, bio: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/usuarios/${id}/perfil`, datos).pipe(
      tap(response => {
        if (response.exito && this.isBrowser) {
          const userActual = this.usuarioActual;
          if (userActual) {
            userActual.telefono = datos.telefono;
            userActual.bio = datos.bio;
            localStorage.setItem(this.usuarioKey, JSON.stringify(userActual));
          }
        }
      })
    );
  }

  // --- OBTENER ESTADÍSTICAS DEL PERFIL (NUEVO) ---
  obtenerEstadisticasUsuario(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/usuarios/${id}/stats`);
  }

  // --- REGISTRO DE ADMIN ---
  registroAdmin(datos: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/registro-admin`, datos);
  }

  // --- CERRAR SESIÓN ---
  logout() {
    if (this.isBrowser) {
      localStorage.removeItem(this.usuarioKey);
    }
    this.router.navigate(['/login']);
  }

  // --- HELPERS ---
  get usuarioActual() {
    if (this.isBrowser) {
      const userStr = localStorage.getItem(this.usuarioKey);
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  estaLogueado(): boolean {
    if (this.isBrowser) {
      return !!localStorage.getItem(this.usuarioKey);
    }
    return false;
  }

  esAdmin(): boolean {
    const user = this.usuarioActual;
    return user && user.rol === 'Admin';
  }
}
