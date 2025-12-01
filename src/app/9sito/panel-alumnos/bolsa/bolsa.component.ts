import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Vacante {
  id: number;
  puesto: string;
  empresa: string;
  tipo: string;
  ubicacion: string;
}

@Component({
  selector: 'app-bolsa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bolsa.html',
  styleUrls: ['./bolsa.css']
})
export class BolsaComponent {
  vacantesData: Vacante[] = [
    { id: 1, puesto: 'Desarrollador Web Jr', empresa: 'TechSolutions', tipo: 'Estadía', ubicacion: 'León, Gto.' },
    { id: 2, puesto: 'Soporte Técnico', empresa: 'Zapatería 3 Hermanos', tipo: 'Medio Tiempo', ubicacion: 'León, Gto.' },
    { id: 3, puesto: 'Diseñador UX/UI', empresa: 'Kondimento', tipo: 'Tiempo Completo', ubicacion: 'Remoto' },
    { id: 4, puesto: 'Practicante de Redes', empresa: 'Megacable', tipo: 'Estadía', ubicacion: 'León, Gto.' }
  ];
}
