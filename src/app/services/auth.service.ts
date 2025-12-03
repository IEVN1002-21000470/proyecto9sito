import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://127.0.0.1:5000/api/auth';
  private usuarioKey = '9sito_user';

  constructor(private http: HttpClient, private router: Router) { }

  // --- LOGIN ---
  login(credentials: {email: string, password: string}): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.exito) {
          localStorage.setItem(this.usuarioKey, JSON.stringify(response.usuario));
        }
      })
    );
  }

  // --- REGISTRO DE ADMIN ---
  registroAdmin(datos: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/registro-admin`, datos);
  }

  // --- PUNTO 1: CERRAR SESIÓN ---
  logout() {
    localStorage.removeItem(this.usuarioKey);
    this.router.navigate(['/login']);
  }

  // --- HELPER: OBTENER USUARIO ---
  get usuarioActual() {
    if (typeof localStorage !== 'undefined') {
      const userStr = localStorage.getItem(this.usuarioKey);
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  // --- HELPER: ESTÁ LOGUEADO ---
  estaLogueado(): boolean {
    if (typeof localStorage !== 'undefined') {
      return !!localStorage.getItem(this.usuarioKey);
    }
    return false;
  }

  // --- HELPER: ES ADMIN ---
  esAdmin(): boolean {
    const user = this.usuarioActual;
    return user && user.rol === 'Admin';
  }
}