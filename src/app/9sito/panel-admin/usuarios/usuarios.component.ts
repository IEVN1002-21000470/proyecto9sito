import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: 'Estudiante' | 'Docente' | 'Admin';
  estado: 'Activo' | 'Inactivo';
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.css']
})
export class UsuariosComponent {
  usuarios: Usuario[] = [
    { id: 1, nombre: 'Juan Pérez', correo: 'juan@utleon.edu.mx', rol: 'Estudiante', estado: 'Activo' },
    { id: 2, nombre: 'Dra. Ana López', correo: 'ana@utleon.edu.mx', rol: 'Docente', estado: 'Activo' },
    { id: 3, nombre: 'Admin General', correo: 'admin@9sito.com', rol: 'Admin', estado: 'Activo' },
    { id: 4, nombre: 'Carlos Malo', correo: 'carlos@utleon.edu.mx', rol: 'Estudiante', estado: 'Inactivo' }
  ];

  alternarEstadoUsuario(user: Usuario) {
    user.estado = user.estado === 'Activo' ? 'Inactivo' : 'Activo';
  }
}
