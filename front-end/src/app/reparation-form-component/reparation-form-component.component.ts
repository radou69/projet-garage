import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ReparationService } from '../services/reparation.service';
import { VehiculeService, Vehicule } from '../services/vehicule.service';

@Component({
  selector: 'app-reparation-form-component',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reparation-form-component.component.html',
  styleUrl: './reparation-form-component.component.css'
})
export class ReparationFormComponentComponent implements OnInit {
  date = '';
  description = '';
  vehiculeId: number | undefined = undefined;
  vehicules: Vehicule[] = [];
  errorMessage = '';

  constructor(
    private reparationService: ReparationService,
    private vehiculeService: VehiculeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.vehiculeService.getAll().subscribe({
      next: (data) => {
        this.vehicules = data;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger la liste des véhicules.';
      }
    });
  }

  onSubmit(): void {
    this.errorMessage = '';

    this.reparationService.create({
      date: this.date,
      description: this.description,
      vehicule_id: this.vehiculeId as number
    }).subscribe({
      next: (reparation) => {
        this.router.navigate(['/reparations', reparation.id]);
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la création de la réparation. Vérifiez les champs.';
      }
    });
  }
}
