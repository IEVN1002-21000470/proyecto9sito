import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AvisosService, Aviso } from '../../../services/avisos.service';
import { AdminService } from '../../../services/admin.service';
import { InfoAcademicaService } from '../../../services/info-academica.service';

@Component({
  selector: 'app-crear-aviso',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './avisos.html',
  styleUrls: ['./avisos.css']
})
export class CrearAvisoComponent implements OnInit {

  // Generales
  titulo: string = ''; contenido: string = ''; categoria: string = 'Académico'; imagenSeleccionada: File | null = null;

  // Bolsa
  empresa: string = ''; ubicacion: string = 'León, Gto.'; tipoVacante: string = 'Tiempo Completo'; requisitos: string = '';

  // Cursos
  fechaCurso: string = ''; modalidadCurso: string = 'Presencial';

  // Directorio
  puestoContacto: string = ''; // Materia
  correoContacto: string = '';
  oficinaContacto: string = ''; // Teléfono

  enviando: boolean = false; cargandoLista: boolean = true;
  modoEdicion: boolean = false; idItemEditar: number | null = null;
  tipoItemEditar: string = 'aviso';
  listaUnificada: any[] = [];

  constructor(
    private avisosService: AvisosService,
    private adminService: AdminService,
    private infoService: InfoAcademicaService,
    private cd: ChangeDetectorRef // <-- INYECCIÓN PARA CORREGIR REFRESCO
  ) {}

  ngOnInit() { this.cargarDatosUnificados(); }

  cargarDatosUnificados() {
    this.cargandoLista = true;
    forkJoin({
      avisos: this.avisosService.getAvisos(),
      vacantes: this.infoService.getVacantes(),
      cursos: this.infoService.getCursos(),
      directorio: this.infoService.getDirectorio()
    }).subscribe({
      next: (res) => {
        const avisos = res.avisos.map(a => ({ ...a, tipoOrigen: 'aviso', displayTitulo: a.titulo, displayContenido: a.contenido, displayCategoria: a.categoria }));

        // CORRECCIÓN: Agregamos originalData a vacantes y cursos para que el editado funcione a la primera
        const vacantes = res.vacantes.map((v: any) => ({
            id: v.id,
            tipoOrigen: 'vacante',
            displayTitulo: `${v.puesto} en ${v.empresa}`,
            displayContenido: v.descripcion,
            displayCategoria: 'Bolsa',
            originalData: v
        }));

        const cursos = res.cursos.map((c: any) => ({
            id: c.id,
            tipoOrigen: 'curso',
            displayTitulo: c.titulo,
            displayContenido: `Inicia: ${c.fecha}`,
            displayCategoria: 'Curso',
            originalData: c
        }));

        const contactos = res.directorio.map((d: any) => ({
            id: d.id,
            tipoOrigen: 'contacto',
            displayTitulo: d.nombre,
            displayContenido: `${d.puesto} - ${d.correo}`,
            displayCategoria: 'Directorio',
            originalData: d
        }));

        this.listaUnificada = [...avisos, ...vacantes, ...cursos, ...contactos];
        this.cargandoLista = false;
        this.cd.detectChanges(); // <-- FUERZA ACTUALIZACIÓN VISUAL
      },
      error: () => {
        this.cargandoLista = false;
        this.cd.detectChanges();
      }
    });
  }

  onFileSelected(event: any) { if (event.target.files.length > 0) this.imagenSeleccionada = event.target.files[0]; }

  // --- EDICIÓN ---
  cargarItemParaEditar(item: any) {
    this.modoEdicion = true;
    this.idItemEditar = item.id;
    this.tipoItemEditar = item.tipoOrigen;

    this.limpiarVariables(); // Limpia antes de llenar para evitar mezcla de datos

    if (item.tipoOrigen === 'vacante') {
      const v = item.originalData;
      this.categoria = 'Bolsa de Trabajo';
      this.titulo = v.puesto; this.empresa = v.empresa;
      this.tipoVacante = v.tipo || v.tipo_contrato;
      this.ubicacion = v.ubicacion;
      this.contenido = v.descripcion; this.requisitos = v.requisitos;
    } else if (item.tipoOrigen === 'curso') {
      const c = item.originalData;
      this.categoria = 'Cursos';
      this.titulo = c.titulo;
      this.fechaCurso = c.fecha || c.fecha_inicio;
      this.modalidadCurso = c.modalidad;
      this.contenido = c.descripcion;
    } else if (item.tipoOrigen === 'contacto') {
      const d = item.originalData;
      this.categoria = 'Directorio';
      this.titulo = d.nombre;
      this.puestoContacto = d.puesto || d.rol_area;
      this.correoContacto = d.correo || d.correo_contacto;
      this.oficinaContacto = d.oficina || d.telefono_ext;
      this.contenido = 'Contacto';
    } else {
      this.categoria = item.categoria; this.titulo = item.titulo; this.contenido = item.contenido;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.cd.detectChanges(); // <-- ACTUALIZA INPUTS AL INSTANTE (Evita doble clic)
  }

  cancelarEdicion() {
    this.modoEdicion = false;
    this.idItemEditar = null;
    this.limpiarFormulario();
    this.cd.detectChanges();
  }

  limpiarVariables() {
    this.titulo = ''; this.contenido = ''; this.imagenSeleccionada = null;
    this.empresa = ''; this.ubicacion = 'León, Gto.'; this.tipoVacante = 'Tiempo Completo'; this.requisitos = '';
    this.fechaCurso = ''; this.modalidadCurso = 'Presencial';
    this.puestoContacto = ''; this.correoContacto = ''; this.oficinaContacto = '';
  }

  limpiarFormulario() {
    this.limpiarVariables();
    this.categoria = 'Académico';
  }

  guardar() {
    this.enviando = true;

    const handleResponse = (obs: any) => {
        obs.subscribe({
            next: (res: any) => this.procesarRespuesta(res),
            error: () => this.procesarError()
        });
    };

    if (this.categoria === 'Directorio') {
      const datos = { nombre: this.titulo, puesto: this.puestoContacto, correo: this.correoContacto, oficina: this.oficinaContacto };
      if (this.modoEdicion && this.tipoItemEditar === 'contacto') {
          this.adminService.eliminarContacto(this.idItemEditar!).subscribe(() => {
             handleResponse(this.adminService.crearContacto(datos));
          });
      } else {
          handleResponse(this.adminService.crearContacto(datos));
      }
    }
    else if (this.categoria === 'Cursos') {
      const datos = { titulo: this.titulo, fecha: this.fechaCurso, modalidad: this.modalidadCurso, descripcion: this.contenido };
      if (this.modoEdicion && this.tipoItemEditar === 'curso') {
        this.adminService.eliminarCurso(this.idItemEditar!).subscribe(() => {
            handleResponse(this.adminService.crearCurso(datos));
        });
      } else {
        handleResponse(this.adminService.crearCurso(datos));
      }
    }
    else if (this.categoria === 'Bolsa de Trabajo') {
      const datos = { puesto: this.titulo, empresa: this.empresa, tipo: this.tipoVacante, ubicacion: this.ubicacion, descripcion: this.contenido, requisitos: this.requisitos };
      if (this.modoEdicion && this.tipoItemEditar === 'vacante') {
         this.adminService.eliminarVacante(this.idItemEditar!).subscribe(() => {
            handleResponse(this.adminService.crearVacante(datos));
         });
      } else {
        handleResponse(this.adminService.crearVacante(datos));
      }
    }
    else {
      const aviso: Aviso = { titulo: this.titulo, contenido: this.contenido, categoria: this.categoria };
      if (this.modoEdicion && this.tipoItemEditar === 'aviso') {
        handleResponse(this.avisosService.actualizarAviso(this.idItemEditar!, aviso, this.imagenSeleccionada));
      } else {
        handleResponse(this.avisosService.crearAviso(aviso, this.imagenSeleccionada));
      }
    }
  }

  eliminar(item: any) {
    if(!confirm('¿Eliminar?')) return;
    const procesar = (obs: any) => obs.subscribe((res: any) => this.procesarEliminacion(res));

    if (item.tipoOrigen === 'vacante') procesar(this.adminService.eliminarVacante(item.id));
    else if (item.tipoOrigen === 'curso') procesar(this.adminService.eliminarCurso(item.id));
    else if (item.tipoOrigen === 'contacto') procesar(this.adminService.eliminarContacto(item.id));
    else procesar(this.avisosService.eliminarAviso(item.id));
  }

  procesarRespuesta(res: any) {
    this.enviando = false;
    if (res.exito) {
        alert('Operación exitosa');
        this.modoEdicion = false; // Asegurar salida de modo edición
        this.limpiarFormulario();
        this.cargarDatosUnificados();
    } else alert(res.mensaje || 'Error');
    this.cd.detectChanges();
  }

  procesarEliminacion(res: any) {
      if(res.exito) this.cargarDatosUnificados();
      else alert(res.mensaje);
      this.cd.detectChanges();
  }

  procesarError() {
      this.enviando = false;
      alert('Error de conexión');
      this.cd.detectChanges();
  }
}
