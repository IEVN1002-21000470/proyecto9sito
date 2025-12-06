import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <--- Importante: Agregado para usar ngModel
import { InfoAcademicaService } from '../../../services/info-academica.service';

@Component({
  selector: 'app-directorio',
  standalone: true,
  imports: [CommonModule, FormsModule], // <--- Agregamos FormsModule a los imports
  templateUrl: './directorio.html',
  styleUrls: ['./directorio.css']
})
export class DirectorioComponent implements OnInit {
  directorioData: any[] = [];

  // Variables para los filtros
  textoBusqueda: string = '';
  categoriaSeleccionada: string = 'Todos los Departamentos';

  constructor(private infoService: InfoAcademicaService) {}

  ngOnInit() {
    this.infoService.getDirectorio().subscribe((data: any[]) => {
      this.directorioData = data;
    });
  }

  // Getter para filtrar la lista en tiempo real
  get directorioFiltrado() {
    return this.directorioData.filter(contacto => {
      // 1. Filtrar por texto (busca en nombre o puesto)
      const texto = this.textoBusqueda.toLowerCase();
      const coincideTexto =
        contacto.nombre.toLowerCase().includes(texto) ||
        (contacto.puesto && contacto.puesto.toLowerCase().includes(texto));

      // 2. Filtrar por categoría del Dropdown
      const coincideCategoria =
        this.categoriaSeleccionada === 'Todos los Departamentos' ||
        (contacto.puesto && contacto.puesto.includes(this.categoriaSeleccionada));

      return coincideTexto && coincideCategoria;
    });
  }
}
