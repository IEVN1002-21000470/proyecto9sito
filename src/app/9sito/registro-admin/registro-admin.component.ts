import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service'; // Usamos AdminService ahora

@Component({
  selector: 'app-registro-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro-admin.html',
  styleUrls: ['./registro-admin.css']
})
export class RegistroAdminComponent {
  
  // Modelo de datos
  usuario = {
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: 'Estudiante' // Valor por defecto
  };

  mensaje: string = '';
  exito: boolean = false;
  cargando: boolean = false;

  constructor(private adminService: AdminService, private router: Router) {}

  registrar() {
    if (this.usuario.password !== this.usuario.confirmPassword) {
      this.mensaje = 'Las contraseñas no coinciden.';
      this.exito = false;
      return;
    }

    this.cargando = true;
    this.mensaje = '';

    // Preparar objeto (enviamos 'correo' como espera el servicio)
    const datosEnviar = {
      nombre: this.usuario.nombre,
      correo: this.usuario.email,
      password: this.usuario.password,
      rol: this.usuario.rol
    };

    this.adminService.crearUsuario(datosEnviar).subscribe({
      next: (res) => {
        this.cargando = false;
        if (res.exito) {
          this.exito = true;
          this.mensaje = 'Usuario registrado correctamente.';
          // Opcional: limpiar formulario
          this.usuario = { nombre: '', email: '', password: '', confirmPassword: '', rol: 'Estudiante' };
        } else {
          this.exito = false;
          this.mensaje = res.mensaje;
        }
      },
      error: (err) => {
        this.cargando = false;
        this.exito = false;
        this.mensaje = 'Error al conectar con el servidor.';
        console.error(err);
      }
    });
  }
}