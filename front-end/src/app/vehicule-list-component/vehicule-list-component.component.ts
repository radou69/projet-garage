import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { VehiculeService, Vehicule } from '../services/vehicule.service';
import { AuthService } from '../services/auth.service';
import { MenuStateService } from '../services/menu-state.service';

@Component({
  selector: 'app-vehicule-list-component',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './vehicule-list-component.component.html',
  styleUrl: './vehicule-list-component.component.css'
})
export class VehiculeListComponentComponent implements OnInit {
  vehicules: Vehicule[] = [];
  errorMessage = '';
  searchTerm = '';

  constructor(
    private vehiculeService: VehiculeService,
    private authService: AuthService,
    private router: Router,
    private menuState: MenuStateService
  ) {}

  ngOnInit(): void {
    this.loadVehicules();
  }

  loadVehicules(): void {
    this.vehiculeService.getAll().subscribe({
      next: (data) => {
        this.vehicules = data;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger la liste des véhicules.';
      }
    });
  }

  get vehiculesFiltres(): Vehicule[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return this.vehicules;
    }
    return this.vehicules.filter(v =>
      v.marque.toLowerCase().includes(term)
      || v.modele.toLowerCase().includes(term)
      || v.immatriculation.toLowerCase().includes(term)
    );
  }

  archiveVehicule(id: number, immatriculation: string): void {
    const confirmed = confirm(`Archiver le véhicule ${immatriculation} ? Il ne sera plus visible dans la liste.`);
    if (!confirmed) {
      return;
    }
    this.vehiculeService.archive(id).subscribe({
      next: () => {
        this.loadVehicules();
      },
      error: () => {
        this.errorMessage = "Impossible d'archiver ce véhicule.";
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openMenu(): void {
    this.menuState.open();
  }
}
