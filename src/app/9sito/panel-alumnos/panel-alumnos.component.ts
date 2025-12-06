import { Component } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-panel-alumnos',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './panel-alumnos.html',
  styleUrls: ['./panel-alumnos.css']
})
export class PanelAlumnosComponent {

  // Inyectar el servicio como 'public' o usar un getter para acceder desde el HTML
  constructor(public authService: AuthService) {}

  // Getter para facilitar el acceso a los datos del usuario en el HTML
  get usuario() {
    return this.authService.usuarioActual;
  }

  cerrarSesion() {
    this.authService.logout();
  }
}
