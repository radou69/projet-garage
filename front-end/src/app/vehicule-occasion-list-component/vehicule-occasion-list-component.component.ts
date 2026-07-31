import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { VehiculeOccasionService, VehiculeOccasion } from '../services/vehicule-occasion.service';
import { AuthService } from '../services/auth.service';
import { MenuStateService } from '../services/menu-state.service';

type FiltreStatut = 'toutes' | 'disponible' | 'reserve' | 'vendu';

@Component({
  selector: 'app-vehicule-occasion-list-component',
  imports: [CommonModule, RouterLink],
  templateUrl: './vehicule-occasion-list-component.component.html',
  styleUrl: './vehicule-occasion-list-component.component.css'
})
export class VehiculeOccasionListComponentComponent implements OnInit {
  vehicules: VehiculeOccasion[] = [];
  errorMessage = '';
  filtre: FiltreStatut = 'toutes';

  constructor(
    private voService: VehiculeOccasionService,
    private authService: AuthService,
    private menuState: MenuStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadVehicules();
  }

  loadVehicules(): void {
    this.voService.getAll().subscribe({
      next: (data) => {
        this.vehicules = data;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger le stock de véhicules d\'occasion.';
      }
    });
  }

  setFiltre(filtre: FiltreStatut): void {
    this.filtre = filtre;
  }

  get vehiculesFiltres(): VehiculeOccasion[] {
    if (this.filtre === 'toutes') {
      return this.vehicules;
    }
    return this.vehicules.filter(v => v.statut === this.filtre);
  }

  get countDisponible(): number {
    return this.vehicules.filter(v => v.statut === 'disponible').length;
  }

  get countReserve(): number {
    return this.vehicules.filter(v => v.statut === 'reserve').length;
  }

  get countVendu(): number {
    return this.vehicules.filter(v => v.statut === 'vendu').length;
  }

  statutLabel(statut?: string): string {
    switch (statut) {
      case 'disponible': return 'Disponible';
      case 'reserve': return 'Réservé';
      case 'vendu': return 'Vendu';
      default: return statut ?? '';
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openMenu(): void {
    this.menuState.open();
  }
}
