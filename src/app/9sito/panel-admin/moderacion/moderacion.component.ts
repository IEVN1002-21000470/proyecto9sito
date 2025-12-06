import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, ItemPendiente } from '../../../services/admin.service';

@Component({
  selector: 'app-moderacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './moderacion.html',
  styleUrls: ['./moderacion.css']
})
export class ModeracionComponent implements OnInit {

  pendientes: ItemPendiente[] = [];
  cargando: boolean = true;
  procesandoId: number | null = null;

  constructor(
    private adminService: AdminService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarPendientes();
  }

  cargarPendientes() {
    this.cargando = true;
    this.adminService.getPendientes().subscribe({
      next: (data) => {
        this.pendientes = data;
        this.cargando = false;
        this.cd.detectChanges(); // Forzar actualización de vista
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
        this.cd.detectChanges();
      }
    });
  }

  procesar(item: ItemPendiente, accion: 'aprobar' | 'rechazar') {
    this.procesandoId = item.id;

    this.adminService.moderarItem(item.tipo, item.id, accion).subscribe({
      next: (res: any) => {
        this.procesandoId = null;
        if (res.exito) {
          // Quitamos el elemento de la lista localmente para que desaparezca al instante
          this.pendientes = this.pendientes.filter(p => !(p.id === item.id && p.tipo === item.tipo));
        } else {
          alert('Error: ' + res.mensaje);
        }
        this.cd.detectChanges();
      },
      error: () => {
        this.procesandoId = null;
        alert('Error de conexión al moderar.');
        this.cd.detectChanges();
      }
    });
  }
}
