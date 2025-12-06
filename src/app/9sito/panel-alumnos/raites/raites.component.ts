import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RaitesService, Raite } from '../../../services/raites.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-raites',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './raites.html',
  styleUrls: ['./raites.css']
})
export class RaitesComponent implements OnInit {
  raitesData: Raite[] = [];
  cargando: boolean = true;
  pestanaActual: 'ofrezco' | 'busco' = 'ofrezco';
  mostrarModal: boolean = false;
  tipoModal: 'Conductor' | 'Pasajero' = 'Conductor';
  raiteExpandidoId: number | null = null;

  nuevoRaite: Raite = {
    tipo: 'Conductor',
    origen: '',
    destino: '',
    hora: '',
    cupo: 1,
    nota: ''
  };

  constructor(
    private raitesService: RaitesService,
    public authService: AuthService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() { this.cargarRaites(); }

  cargarRaites() {
    this.cargando = true;
    this.raitesService.getRaites().subscribe({
      next: (data) => {
        this.raitesData = data;
        this.cargando = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cd.detectChanges();
      }
    });
  }

  get raitesFiltrados() {
    const tipo = this.pestanaActual === 'ofrezco' ? 'Conductor' : 'Pasajero';
    return this.raitesData.filter(r => r.tipo === tipo);
  }

  abrirModal(tipo: 'Conductor' | 'Pasajero') {
    this.tipoModal = tipo;
    this.nuevoRaite = { tipo, origen: '', destino: 'UTL', hora: '', cupo: 1, nota: '' };
    this.mostrarModal = true;
    this.cd.detectChanges();
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.cd.detectChanges();
  }

  publicar() {
    const usuario = this.authService.usuarioActual;
    if (!usuario) { alert('Error: No estás logueado.'); return; }
    if (!this.nuevoRaite.origen || !this.nuevoRaite.destino || !this.nuevoRaite.hora) {
      alert('Por favor completa los campos obligatorios.'); return;
    }
    this.nuevoRaite.usuario_id = usuario.id;

    this.raitesService.crearRaite(this.nuevoRaite).subscribe({
      next: (res: any) => {
        if (res.exito) {
          alert(res.mensaje);
          this.cerrarModal();
          this.cargarRaites();
        } else { alert('Error: ' + res.mensaje); }
        this.cd.detectChanges();
      },
      error: () => { alert('Error conexión'); this.cd.detectChanges(); }
    });
  }

  esMiRaite(r: Raite) { const u = this.authService.usuarioActual; return !!u && r.usuario_id === u.id; }
  yaSolicito(r: Raite) { const u = this.authService.usuarioActual; return !!u && r.ids_pasajeros?.includes(u.id); }

  togglePasajeros(id: number) {
    this.raiteExpandidoId = this.raiteExpandidoId === id ? null : id;
    this.cd.detectChanges();
  }

  solicitarViaje(r: Raite) {
    const u = this.authService.usuarioActual;
    if (!u) { alert('Inicia sesión'); return; }
    if (this.esMiRaite(r)) return alert('No puedes solicitar tu propio viaje');
    if (this.yaSolicito(r)) return alert('Ya solicitaste');
    if (r.cupo <= 0) return alert('Lleno');

    if(confirm('¿Solicitar lugar?')) {
      this.raitesService.solicitarCupo(r.id!, u.id).subscribe({
        next: (res: any) => {
          if(res.exito) {
             alert('¡Solicitado!');
             r.cupo = res.nuevo_cupo;
             if(!r.ids_pasajeros) r.ids_pasajeros = [];
             r.ids_pasajeros.push(u.id);
          } else alert(res.mensaje);
          this.cd.detectChanges();
        }
      });
    }
  }

  eliminar(r: Raite) {
      if(confirm('¿Eliminar viaje?')) {
          this.raitesService.eliminarRaite(r.id!).subscribe(res => {
              if(res.exito) this.cargarRaites();
              this.cd.detectChanges();
          });
      }
  }
}
