import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-panel-alumnos',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './panel-alumnos.html',
   styleUrls: ['./panel-alumnos.css']
})
export class PanelAlumnosComponent {}
