import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReparationService, Reparation, ReparationPieceLigne } from '../services/reparation.service';
import { PieceService, Piece } from '../services/piece.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-reparation-detail-component',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reparation-detail-component.component.html',
  styleUrl: './reparation-detail-component.component.css'
})
export class ReparationDetailComponentComponent implements OnInit {
  reparationId!: number;
  reparation: Reparation | null = null;
  lignes: ReparationPieceLigne[] = [];
  catalogue: Piece[] = [];
  errorMessage = '';
  successMessage = '';

  statutsPossibles = ['en_attente', 'en_cours', 'terminee'];

  pieceIdSelectionnee: number | undefined = undefined;
  quantiteSaisie = 1;

  constructor(
    private reparationService: ReparationService,
    private pieceService: PieceService,
    public authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.reparationId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadReparation();
    this.loadLignes();
    this.pieceService.getAll().subscribe({
      next: (data) => {
        this.catalogue = data;
      }
    });
  }

  loadReparation(): void {
    this.reparationService.getOne(this.reparationId).subscribe({
      next: (data) => {
        this.reparation = data;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger cette réparation.';
      }
    });
  }

  loadLignes(): void {
    this.reparationService.getPieces(this.reparationId).subscribe({
      next: (data) => {
        this.lignes = data;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les pièces de cette réparation.';
      }
    });
  }

  changerStatut(nouveauStatut: string): void {
    this.reparationService.update(this.reparationId, { ...this.reparationVersUpdatePayload(), statut: nouveauStatut } as any).subscribe({
      next: () => {
        this.loadReparation();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Impossible de changer le statut.';
      }
    });
  }

  peutAnnuler(): boolean {
    return !!this.reparation
      && this.reparation.statut !== 'terminee'
      && this.reparation.statut !== 'annulee'
      && this.authService.isPatron();
  }

  annulerReparation(): void {
    const confirmed = confirm('Annuler cette réparation ?');
    if (!confirmed) {
      return;
    }
    this.reparationService.cancel(this.reparationId).subscribe({
      next: () => {
        this.loadReparation();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || "Impossible d'annuler cette réparation.";
      }
    });
  }

  private reparationVersUpdatePayload() {
    return {
      date: this.reparation?.date,
      description: this.reparation?.description ?? undefined,
      vehicule_id: this.reparation?.vehicule.id
    };
  }

  ajouterPiece(): void {
    this.errorMessage = '';
    if (!this.pieceIdSelectionnee) {
      this.errorMessage = 'Merci de sélectionner une pièce.';
      return;
    }
    this.reparationService.addPiece(this.reparationId, this.pieceIdSelectionnee, this.quantiteSaisie).subscribe({
      next: () => {
        this.pieceIdSelectionnee = undefined;
        this.quantiteSaisie = 1;
        this.loadLignes();
        this.loadReparation();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || "Impossible d'ajouter cette pièce.";
      }
    });
  }

  supprimerLigne(ligneId: number): void {
    const confirmed = confirm('Retirer cette pièce de la réparation ?');
    if (!confirmed) {
      return;
    }
    this.reparationService.deletePiece(this.reparationId, ligneId).subscribe({
      next: () => {
        this.loadLignes();
        this.loadReparation();
      },
      error: () => {
        this.errorMessage = 'Impossible de retirer cette pièce.';
      }
    });
  }
}
