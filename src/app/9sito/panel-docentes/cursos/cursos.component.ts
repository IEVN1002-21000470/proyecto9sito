import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Curso {
  id: number;
  titulo: string;
  fecha: string;
  modalidad: string;
}

@Component({
  selector: 'app-cursos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cursos.html',
  styleUrls: ['./cursos.css']
})
export class CursosDocentesComponent {
  cursosData: Curso[] = [
    { id: 1, titulo: 'Inglés IV Conversacional', fecha: '10 Nov', modalidad: 'Presencial' },
    { id: 2, titulo: 'Liderazgo Efectivo', fecha: '12 Nov', modalidad: 'Virtual' },
    { id: 3, titulo: 'Introducción a Python', fecha: '15 Nov', modalidad: 'Híbrido' }
  ];
}
