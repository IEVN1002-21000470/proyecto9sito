import { Component, OnInit } from '@angular/core'; // Importar OnInit
import { CommonModule } from '@angular/common';
import { AvisosService, Aviso } from '../../../services/avisos.service'; // Importar servicio

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

  constructor(private avisosService: AvisosService) {}

  ngOnInit() {
    this.cargarAvisos();
  }

  cargarAvisos() {
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
}