import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DevisService, Devis } from '../services/devis.service';

@Component({
  selector: 'app-devis-list-component',
  imports: [CommonModule, RouterLink],
  templateUrl: './devis-list-component.component.html',
  styleUrl: './devis-list-component.component.css'
})
export class DevisListComponentComponent implements OnInit {
  devisListe: Devis[] = [];
  errorMessage = '';

  constructor(private devisService: DevisService) {}

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
}
