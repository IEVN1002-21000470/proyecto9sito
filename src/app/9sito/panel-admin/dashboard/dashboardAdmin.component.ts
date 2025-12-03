import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // Importar ChangeDetectorRef
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
    private cd: ChangeDetectorRef // Inyectar
  ) {}

  ngOnInit() {
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    this.adminService.getDashboardStats().subscribe({
      next: (data) => {
        // Actualizamos valores
        this.stats[0].valor = data.usuarios;
        this.stats[1].valor = data.pendientes;
        this.stats[2].valor = data.avisos;
        this.stats[3].valor = data.reportes;
        
        this.totalPendientes = data.pendientes;

        // Forzamos actualización del arreglo para que el HTML se repinte
        this.stats = [...this.stats];
        
        // ¡LA SOLUCIÓN MAGICA!
        this.cd.detectChanges(); 
      },
      error: (err) => {
        console.error('Error al cargar stats:', err);
      }
    });
  }
}