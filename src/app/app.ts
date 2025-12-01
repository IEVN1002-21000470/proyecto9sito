import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { PanelAlumnosComponent } from '../app/9sito/panel-alumnos/panel-alumnos.component';
import { CommonModule } from '@angular/common';
import { PanelAdminComponent } from "../app/9sito/panel-admin/panel-admin.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, PanelAlumnosComponent, PanelAdminComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {
  title='9Sito'
}
