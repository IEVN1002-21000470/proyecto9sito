import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-crear-aviso',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], // Importante: FormsModule para [(ngModel)]
  templateUrl: './avisos.html',
  styleUrls: ['./avisos.css']
})
export class CrearAvisoComponent {

  // Variables del formulario
  titulo: string = '';
  contenido: string = '';
  categoria: string = 'Académico'; // Valor por defecto
  imagen: File | null = null;

  constructor(private router: Router) {}

  // Manejar selección de archivo
  onFileSelected(event: any) {
    this.imagen = event.target.files[0];
  }

  // Método para enviar el formulario
  publicar() {
    // Aquí iría la lógica para enviar los datos a tu API Flask
    console.log('Publicando aviso:', {
      titulo: this.titulo,
      contenido: this.contenido,
      categoria: this.categoria,
      imagen: this.imagen
    });

    alert('Aviso publicado correctamente');

    // Redirigir al dashboard o lista de avisos después de publicar
    this.router.navigate(['/admin/dashboardAdmin']);
  }
}
