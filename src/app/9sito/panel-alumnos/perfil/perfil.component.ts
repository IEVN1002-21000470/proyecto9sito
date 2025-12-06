import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class PerfilComponent implements OnInit {

  usuario: any = {
    id: 0,
    nombre: '',
    correo: '',
    rol: '',
    telefono: '',
    bio: '',
    avatar: '',
    publicacionesMercado: 0,
    publicacionesRaites: 0
  };

  guardando: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.cargarDatosUsuario();
  }

  cargarDatosUsuario() {
    const user = this.authService.usuarioActual;

    if (user) {
      this.usuario = {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo || 'No disponible', // <--- Se llenará si el login es correcto
        rol: user.rol,
        telefono: user.telefono || '',
        bio: user.bio || '',
        avatar: user.foto_url
          ? `http://localhost:5000/uploads/${user.foto_url}`
          : `https://ui-avatars.com/api/?name=${user.nombre}&background=10e3a4&color=1a103c&font-size=0.5`,
        publicacionesMercado: 0,
        publicacionesRaites: 0
      };

      // Llamada a la API de estadísticas
      this.authService.obtenerEstadisticasUsuario(user.id).subscribe({
        next: (res) => {
          if (res.exito) {
            this.usuario.publicacionesMercado = res.ventas;
            this.usuario.publicacionesRaites = res.raites;
          }
        },
        error: (err) => console.error('Error cargando stats', err)
      });
    }
  }

  guardarCambios() {
    this.guardando = true;
    const datosEnviar = {
      telefono: this.usuario.telefono,
      bio: this.usuario.bio
    };

    this.authService.actualizarPerfil(this.usuario.id, datosEnviar).subscribe({
      next: (res) => {
        this.guardando = false;
        if (res.exito) alert('¡Perfil actualizado!');
        else alert('Error: ' + res.mensaje);
      },
      error: () => {
        this.guardando = false;
        alert('Error de conexión.');
      }
    });
  }
}
