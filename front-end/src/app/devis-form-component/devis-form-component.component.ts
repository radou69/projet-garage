import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DevisService } from '../services/devis.service';
import { ClientService, Client } from '../services/client.service';

@Component({
  selector: 'app-devis-form-component',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './devis-form-component.component.html',
  styleUrl: './devis-form-component.component.css'
})
export class DevisFormComponentComponent implements OnInit {
  date = '';
  clientId: number | undefined = undefined;
  clients: Client[] = [];
  errorMessage = '';

  constructor(
    private devisService: DevisService,
    private clientService: ClientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.clientService.getAll().subscribe({
      next: (data) => {
        this.clients = data;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger la liste des clients.';
      }
    });
  }

  onSubmit(): void {
    this.errorMessage = '';

    this.devisService.create({
      date: this.date,
      client_id: this.clientId as number
    }).subscribe({
      next: (devis) => {
        // Redirection directe vers la page de gestion des lignes du devis créé
        this.router.navigate(['/devis', devis.id]);
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la création du devis. Vérifiez les champs.';
      }
    });
  }
}
