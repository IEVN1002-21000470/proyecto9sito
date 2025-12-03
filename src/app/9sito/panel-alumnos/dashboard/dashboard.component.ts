import { Component, OnInit } from '@angular/core'; // Importar OnInit
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AvisosService, Aviso } from '../../../services/avisos.service'; // Importar servicio

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  
  avisosRecientes: Aviso[] = [];

  constructor(private avisosService: AvisosService) {}

  ngOnInit() {
    // Reutilizamos el servicio para traer todo, pero en el HTML solo mostramos los primeros 2
    this.avisosService.getAvisos().subscribe(data => {
      // Tomamos solo los 3 más recientes
      this.avisosRecientes = data.slice(0, 3);
    });
  }
}