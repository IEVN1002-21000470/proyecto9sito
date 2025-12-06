import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MercadoService, MercadoItem } from '../../../services/mercado.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-mercado',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mercado.html',
  styleUrls: ['./mercado.css']
})
export class MercadoComponent implements OnInit {
  mercadoData: MercadoItem[] = [];
  cargando: boolean = true;
  filtroCategoria: string = 'Todas las Categorías';
  mostrarModal: boolean = false;
  mostrarModalContacto: boolean = false;
  nuevoItem: MercadoItem = { titulo: '', descripcion: '', precio: '', categoria: 'Libros' };
  itemContacto: MercadoItem | null = null;
  imagenSeleccionada: File | null = null;
  enviando: boolean = false;

  constructor(private mercadoService: MercadoService, public authService: AuthService, private cd: ChangeDetectorRef) {}

  ngOnInit() { this.cargarMercado(); }

  cargarMercado() {
    this.cargando = true;
    this.mercadoService.getArticulos().subscribe({
      next: (data) => { this.mercadoData = data; this.cargando = false; this.cd.detectChanges(); },
      error: () => { this.cargando = false; this.cd.detectChanges(); }
    });
  }

  get articulosFiltrados() {
    return this.filtroCategoria === 'Todas las Categorías' ? this.mercadoData : this.mercadoData.filter(i => i.categoria === this.filtroCategoria);
  }

  abrirModalVenta() { this.mostrarModal = true; this.cd.detectChanges(); }
  cerrarModal() { this.mostrarModal = false; this.imagenSeleccionada = null; this.cd.detectChanges(); }

  onFileSelected(e: any) { if(e.target.files.length > 0) this.imagenSeleccionada = e.target.files[0]; }

  publicar() {
    const u = this.authService.usuarioActual;
    if (!u) return alert('Inicia sesión');
    if (!this.nuevoItem.titulo || !this.nuevoItem.precio) return alert('Completa campos');

    this.enviando = true;
    this.mercadoService.publicarArticulo(this.nuevoItem, this.imagenSeleccionada, u.id).subscribe({
      next: (res: any) => {
        this.enviando = false;
        if (res.exito) {
          alert('Enviado a revisión.');
          this.cerrarModal();
          this.nuevoItem = { titulo: '', descripcion: '', precio: '', categoria: 'Libros' };
          this.cargarMercado();
        } else alert(res.mensaje);
        this.cd.detectChanges();
      },
      error: () => { this.enviando = false; alert('Error conexión'); this.cd.detectChanges(); }
    });
  }

  // --- FUNCIÓN QUE FALTABA (CORRECCIÓN DEL ERROR) ---
  pausarReactivar(item: MercadoItem) {
    const nuevoEstado = item.estado === 'Activo' ? 'Pausado' : 'Activo';
    // Asumiendo que tienes un método cambiarEstadoMercado en tu servicio,
    // si no, asegúrate de que tu MercadoService tenga este método o usa el nombre correcto.
    this.mercadoService.cambiarEstadoMercado(item.id!, nuevoEstado).subscribe({
      next: (res: any) => {
        if(res.exito) {
          item.estado = nuevoEstado;
          this.cd.detectChanges();
        }
      }
    });
  }

  abrirContacto(i: MercadoItem) { this.itemContacto = i; this.mostrarModalContacto = true; this.cd.detectChanges(); }
  cerrarModalContacto() { this.mostrarModalContacto = false; this.itemContacto = null; this.cd.detectChanges(); }
  esMio(i: MercadoItem) { const u = this.authService.usuarioActual; return u && u.id === i.vendedor_id; }
  irAWhatsApp() { if (this.itemContacto?.telefono) window.open(`https://wa.me/52${this.itemContacto.telefono}`, '_blank'); }

  eliminar(i: MercadoItem) {
      if(confirm('¿Eliminar?')) {
          this.mercadoService.eliminarArticulo(i.id!).subscribe(res => {
              if(res.exito) this.cargarMercado();
              this.cd.detectChanges();
          });
      }
  }
}
