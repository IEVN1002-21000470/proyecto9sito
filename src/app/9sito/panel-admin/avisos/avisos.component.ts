import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvisosService, Aviso } from '../../../services/avisos.service';

@Component({
  selector: 'app-crear-aviso', // Puedes dejar el selector o cambiarlo
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './avisos.html',
  styleUrls: ['./avisos.css']
})
export class CrearAvisoComponent implements OnInit {

  // Formulario
  titulo: string = '';
  contenido: string = '';
  categoria: string = 'Académico';
  imagenSeleccionada: File | null = null;
  
  // Estado
  enviando: boolean = false;
  cargandoLista: boolean = true;
  modoEdicion: boolean = false;
  idAvisoEditar: number | null = null;

  // Datos
  listaAvisos: Aviso[] = [];

  constructor(private avisosService: AvisosService) {}

  ngOnInit() {
    this.cargarAvisos();
  }

  cargarAvisos() {
    this.cargandoLista = true;
    this.avisosService.getAvisos().subscribe({
      next: (data) => {
        this.listaAvisos = data;
        this.cargandoLista = false;
      },
      error: (err) => {
        console.error(err);
        this.cargandoLista = false;
      }
    });
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.imagenSeleccionada = event.target.files[0];
    }
  }

  // Cargar datos en el formulario para editar
  cargarDatosEdicion(aviso: Aviso) {
    this.modoEdicion = true;
    this.idAvisoEditar = aviso.id || null;
    
    this.titulo = aviso.titulo;
    this.contenido = aviso.contenido;
    this.categoria = aviso.categoria;
    this.imagenSeleccionada = null; // Reiniciamos imagen (si no sube otra, se mantiene la actual en BD)
    
    // Scroll suave hacia el formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicion() {
    this.modoEdicion = false;
    this.idAvisoEditar = null;
    this.limpiarFormulario();
  }

  limpiarFormulario() {
    this.titulo = '';
    this.contenido = '';
    this.categoria = 'Académico';
    this.imagenSeleccionada = null;
    // Resetear input file manualmente si es necesario mediante ViewChild, 
    // pero por ahora Angular lo maneja al recargar.
  }

  guardar() {
    this.enviando = true;
    const datosAviso: Aviso = {
      titulo: this.titulo,
      contenido: this.contenido,
      categoria: this.categoria
    };

    if (this.modoEdicion && this.idAvisoEditar) {
      // --- MODO ACTUALIZAR ---
      this.avisosService.actualizarAviso(this.idAvisoEditar, datosAviso, this.imagenSeleccionada).subscribe({
        next: (res) => {
          this.enviando = false;
          if(res.exito) {
            alert('Aviso actualizado correctamente');
            this.cancelarEdicion(); // Regresa al modo crear
            this.cargarAvisos();    // Refresca la tabla
          } else {
            alert('Error: ' + res.mensaje);
          }
        },
        error: () => { this.enviando = false; alert('Error de conexión'); }
      });

    } else {
      // --- MODO CREAR ---
      this.avisosService.crearAviso(datosAviso, this.imagenSeleccionada).subscribe({
        next: (res) => {
          this.enviando = false;
          if(res.exito) {
            alert('Aviso publicado con éxito');
            this.limpiarFormulario();
            this.cargarAvisos(); // Refresca la tabla para ver el nuevo
          } else {
            alert('Error: ' + res.mensaje);
          }
        },
        error: () => { this.enviando = false; alert('Error de conexión'); }
      });
    }
  }

  eliminar(id: number) {
    if(!confirm('¿Estás seguro de eliminar este aviso? Esta acción no se puede deshacer.')) return;

    this.avisosService.eliminarAviso(id).subscribe({
      next: (res) => {
        if(res.exito) {
          this.cargarAvisos(); // Refresca la lista
        } else {
          alert('Error: ' + res.mensaje);
        }
      }
    });
  }
}