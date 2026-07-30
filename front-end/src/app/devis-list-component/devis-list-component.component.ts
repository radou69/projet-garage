import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DevisService, Devis } from '../services/devis.service';
import { AuthService } from '../services/auth.service';
import { MenuStateService } from '../services/menu-state.service';

@Component({
  selector: 'app-devis-list-component',
  imports: [CommonModule, RouterLink],
  templateUrl: './devis-list-component.component.html',
  styleUrl: './devis-list-component.component.css'
})
export class DevisListComponentComponent implements OnInit {
  devisListe: Devis[] = [];
  errorMessage = '';

  constructor(
    private devisService: DevisService,
    private authService: AuthService,
    private menuState: MenuStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDevis();
  }

  loadDevis(): void {
    this.devisService.getAll().subscribe({
      next: (data) => {
        this.devisListe = data;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger la liste des devis.';
      }
    });
  }

  archiveDevis(id: number): void {
    const confirmed = confirm('Archiver ce devis ?');
    if (!confirmed) {
      return;
    }
    this.devisService.archive(id).subscribe({
      next: () => {
        this.loadDevis();
      },
      error: () => {
        this.errorMessage = "Impossible d'archiver ce devis.";
      }
    });
  }

  reference(devis: Devis): string {
    const annee = devis.date?.slice(0, 4) ?? '----';
    const numero = String(devis.id ?? 0).padStart(3, '0');
    return `DEV-${annee}-${numero}`;
  }

  statutLabel(statut?: string): string {
    switch (statut) {
      case 'brouillon': return 'Brouillon';
      case 'envoye': return 'En attente';
      case 'accepte': return 'Accepté';
      case 'refuse': return 'Refusé';
      case 'expire': return 'Expiré';
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
