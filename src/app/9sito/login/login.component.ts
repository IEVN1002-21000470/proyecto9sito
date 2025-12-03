import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router'; // Importar RouterLink
import { FormsModule } from '@angular/forms'; // Importante para usar [(ngModel)]
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service'; // Importar tu servicio

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], // Agregar módulos necesarios
  templateUrl: './login.html',
  styleUrls: ['./login.css'] // Corregí styleUrl a styleUrls (plural)
})
export class LoginComponent {
  
  // Variables para el formulario
  email: string = '';
  password: string = '';
  mensajeError: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    if (!this.email || !this.password) {
      this.mensajeError = 'Por favor ingresa correo y contraseña.';
      return;
    }

    const credentials = { email: this.email, password: this.password };

    this.authService.login(credentials).subscribe({
      next: (res) => {
        if (res.exito) {
          console.log('Login correcto:', res.usuario);
          
          // Redirección inteligente basada en el ROL
          if (res.usuario.rol === 'Admin') {
            this.router.navigate(['/admin/dashboardAdmin']);
          } else if (res.usuario.rol === 'Docente') {
            this.router.navigate(['/docente/dashboardDocentes']);
          } else {
            this.router.navigate(['/alumno/dashboard']);
          }
        } else {
          this.mensajeError = res.mensaje; // "Contraseña incorrecta", etc.
        }
      },
      error: (err) => {
        console.error(err);
        this.mensajeError = 'Error de conexión con el servidor.';
      }
    });
  }
}