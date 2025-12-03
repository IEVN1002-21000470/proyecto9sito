import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { AdminService, UsuarioSistema } from '../../../services/admin.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css']
})
export class UsuariosComponent implements OnInit {

  listaUsuarios: UsuarioSistema[] = [];
  cargando: boolean = false;
  mostrarModal: boolean = false;
  textoBusqueda: string = '';

  nuevoUsuario: any = { nombre: '', correo: '', password: '', rol: 'Estudiante' };

  constructor(
    private adminService: AdminService, 
    private cd: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.cargando = true;
    this.adminService.getUsuarios().subscribe({
      next: (data) => {
        this.listaUsuarios = [...data];
        this.cargando = false;
        this.cd.detectChanges(); // Forzar actualización visual
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
        this.cd.detectChanges();
      }
    });
  }

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

  // --- SOLUCIÓN AL "DOBLE CLIC" (ESTA ES LA ÚNICA VERSIÓN QUE DEBE QUEDAR) ---
  alternarEstado(user: UsuarioSistema) {
    if (!user.id) return; // Validación extra

    const estadoAnterior = user.estado;
    const nuevoEstado = estadoAnterior === 'Activo' ? 'Inactivo' : 'Activo';
    
    // 1. Actualizamos visualmente YA (Optimistic UI)
    user.estado = nuevoEstado;
    this.cd.detectChanges(); 

    // 2. Llamamos al backend
    this.adminService.cambiarEstado(user.id).subscribe({
      next: (res) => {
        if (!res.exito) {
          // Si falló, revertimos
          user.estado = estadoAnterior;
          alert('No se pudo cambiar el estado: ' + res.mensaje);
          this.cd.detectChanges();
        }
      },
      error: () => {
        // Error de red, revertimos
        user.estado = estadoAnterior;
        alert('Error de conexión');
        this.cd.detectChanges();
      }
    });
  }

  // --- NUEVAS ACCIONES ---

  guardarCambioRol(usuario: UsuarioSistema) {
    if (!usuario.id) return;
    if(!confirm(`¿Seguro que deseas cambiar el rol de ${usuario.nombre} a ${usuario.rol}?`)) return;

    this.adminService.actualizarRol(usuario.id, usuario.rol).subscribe({
      next: (res) => {
        if(res.exito) alert('Rol actualizado correctamente');
      },
      error: () => alert('Error al actualizar rol')
    });
  }

  resetearPassword(usuario: UsuarioSistema) {
    if (!usuario.id) return;
    const nuevaPass = prompt(`Ingresa la nueva contraseña para ${usuario.nombre}:`);
    
    if (nuevaPass) {
      this.adminService.resetearPassword(usuario.id, nuevaPass).subscribe({
        next: (res) => {
          if(res.exito) alert('Contraseña reseteada con éxito.');
        },
        error: () => alert('Error al resetear contraseña')
      });
    }
  }

  // --- MODAL ---
  abrirModal() { 
    this.mostrarModal = true; 
    this.nuevoUsuario = { nombre: '', correo: '', password: '', rol: 'Estudiante' };
  }
  
  cerrarModal() { this.mostrarModal = false; }

  guardarUsuario() {
    if (!this.nuevoUsuario.nombre || !this.nuevoUsuario.correo || !this.nuevoUsuario.password) {
      alert('Completa todos los campos'); return;
    }
    this.adminService.crearUsuario(this.nuevoUsuario).subscribe(res => {
      if(res.exito) {
        alert('Usuario creado');
        this.cerrarModal();
        this.cargarUsuarios();
      } else {
        alert(res.mensaje);
      }
    });
  }
}