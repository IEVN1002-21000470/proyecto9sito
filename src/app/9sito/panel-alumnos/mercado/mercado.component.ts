import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface MercadoItem {
  id: number;
  titulo: string;
  precio: number;
  tipo: 'Venta' | 'Intercambio' | 'Gratis'; // Para lógica de visualización
  categoria: string;
  vendedor: string;
  imagen: string;
}

@Component({
  selector: 'app-mercado',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mercado.html',
  styleUrls: ['./mercado.css']
})
export class MercadoComponent {
  mercadoData: MercadoItem[] = [
    {
      id: 1,
      titulo: 'Cálculo de Varias Variables (Stewart 8va Ed)',
      precio: 250,
      tipo: 'Venta',
      categoria: 'Libros',
      vendedor: '@jgarcia',
      imagen: 'https://placehold.co/400x400/1a103c/10e3a4?text=Cálculo'
    },
    {
      id: 2,
      titulo: 'Bata de Laboratorio Talla M',
      precio: 0,
      tipo: 'Intercambio',
      categoria: 'Uniformes',
      vendedor: '@ana_g',
      imagen: 'https://placehold.co/400x400/1a103c/00b4d8?text=Bata'
    },
    {
      id: 3,
      titulo: 'Kit de Arduino Básico',
      precio: 450,
      tipo: 'Venta',
      categoria: 'Material',
      vendedor: '@luis_dev',
      imagen: 'https://placehold.co/400x400/1a103c/9333ea?text=Arduino'
    },
    {
      id: 4,
      titulo: 'Apuntes de Química Orgánica',
      precio: 0,
      tipo: 'Gratis',
      categoria: 'Apuntes',
      vendedor: '@sofia_chem',
      imagen: 'https://placehold.co/400x400/1a103c/f59e0b?text=Apuntes'
    }
  ];
}
