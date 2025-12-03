import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-panel-docentes',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './panel-docentes.html',
  styleUrl: './panel-docentes.css',
})
export class PanelDocentesComponent {

}
