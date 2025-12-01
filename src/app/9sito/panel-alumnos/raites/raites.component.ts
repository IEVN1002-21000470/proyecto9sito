import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Raite {
  id: number;
  conductor: string;
  ruta: string;
  hora: string;
  cupo: number;
}

@Component({
  selector: 'app-raites',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './raites.html',
  styleUrls: ['./raites.css']
})
export class RaitesComponent {
  raitesData: Raite[] = [
    { id: 1, conductor: 'Juan Pérez', ruta: 'Centro -> UTL', hora: '07:30 AM', cupo: 2 },
    { id: 2, conductor: 'Ana López', ruta: 'Plaza Mayor -> UTL', hora: '07:45 AM', cupo: 1 },
    { id: 3, conductor: 'Carlos Ruiz', ruta: 'Altacia -> UTL', hora: '08:00 AM', cupo: 3 }
  ];
  currentTab: 'ofrezco' | 'busco' = 'ofrezco';

}
