import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReparationService, Reparation } from '../services/reparation.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-reparation-list-component',
  imports: [CommonModule, RouterLink],
  templateUrl: './reparation-list-component.component.html',
  styleUrl: './reparation-list-component.component.css'
})
export class ReparationListComponentComponent implements OnInit {
  reparations: Reparation[] = [];
  errorMessage = '';

  constructor(
    private reparationService: ReparationService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadReparations();
  }

  loadReparations(): void {
    this.reparationService.getAll().subscribe({
      next: (data) => {
        this.reparations = data;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger la liste des réparations.';
      }
    });
  }

  peutAnnuler(reparation: Reparation): boolean {
    return reparation.statut !== 'terminee' && reparation.statut !== 'annulee' && this.authService.isPatron();
  }

  annulerReparation(id: number): void {
    const confirmed = confirm('Annuler cette réparation ?');
    if (!confirmed) {
      return;
    }
    this.reparationService.cancel(id).subscribe({
      next: () => {
        this.loadReparations();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || "Impossible d'annuler cette réparation.";
      }
    });
  }
}
