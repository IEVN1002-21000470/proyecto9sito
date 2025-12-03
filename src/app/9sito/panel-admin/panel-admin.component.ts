import { Component } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service'; // <--- IMPORTANTE

@Component({
  selector: 'app-panel-admin',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './panel-admin.html',
  styleUrls: ['./panel-admin.css']
})
export class PanelAdminComponent {

  // Inyectamos el servicio de autenticación
  constructor(private authService: AuthService) {}

  // Esta función es la que llamará el botón del HTML
  cerrarSesion() {
    this.authService.logout();
  }
}
