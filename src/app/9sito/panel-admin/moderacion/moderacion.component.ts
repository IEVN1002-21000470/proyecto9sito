
import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // Importar
import { CommonModule } from '@angular/common';
import { AdminService, ItemPendiente } from '../../../services/admin.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-moderacion',
  standalone: true,
  imports: [CommonModule, RouterLink], 
  templateUrl: './moderacion.html',
  styleUrls: ['./moderacion.css']
})
export class ModeracionComponent implements OnInit {

  listaPendientes: ItemPendiente[] = [];
  cargando: boolean = true;
  procesandoId: number | null = null;
  
  // ESTADO DEL FILTRO (Por defecto 'Todos')
  filtroActual: string = 'Todos';

  constructor(
    private adminService: AdminService,
    private cd: ChangeDetectorRef // Inyectar
  ) {}

  ngOnInit() {
    this.cargarPendientes();
  }

cargarPendientes() {
  this.cargando = true;
  this.adminService.getPendientes().subscribe({
    next: (data) => {
      this.listaPendientes = data;
      this.cargando = false;
      this.cd.detectChanges(); // <--- AGREGA ESTO AQUÍ TAMBIÉN
    },
    error: (err) => {
      console.error(err);
      this.cargando = false;
      this.cd.detectChanges(); // <--- Y AQUÍ POR SI FALLA
    }
  });
}

  // --- LÓGICA DE FILTRADO ---
  cambiarFiltro(filtro: string) {
    this.filtroActual = filtro;
  }

  // Getter mágico: Filtra la lista original según el botón seleccionado
  get itemsMostrados() {
    if (this.filtroActual === 'Todos') {
      return this.listaPendientes;
    }
    return this.listaPendientes.filter(item => item.tipo === this.filtroActual);
  }

  // --- ACCIONES ---
  ejecutarAccion(item: ItemPendiente, accion: 'aprobar' | 'rechazar') {
    if (!confirm(`¿Confirmar ${accion}?`)) return;

    this.procesandoId = item.id;
    
    this.adminService.moderarItem(item.tipo, item.id, accion).subscribe({
      next: (res) => {
        if (res.exito) {
          // Eliminamos de la lista
          this.listaPendientes = this.listaPendientes.filter(i => !(i.id === item.id && i.tipo === item.tipo));
          
          // FORZAMOS LA VISTA
          this.cd.detectChanges(); 
        } else {
          alert('Error: ' + res.mensaje);
        }
        this.procesandoId = null;
        this.cd.detectChanges(); // Forzamos al terminar
      },
      error: () => {
        alert('Error de conexión.');
        this.procesandoId = null;
        this.cd.detectChanges(); // Forzamos al error
      }
    });
  }
}