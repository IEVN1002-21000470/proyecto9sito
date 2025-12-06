import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InfoAcademicaService } from '../../../services/info-academica.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion.html',
  styleUrls: ['./configuracion.css']
})
export class ConfiguracionComponent {

  descripcionReporte: string = '';
  enviando: boolean = false;

  constructor(
    private infoService: InfoAcademicaService,
    private authService: AuthService
  ) {}

  enviarReporte() {
    if (!this.descripcionReporte.trim()) {
      alert('Por favor describe el problema antes de enviar.');
      return;
    }

    this.enviando = true;

    // Preparamos los datos
    const usuario = this.authService.usuarioActual;
    const datosEnviar = {
      usuario_id: usuario ? usuario.id : null,
      asunto: 'Reporte General',
      categoria: 'General',
      descripcion: this.descripcionReporte
    };

    this.infoService.crearReporte(datosEnviar).subscribe({
      next: (res: any) => {
        this.enviando = false;
        if (res.exito) {
          alert('¡Reporte enviado correctamente!');
          this.descripcionReporte = '';
        } else {
          alert('Error al enviar: ' + (res.mensaje || 'Intente más tarde'));
        }
      },
      error: () => {
        this.enviando = false;
        alert('Error de conexión con el servidor.');
      }
    });
  }
}
