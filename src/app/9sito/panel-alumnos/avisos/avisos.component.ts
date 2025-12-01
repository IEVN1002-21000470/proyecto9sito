import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Aviso {
  id: number;
  titulo: string;
  contenido: string;
  fecha: string;
  categoria: string;
}

@Component({
  selector: 'app-avisos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avisos.html',
  styleUrls: ['./avisos.css']
})
export class AvisosComponent {
  avisosData: Aviso[] = [
    {
      id: 1,
      titulo: 'Suspensión de Actividades',
      contenido: 'Debido a mantenimiento eléctrico en el edificio C, las clases se suspenden a partir de las 2:00 PM.',
      fecha: 'Hace 2 horas',
      categoria: 'Administrativo'
    },
    {
      id: 2,
      titulo: 'Conferencia de IA',
      contenido: 'Invitación abierta al auditorio principal para la charla sobre GPT-4 y el futuro del trabajo.',
      fecha: 'Ayer',
      categoria: 'Académico'
    },
    {
      id: 3,
      titulo: 'Torneo de Fútbol Rápido',
      contenido: 'Inscribe a tu equipo antes del viernes. Habrá premios para los tres primeros lugares.',
      fecha: 'Hace 3 días',
      categoria: 'Deportivo'
    }
  ];
}
