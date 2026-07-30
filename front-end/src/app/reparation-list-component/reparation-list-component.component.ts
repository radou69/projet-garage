import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReparationService, Reparation } from '../services/reparation.service';
import { AuthService } from '../services/auth.service';
import { MenuStateService } from '../services/menu-state.service';

type FiltreStatut = 'en_cours' | 'terminee' | 'toutes';

@Component({
  selector: 'app-reparation-list-component',
  imports: [CommonModule, RouterLink],
  templateUrl: './reparation-list-component.component.html',
  styleUrl: './reparation-list-component.component.css'
})
export class ReparationListComponentComponent implements OnInit {
  reparations: Reparation[] = [];
  errorMessage = '';
  filtre: FiltreStatut = 'en_cours';

  constructor(
    private reparationService: ReparationService,
    public authService: AuthService,
    private router: Router,
    private menuState: MenuStateService
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

  setFiltre(filtre: FiltreStatut): void {
    this.filtre = filtre;
  }

  get reparationsFiltrees(): Reparation[] {
    if (this.filtre === 'toutes') {
      return this.reparations;
    }
    return this.reparations.filter(r => r.statut === this.filtre);
  }

  get subtitleText(): string {
    const count = this.reparationsFiltrees.length;
    const suffixe = count > 1 ? 's' : '';
    if (this.filtre === 'en_cours') {
      return `${count} réparation${suffixe} en cours`;
    }
    if (this.filtre === 'terminee') {
      return `${count} réparation${suffixe} terminée${suffixe}`;
    }
    return `${count} réparation${suffixe} au total`;
  }

  statutLabel(statut?: string): string {
    switch (statut) {
      case 'en_attente': return 'En attente';
      case 'en_cours': return 'En cours';
      case 'terminee': return 'Terminée';
      case 'annulee': return 'Annulée';
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
