import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FactureService, Facture } from '../services/facture.service';
import { AuthService } from '../services/auth.service';
import { MenuStateService } from '../services/menu-state.service';

type FiltreStatut = 'toutes' | 'payee' | 'attente';

@Component({
  selector: 'app-facture-list-component',
  imports: [CommonModule, RouterLink],
  templateUrl: './facture-list-component.component.html',
  styleUrl: './facture-list-component.component.css'
})
export class FactureListComponentComponent implements OnInit {
  factures: Facture[] = [];
  errorMessage = '';
  filtre: FiltreStatut = 'toutes';

  constructor(
    private factureService: FactureService,
    private authService: AuthService,
    private menuState: MenuStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFactures();
  }

  loadFactures(): void {
    this.factureService.getAll().subscribe({
      next: (data) => {
        this.factures = data;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger la liste des factures.';
      }
    });
  }

  setFiltre(filtre: FiltreStatut): void {
    this.filtre = filtre;
  }

  get facturesFiltrees(): Facture[] {
    if (this.filtre === 'toutes') {
      return this.factures;
    }
    if (this.filtre === 'payee') {
      return this.factures.filter(f => f.statut === 'payee');
    }
    return this.factures.filter(f => f.statut === 'emise' || f.statut === 'acompte');
  }

  // Somme déjà réellement encaissée : montant total pour une facture payée,
  // seulement l'acompte reçu pour une facture en acompte partiel.
  get montantEncaisse(): number {
    return this.factures.reduce((somme, f) => {
      if (f.statut === 'payee') {
        return somme + parseFloat(f.montantTtc);
      }
      if (f.statut === 'acompte') {
        return somme + parseFloat(f.montantAcompte);
      }
      return somme;
    }, 0);
  }

  // Reste dû : montant total pour une facture émise (rien reçu), ou le solde
  // restant pour une facture en acompte partiel.
  get montantEnAttente(): number {
    return this.factures.reduce((somme, f) => {
      if (f.statut === 'emise') {
        return somme + parseFloat(f.montantTtc);
      }
      if (f.statut === 'acompte') {
        return somme + (parseFloat(f.montantTtc) - parseFloat(f.montantAcompte));
      }
      return somme;
    }, 0);
  }

  reference(facture: Facture): string {
    const annee = facture.date?.slice(0, 4) ?? '----';
    const numero = String(facture.id ?? 0).padStart(3, '0');
    return `FAC-${annee}-${numero}`;
  }

  // Archivage réservé au patron, et seulement une fois la facture close
  // (payée ou annulée) — on évite d'archiver un document encore en cours.
  peutArchiver(facture: Facture): boolean {
    return this.authService.isPatron()
      && (facture.statut === 'payee' || facture.statut === 'annulee');
  }

  archiveFacture(id: number): void {
    const confirmed = confirm('Archiver cette facture ?');
    if (!confirmed) {
      return;
    }
    this.factureService.archive(id).subscribe({
      next: () => {
        this.loadFactures();
      },
      error: () => {
        this.errorMessage = "Impossible d'archiver cette facture.";
      }
    });
  }

  statutLabel(statut?: string): string {
    switch (statut) {
      case 'emise': return 'Émise';
      case 'acompte': return 'Acompte';
      case 'payee': return 'Payée';
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
