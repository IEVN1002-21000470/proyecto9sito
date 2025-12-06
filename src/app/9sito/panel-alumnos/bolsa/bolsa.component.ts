import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoAcademicaService } from '../../../services/info-academica.service';

@Component({
  selector: 'app-bolsa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bolsa.html',
  styleUrls: ['./bolsa.css']
})
export class BolsaComponent implements OnInit {

  vacantesData: any[] = [];
  cargando: boolean = true;

  // --- FILTRO ---
  filtroActual: string = 'Todos';

  // --- MODAL ---
  mostrarModal: boolean = false;
  vacanteSeleccionada: any = null;

  constructor(private infoService: InfoAcademicaService) {}

  ngOnInit() {
    this.cargando = true;
    this.infoService.getVacantes().subscribe({
      next: (data: any[]) => {
        this.vacantesData = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
      }
    });
  }

  // --- MÉTODOS DE FILTRO ---
  cambiarFiltro(filtro: string) {
    this.filtroActual = filtro;
  }

  get vacantesFiltradas() {
    if (this.filtroActual === 'Todos') {
      return this.vacantesData;
    }
    // Filtramos comparando exactamente el texto de la BD (ej: 'Estadía', 'Tiempo Completo')
    return this.vacantesData.filter(v => v.tipo === this.filtroActual);
  }

  // --- MÉTODOS DEL MODAL ---
  verDetalles(vacante: any) {
    this.vacanteSeleccionada = vacante;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.vacanteSeleccionada = null;
  }

  aplicar() {
    alert('Para aplicar, envía tu CV al correo de la empresa o acude a Servicios Escolares.');
  }
}
