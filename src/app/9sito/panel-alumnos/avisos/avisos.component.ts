import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvisosService, Aviso } from '../../../services/avisos.service';

@Component({
  selector: 'app-avisos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avisos.html',
  styleUrls: ['./avisos.css']
})
export class AvisosComponent implements OnInit {

  avisosData: Aviso[] = [];
  cargando: boolean = true;

  // Filtros
  filtroActual: string = 'Todos';

  // Modal
  mostrarModal: boolean = false;
  avisoSeleccionado: Aviso | null = null;

  constructor(private avisosService: AvisosService) {}

  ngOnInit() {
    this.cargarAvisos();
  }

  cargarAvisos() {
    this.cargando = true;
    this.avisosService.getAvisos().subscribe({
      next: (data) => {
        this.avisosData = data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar avisos', error);
        this.cargando = false;
      }
    });
  }

  // --- FILTROS ---
  cambiarFiltro(categoria: string) {
    this.filtroActual = categoria;
  }

  get avisosFiltrados() {
    if (this.filtroActual === 'Todos') {
      return this.avisosData;
    }
    return this.avisosData.filter(aviso => aviso.categoria === this.filtroActual);
  }

  // --- MODAL ---
  verDetalles(aviso: Aviso) {
    this.avisoSeleccionado = aviso;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.avisoSeleccionado = null;
  }
}
