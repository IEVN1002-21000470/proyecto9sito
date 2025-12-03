import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface UsuarioPerfil {
  nombre: string;
  correo: string;
  rol: string;
  telefono?: string;
  bio?: string;
  avatar: string;
  publicacionesMercado: number;
  publicacionesRaites: number;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class PerfilDocentesComponent {

  // Datos simulados del usuario logueado
  usuario: UsuarioPerfil = {
    nombre: 'Usuario Demo',
    correo: 'al123456@utleon.edu.mx',
    rol: 'Docente',
    telefono: '', // Vacío para probar placeholder
    avatar: 'https://ui-avatars.com/api/?name=Usuario+Demo&background=5D10E3&color=1a103c&font-size=0.5',
    publicacionesMercado: 2, // Simula que tiene 2 ventas activas
    publicacionesRaites: 0   // Simula que no tiene raites
  };

  // Método placeholder para guardar
  guardarCambios() {
    // Aquí iría la lógica para enviar el formulario a Flask
    console.log('Guardando perfil...');
  }
}
