import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLinkActive } from '@angular/router';

interface Estadistica {
  titulo: string;
  valor: string | number;
  icono: string;
  color: string;
}

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboardAdmin.html',
  styleUrls: ['./dashboardAdmin.css']
})
export class DashboardAdminComponent {
  stats: Estadistica[] = [
    { titulo: 'Usuarios Totales', valor: 1250, icono: 'users', color: 'text-white' },
    { titulo: 'Pendientes de Aprobar', valor: 15, icono: 'alert', color: 'text-yellow-400' },
    { titulo: 'Avisos Activos', valor: 8, icono: 'megaphone', color: 'text-accent-cyan' },
    { titulo: 'Reportes Abiertos', valor: 3, icono: 'bug', color: 'text-red-400' }
  ];

  pendientes = [1, 2, 3]; // Simulación para mostrar el badge
}
