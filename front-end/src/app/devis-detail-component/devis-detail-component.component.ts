import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DevisService, Devis, DevisItem } from '../services/devis.service';
import { AuthService } from '../services/auth.service';
import { MenuStateService } from '../services/menu-state.service';

@Component({
  selector: 'app-devis-detail-component',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './devis-detail-component.component.html',
  styleUrl: './devis-detail-component.component.css'
})
export class DevisDetailComponentComponent implements OnInit {
  devisId!: number;
  devis: Devis | null = null;
  items: DevisItem[] = [];
  errorMessage = '';
  successMessage = '';

  statutsPossibles = ['brouillon', 'envoye', 'accepte', 'refuse', 'expire'];

  // Formulaire d'ajout de ligne
  nouvelleLigne = {
    designation: '',
    quantite: 1,
    prixUnitaire: 0
  };

  constructor(
    private devisService: DevisService,
    private authService: AuthService,
    private menuState: MenuStateService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openMenu(): void {
    this.menuState.open();
  }

  reference(devis: Devis): string {
    const annee = devis.date?.slice(0, 4) ?? '----';
    const numero = String(devis.id ?? 0).padStart(3, '0');
    return `DEV-${annee}-${numero}`;
  }

  // Dérivée d'affichage à partir des deux montants déjà calculés côté API (US6.3) —
  // ne redérive pas le taux de 20%, juste la différence des deux valeurs serveur.
  tva(devis: Devis): string {
    const ht = parseFloat(devis.montantHt ?? '0');
    const ttc = parseFloat(devis.montantTtc ?? '0');
    return (ttc - ht).toFixed(2);
  }

  ngOnInit(): void {
    this.devisId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadDevis();
    this.loadItems();
  }

  loadDevis(): void {
    this.devisService.getOne(this.devisId).subscribe({
      next: (data) => {
        this.devis = data;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger ce devis.';
      }
    });
  }

  loadItems(): void {
    this.devisService.getItems(this.devisId).subscribe({
      next: (data) => {
        this.items = data;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les lignes du devis.';
      }
    });
  }

  changerStatut(nouveauStatut: string): void {
    this.devisService.updateStatut(this.devisId, nouveauStatut).subscribe({
      next: () => {
        this.loadDevis();
      },
      error: () => {
        this.errorMessage = 'Impossible de changer le statut.';
      }
    });
  }

  ajouterLigne(): void {
    this.errorMessage = '';
    this.devisService.addItem(this.devisId, this.nouvelleLigne).subscribe({
      next: () => {
        this.nouvelleLigne = { designation: '', quantite: 1, prixUnitaire: 0 };
        this.loadItems();
        this.loadDevis(); // les montants ont été recalculés côté API
      },
      error: () => {
        this.errorMessage = "Impossible d'ajouter cette ligne. Vérifiez les champs.";
      }
    });
  }

  supprimerLigne(ligneId: number): void {
    const confirmed = confirm('Supprimer cette ligne ?');
    if (!confirmed) {
      return;
    }
    this.devisService.deleteItem(this.devisId, ligneId).subscribe({
      next: () => {
        this.loadItems();
        this.loadDevis();
      },
      error: () => {
        this.errorMessage = 'Impossible de supprimer cette ligne.';
      }
    });
  }

  transformerEnFacture(): void {
    const confirmed = confirm('Transformer ce devis en facture ? Cette action est définitive.');
    if (!confirmed) {
      return;
    }
    this.devisService.transformerEnFacture(this.devisId).subscribe({
      next: () => {
        this.successMessage = 'Devis transformé en facture avec succès.';
        setTimeout(() => this.router.navigate(['/factures']), 1200);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Impossible de transformer ce devis en facture.';
      }
    });
  }
}
