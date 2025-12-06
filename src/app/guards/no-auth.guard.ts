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
    // Si es Admin -> Panel de Admin
    if (rol === 'Admin') {
      router.navigate(['/admin/dashboardAdmin']);
    } else {
      // Para cualquier otro rol (Estudiante, o incluso Docente si existiera por error),
      // lo mandamos al dashboard de Alumnos por defecto.
      router.navigate(['/alumno/dashboard']);
    }

    return false; // BLOQUEAMOS la entrada al Login porque ya está dentro
  }

  // Si NO está logueado, dejamos pasar (return true) para que vea el formulario de Login
  return true;
};
