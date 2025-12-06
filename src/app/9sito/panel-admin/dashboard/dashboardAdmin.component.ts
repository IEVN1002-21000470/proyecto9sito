import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';

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
export class DashboardAdminComponent implements OnInit {

  stats: Estadistica[] = [
    { titulo: 'Usuarios Activos', valor: 0, icono: 'users', color: 'text-white' },
    { titulo: 'Pendientes de Aprobar', valor: 0, icono: 'alert', color: 'text-yellow-400' },
    { titulo: 'Avisos Publicados', valor: 0, icono: 'megaphone', color: 'text-accent-cyan' },
    { titulo: 'Reportes Abiertos', valor: 0, icono: 'bug', color: 'text-red-400' }
  ];

  totalPendientes: number = 0;

  constructor(
    private adminService: AdminService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    this.adminService.getDashboardStats().subscribe({
      next: (data: any) => {
        this.stats[0].valor = data.usuarios;
        this.stats[1].valor = data.pendientes;
        this.stats[2].valor = data.avisos;
        this.stats[3].valor = data.reportes; // Aquí se actualiza el contador de reportes

        this.totalPendientes = data.pendientes;
        this.stats = [...this.stats];
        this.cd.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al cargar stats:', err);
      }
    });
  }
}
