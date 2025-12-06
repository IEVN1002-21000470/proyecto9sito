import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AvisosService, Aviso } from '../../../services/avisos.service';
import { InfoAcademicaService } from '../../../services/info-academica.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {

  avisosRecientes: Aviso[] = [];
  cursosRecientes: any[] = [];

  constructor(
    private avisosService: AvisosService,
    private infoService: InfoAcademicaService
  ) {}

  ngOnInit() {
    // 1. Cargar Avisos (Últimos 3)
    this.avisosService.getAvisos().subscribe({
      next: (data) => {
        // Asumiendo que vienen ordenados por fecha desde el backend
        this.avisosRecientes = data.slice(0, 3);
      },
      error: (err) => console.error(err)
    });

    // 2. Cargar Cursos (Últimos 3)
    this.infoService.getCursos().subscribe({
      next: (data) => {
        this.cursosRecientes = data.slice(0, 3);
      },
      error: (err) => console.error(err)
    });
  }
}
