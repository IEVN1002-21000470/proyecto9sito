import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoAcademicaService } from '../../../services/info-academica.service';

interface Evento { titulo: string; tipo: 'normal' | 'suspension' | 'inicio'; }
interface DiaCalendario { numero: number; esMesActual: boolean; eventos: Evento[]; }

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendario.html',
  styleUrls: ['./calendario.css']
})
export class CalendarioComponent implements OnInit {
  diasCalendario: DiaCalendario[] = [];

  constructor(private infoService: InfoAcademicaService) {}

  ngOnInit() {
    this.generarMesBase();

    // Corregimos el tipo aquí
    this.infoService.getEventosCalendario().subscribe((eventosBD: any[]) => {
      eventosBD.forEach((ev: any) => {
        const dia = this.diasCalendario.find(d => d.numero === ev.dia && d.esMesActual);
        if (dia) {
          dia.eventos.push({ titulo: ev.titulo, tipo: ev.tipo || 'normal' });
        }
      });
    });
  }

  generarMesBase() {
    for(let i=26; i<=31; i++) this.diasCalendario.push({ numero: i, esMesActual: false, eventos: [] });
    for(let i=1; i<=30; i++) this.diasCalendario.push({ numero: i, esMesActual: true, eventos: [] });
  }
}
