import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClientService, Client } from '../services/client.service';

@Component({
  selector: 'app-client-list-component',
  imports: [CommonModule, RouterLink],
  templateUrl: './client-list-component.component.html',
  styleUrl: './client-list-component.component.css'
})
export class ClientListComponentComponent implements OnInit {
  clients: Client[] = [];
  errorMessage = '';

  constructor(private clientService: ClientService) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.clientService.getAll().subscribe({
      next: (data) => {
        this.clients = data;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger la liste des clients.';
      }
    });
  }

  archiveClient(id: number, nom: string): void {
    const confirmed = confirm(`Archiver le client ${nom} ? Il ne sera plus visible dans la liste.`);
    if (!confirmed) {
      return;
    }
    this.clientService.archive(id).subscribe({
      next: () => {
        this.loadClients();
      },
      error: () => {
        this.errorMessage = "Impossible d'archiver ce client.";
      }
    });
  }
}
