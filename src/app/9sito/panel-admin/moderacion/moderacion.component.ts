import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface PublicacionPendiente {
  id: number;
  titulo: string;
  tipo: 'Bolsa' | 'Transporte' | 'Mercado'; // Módulo al que pertenece
  usuario: string; // Autor
  fecha: string;
  detalles?: string; // Descripción breve opcional
}

@Component({
  selector: 'app-moderacion',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './moderacion.html',
  styleUrls: ['./moderacion.css']
})
export class ModeracionComponent {

  // Datos simulados (Mock Data)
  pendientes: PublicacionPendiente[] = [
    {
      id: 1,
      titulo: 'Practicante de MKT Digital',
      tipo: 'Bolsa',
      usuario: 'Empresa XYZ',
      fecha: 'hace 45 min',
      detalles: 'Vacante de medio tiempo para redes sociales.'
    },
    {
      id: 2,
      titulo: 'Raite desde Lomas de Medina',
      tipo: 'Transporte',
      usuario: '@luis_reyes',
      fecha: 'hace 2 horas',
      detalles: 'Salida 6:40 AM.'
    },
    {
      id: 3,
      titulo: 'Venta de Calculadora Casio',
      tipo: 'Mercado',
      usuario: '@juan_perez',
      fecha: 'hace 3 horas',
      detalles: 'Modelo fx-991EX, semi-nueva.'
    }
  ];

  // Lógica de aprobación
  aprobarPublicacion(id: number) {
    // Aquí iría la llamada al backend para cambiar estado a 'Aprobado'
    this.pendientes = this.pendientes.filter(p => p.id !== id);
    // Opcional: Mostrar notificación toast
    console.log(`Publicación ${id} aprobada.`);
  }

  // Lógica de rechazo
  rechazarPublicacion(id: number) {
    // Aquí iría la llamada al backend para eliminar o rechazar
    if(confirm('¿Estás seguro de rechazar esta publicación?')) {
      this.pendientes = this.pendientes.filter(p => p.id !== id);
    }
  }
}
