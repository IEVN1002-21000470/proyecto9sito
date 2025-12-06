import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoAcademicaService } from '../../../services/info-academica.service';

@Component({
  selector: 'app-cursos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cursos.html',
  styleUrls: ['./cursos.css']
})
export class CursosComponent implements OnInit {
  cursosData: any[] = [];
  cargando: boolean = true;

  // --- VARIABLES DEL MODAL ---
  mostrarModal: boolean = false;
  cursoSeleccionado: any = null;

  constructor(private infoService: InfoAcademicaService) {}

  ngOnInit() {
    this.cargando = true;
    this.infoService.getCursos().subscribe({
      next: (data: any[]) => {
        this.cursosData = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
      }
    });
  }

  // --- MÉTODOS DEL MODAL ---
  verInformacion(curso: any) {
    this.cursoSeleccionado = curso;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.cursoSeleccionado = null;
  }

  inscribirse() {
    // Aquí podrías conectar con un endpoint real de inscripción
    alert('Solicitud de inscripción enviada. Revisa tu correo institucional para más detalles.');
    this.cerrarModal();
  }
}
