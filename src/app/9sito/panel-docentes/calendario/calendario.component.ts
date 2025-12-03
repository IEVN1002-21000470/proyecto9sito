import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// Interfaz para definir la estructura de un día en el calendario
interface Evento {
  titulo: string;
  tipo: 'normal' | 'suspension' | 'inicio'; // Para controlar el color
}

interface DiaCalendario {
  numero: number;
  esMesActual: boolean;
  eventos: Evento[];
}

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendario.html',
  styleUrls: ['./calendario.css']
})
export class CalendarioDocentesComponent {

  // Datos simulados que replican tu vista de Noviembre 2025
  diasCalendario: DiaCalendario[] = [
    // Días finales de Octubre (Grises)
    { numero: 26, esMesActual: false, eventos: [] },
    { numero: 27, esMesActual: false, eventos: [] },
    { numero: 28, esMesActual: false, eventos: [] },
    { numero: 29, esMesActual: false, eventos: [] },
    { numero: 30, esMesActual: false, eventos: [] },
    { numero: 31, esMesActual: false, eventos: [] },

    // Días de Noviembre
    { numero: 1, esMesActual: true, eventos: [] },
    { numero: 2, esMesActual: true, eventos: [] },
    {
      numero: 3,
      esMesActual: true,
      eventos: [{ titulo: 'Inicio Clases', tipo: 'inicio' }]
    },
    { numero: 4, esMesActual: true, eventos: [] },
    {
      numero: 5,
      esMesActual: true,
      eventos: [{ titulo: 'Suspensión', tipo: 'suspension' }]
    },
    { numero: 6, esMesActual: true, eventos: [] },
    { numero: 7, esMesActual: true, eventos: [] },
    { numero: 8, esMesActual: true, eventos: [] },
    { numero: 9, esMesActual: true, eventos: [] },
    { numero: 10, esMesActual: true, eventos: [{ titulo: 'Examen Parcial', tipo: 'normal' }] },
    // ... Relleno hasta fin de mes para mantener la cuadrícula
    ...Array.from({ length: 20 }, (_, i) => ({
      numero: i + 11,
      esMesActual: true,
      eventos: []
    }))
  ];
}
