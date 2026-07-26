import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VehiculeOccasionService, VehiculeOccasion } from '../services/vehicule-occasion.service';

@Component({
  selector: 'app-vehicule-occasion-list-component',
  imports: [CommonModule, RouterLink],
  templateUrl: './vehicule-occasion-list-component.component.html',
  styleUrl: './vehicule-occasion-list-component.component.css'
})
export class VehiculeOccasionListComponentComponent implements OnInit {
  vehicules: VehiculeOccasion[] = [];
  errorMessage = '';

  constructor(private voService: VehiculeOccasionService) {}

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
}
