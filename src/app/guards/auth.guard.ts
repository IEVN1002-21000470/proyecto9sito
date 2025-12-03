import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaLogueado()) {
    return true; // Si hay usuario guardado, lo deja pasar
  } else {
    // Si no hay usuario, lo manda al login
    router.navigate(['/login']);
    return false;
  }
};