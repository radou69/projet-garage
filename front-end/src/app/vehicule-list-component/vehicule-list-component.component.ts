import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VehiculeService, Vehicule } from '../services/vehicule.service';

@Component({
  selector: 'app-vehicule-list-component',
  imports: [CommonModule, RouterLink],
  templateUrl: './vehicule-list-component.component.html',
  styleUrl: './vehicule-list-component.component.css'
})
export class VehiculeListComponentComponent implements OnInit {
  vehicules: Vehicule[] = [];
  errorMessage = '';

  constructor(private vehiculeService: VehiculeService) {}

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
}
