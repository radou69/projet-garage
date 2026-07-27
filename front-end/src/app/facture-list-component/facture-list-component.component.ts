import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FactureService, Facture } from '../services/facture.service';

@Component({
  selector: 'app-facture-list-component',
  imports: [CommonModule, RouterLink],
  templateUrl: './facture-list-component.component.html',
  styleUrl: './facture-list-component.component.css'
})
export class FactureListComponentComponent implements OnInit {
  factures: Facture[] = [];
  errorMessage = '';

  constructor(private factureService: FactureService) {}

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
}
