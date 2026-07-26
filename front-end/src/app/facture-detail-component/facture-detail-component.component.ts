import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FactureService, Facture, FactureItem } from '../services/facture.service';

@Component({
  selector: 'app-facture-detail-component',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './facture-detail-component.component.html',
  styleUrl: './facture-detail-component.component.css'
})
export class FactureDetailComponentComponent implements OnInit {
  factureId!: number;
  facture: Facture | null = null;
  items: FactureItem[] = [];
  montantAcompteSaisi: number | null = null;
  errorMessage = '';
  successMessage = '';

  constructor(
    private factureService: FactureService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.factureId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadFacture();
    this.loadItems();
  }

  loadFacture(): void {
    this.factureService.getOne(this.factureId).subscribe({
      next: (data) => {
        this.facture = data;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger cette facture.';
      }
    });
  }

  loadItems(): void {
    this.factureService.getItems(this.factureId).subscribe({
      next: (data) => {
        this.items = data;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les lignes de la facture.';
      }
    });
  }

  enregistrerAcompte(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.montantAcompteSaisi || this.montantAcompteSaisi <= 0) {
      this.errorMessage = 'Merci de saisir un montant valide.';
      return;
    }

    this.factureService.payerAcompte(this.factureId, this.montantAcompteSaisi).subscribe({
      next: () => {
        this.successMessage = 'Acompte enregistré avec succès.';
        this.montantAcompteSaisi = null;
        this.loadFacture();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || "Impossible d'enregistrer cet acompte.";
      }
    });
  }

  annulerFacture(): void {
    const confirmed = confirm('Annuler cette facture ? Cette action est définitive.');
    if (!confirmed) {
      return;
    }
    this.factureService.annuler(this.factureId).subscribe({
      next: () => {
        this.loadFacture();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Impossible d\'annuler cette facture.';
      }
    });
  }
}
