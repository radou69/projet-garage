import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RendezVousService, RendezVous } from '../services/rendez-vous.service';

@Component({
  selector: 'app-rendez-vous-list-component',
  imports: [CommonModule, RouterLink],
  templateUrl: './rendez-vous-list-component.component.html',
  styleUrl: './rendez-vous-list-component.component.css'
})
export class RendezVousListComponentComponent implements OnInit {
  rdvs: RendezVous[] = [];
  errorMessage = '';

  constructor(private rdvService: RendezVousService) {}

  ngOnInit(): void {
    this.loadRdvs();
  }

  loadRdvs(): void {
    this.rdvService.getAll().subscribe({
      next: (data) => {
        this.rdvs = data;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger la liste des rendez-vous.';
      }
    });
  }

  cancelRdv(id: number): void {
    const confirmed = confirm('Annuler ce rendez-vous ?');
    if (!confirmed) {
      return;
    }
    this.rdvService.cancel(id).subscribe({
      next: () => {
        this.loadRdvs();
      },
      error: () => {
        this.errorMessage = "Impossible d'annuler ce rendez-vous.";
      }
    });
  }
}
