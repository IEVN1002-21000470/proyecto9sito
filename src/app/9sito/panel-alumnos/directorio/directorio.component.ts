import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Contacto {
  id: number;
  nombre: string;
  puesto: string;
  correo: string;
  oficina: string;
  avatar: string;
}

@Component({
  selector: 'app-directorio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './directorio.html',
  styleUrls: ['./directorio.css']
})
export class DirectorioComponent {
  directorioData: Contacto[] = [
    {
      id: 1,
      nombre: 'Prof. David Rico',
      puesto: 'Docente - Sistemas',
      correo: 'drico@utleon.edu.mx',
      oficina: 'Edificio C, Cubículo 12',
      avatar: 'https://ui-avatars.com/api/?name=David+Rico&background=00b4d8&color=1a103c&font-size=0.5'
    },
    {
      id: 2,
      nombre: 'Control Escolar',
      puesto: 'Departamento Administrativo',
      correo: 'escolar@utleon.edu.mx',
      oficina: 'Edificio A, Ventanillas 1-3',
      avatar: 'https://ui-avatars.com/api/?name=Control+Escolar&background=cccccc&color=1a103c&font-size=0.5'
    },
    {
      id: 3,
      nombre: 'Ing. Alan Turing',
      puesto: 'Coordinador de T.I.',
      correo: 'aturing@utleon.edu.mx',
      oficina: 'Edificio K, Planta Alta',
      avatar: 'https://ui-avatars.com/api/?name=Alan+Turing&background=10e3a4&color=1a103c&font-size=0.5'
    },
    {
      id: 4,
      nombre: 'Soporte Técnico',
      puesto: 'Ayuda TI',
      correo: 'soporte@utleon.edu.mx',
      oficina: 'Biblioteca, Sala de Cómputo',
      avatar: 'https://ui-avatars.com/api/?name=Soporte+Tecnico&background=9333ea&color=ffffff&font-size=0.5'
    }
  ];
}
