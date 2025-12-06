import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importante para [(ngModel)]
import { AdminService, UsuarioSistema } from '../../../services/admin.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css'] // Asegúrate de que este archivo exista, o bórralo si usas estilos globales
})
export class UsuariosComponent implements OnInit {

  // Datos
  listaUsuarios: UsuarioSistema[] = [];
  cargando: boolean = true;

  // Filtros
  textoBusqueda: string = '';

  // Modal y Formulario
  mostrarModal: boolean = false;
  nuevoUsuario = {
    nombre: '',
    correo: '',
    password: '',
    rol: 'Estudiante'
  };

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.cargando = true;
    this.adminService.getUsuarios().subscribe({
      next: (data) => {
        this.listaUsuarios = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
      }
    });
  }

  // Getter para filtrar la tabla en tiempo real
  get usuariosFiltrados() {
    if (!this.textoBusqueda) {
      return this.listaUsuarios;
    }
    const texto = this.textoBusqueda.toLowerCase();
    return this.listaUsuarios.filter(u =>
      u.nombre.toLowerCase().includes(texto) ||
      u.correo.toLowerCase().includes(texto)
    );
  }

  // Métodos del Modal
  abrirModal() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.nuevoUsuario = { nombre: '', correo: '', password: '', rol: 'Estudiante' };
  }

  // Acciones CRUD
  guardarUsuario() {
    if (!this.nuevoUsuario.nombre || !this.nuevoUsuario.correo || !this.nuevoUsuario.password) {
      alert('Por favor completa todos los campos.');
      return;
    }

    this.adminService.crearUsuario(this.nuevoUsuario).subscribe({
      next: (res) => {
        if (res.exito) {
          alert('Usuario creado exitosamente.');
          this.cerrarModal();
          this.cargarUsuarios();
        } else {
          alert('Error: ' + res.mensaje);
        }
      },
      error: () => alert('Error de conexión con el servidor.')
    });
  }

  guardarCambioRol(user: UsuarioSistema) {
    if (!confirm(`¿Estás seguro de cambiar el rol de ${user.nombre} a ${user.rol}?`)) return;

    this.adminService.actualizarRol(user.id, user.rol).subscribe({
      next: (res) => {
        if(res.exito) alert('Rol actualizado correctamente.');
        else alert('Error al actualizar rol.');
      }
    });
  }

  resetearPassword(user: UsuarioSistema) {
    const nueva = prompt('Ingresa la nueva contraseña para ' + user.nombre + ':');
    if (!nueva) return;

    this.adminService.resetearPassword(user.id, nueva).subscribe({
      next: (res) => {
        if(res.exito) alert('Contraseña cambiada correctamente.');
        else alert('Error al cambiar contraseña.');
      }
    });
  }

  alternarEstado(user: UsuarioSistema) {
    const accion = user.estado === 'Activo' ? 'Bloquear' : 'Activar';
    if (!confirm(`¿Deseas ${accion} a ${user.nombre}?`)) return;

    this.adminService.cambiarEstado(user.id).subscribe({
      next: (res) => {
        if (res.exito) {
           // Actualizamos la vista localmente para reflejar el cambio inmediato
           user.estado = user.estado === 'Activo' ? 'Bloqueado' : 'Activo';
        } else {
           alert('Error: ' + res.mensaje);
        }
      }
    });
  }
}
