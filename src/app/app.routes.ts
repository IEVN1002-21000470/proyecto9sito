import { Routes } from '@angular/router';

export const routes: Routes = [
    // Redirección inicial
    { path: '', redirectTo: 'alumno/dashboard', pathMatch: 'full' },

    // ==========================================
    // RUTAS DEL PANEL DE ALUMNOS
    // ==========================================
    {
        path: 'alumno',
        // Carga el Layout (Barra lateral)
        loadComponent: () => import('./9sito/panel-alumnos/panel-alumnos.component').then(m => m.PanelAlumnosComponent),
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./9sito/panel-alumnos/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'avisos',
                loadComponent: () => import('./9sito/panel-alumnos/avisos/avisos.component').then(m => m.AvisosComponent)
            },
            {
                path: 'bolsa',
                loadComponent: () => import('./9sito/panel-alumnos/bolsa/bolsa.component').then(m => m.BolsaComponent)
            },
            {
                path: 'raites',
                loadComponent: () => import('./9sito/panel-alumnos/raites/raites.component').then(m => m.RaitesComponent)
            },
            {
                path: 'cursos',
                loadComponent: () => import('./9sito/panel-alumnos/cursos/cursos.component').then(m => m.CursosComponent)
            },
            {
                path: 'mercado',
                loadComponent: () => import('./9sito/panel-alumnos/mercado/mercado.component').then(m => m.MercadoComponent)
            },
            {
                path: 'calendario',
                loadComponent: () => import('./9sito/panel-alumnos/calendario/calendario.component').then(m => m.CalendarioComponent)
            },
            {
                path: 'directorio',
                loadComponent: () => import('./9sito/panel-alumnos/directorio/directorio.component').then(m => m.DirectorioComponent)
            },
            {
                path: 'configuracion',
                loadComponent: () => import('./9sito/panel-alumnos/configuracion/configuracion.component').then(m => m.ConfiguracionComponent)
            },

            {
                path: 'perfil',
                loadComponent: () => import('./9sito/panel-alumnos/perfil/perfil.component').then(m => m.PerfilComponent)
            },

            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },

    // ==========================================
    // RUTAS DEL PANEL DE ADMINISTRADORES
    // ==========================================
    {
        path: 'admin',
        loadComponent: () => import('./9sito/panel-admin/panel-admin.component').then(m => m.PanelAdminComponent),
        children: [
            {
                path: 'dashboardAdmin',
                loadComponent: () => import('./9sito/panel-admin/dashboard/dashboardAdmin.component').then(m => m.DashboardAdminComponent)
            },
            {
                path: 'usuarios',
                loadComponent: () => import('./9sito/panel-admin/usuarios/usuarios.component').then(m => m.UsuariosComponent)
            },
            {
                path: 'moderacion',
                loadComponent: () => import('./9sito/panel-admin/moderacion/moderacion.component').then(m => m.ModeracionComponent)
            },
            {
                path: 'avisosAdmin',
                loadComponent: () => import('./9sito/panel-admin/avisos/avisos.component').then(m => m.CrearAvisoComponent)
            },
            { path: '', redirectTo: 'dashboardAdmin', pathMatch: 'full' }
        ]
    }
];
