import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // Importa RouterModule
import { CommonModule } from '@angular/common'; // Importa CommonModule si lo necesitas

@Component({
  selector: 'app-dashboard',
  standalone: true, // ✅ CORRECCIÓN: Marca el componente como standalone
  imports: [RouterModule, CommonModule], // ✅ CORRECCIÓN: Agrega RouterModule y CommonModule a los imports
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}
