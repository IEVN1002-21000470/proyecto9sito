import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si el usuario YA tiene sesión iniciada...
  if (authService.estaLogueado()) {
    
    // Obtenemos su rol para saber a qué dashboard mandarlo
    const usuario = authService.usuarioActual;
    const rol = usuario ? usuario.rol : null;
    
    // Redirigimos según el rol
    if (rol === 'Admin') {
      router.navigate(['/admin/dashboardAdmin']);
    } else if (rol === 'Docente') {
      router.navigate(['/docente/dashboardDocentes']);
    } else {
      router.navigate(['/alumno/dashboard']); // Default a alumno
    }
    
    return false; // BLOQUEAMOS la entrada al Login
  }
  
  // Si NO está logueado, dejamos pasar (return true) para que vea el Login
  return true;
};