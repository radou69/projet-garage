import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ClientService, Client } from '../services/client.service';
import { VehiculeService, Vehicule } from '../services/vehicule.service';
import { AuthService } from '../services/auth.service';
import { MenuStateService } from '../services/menu-state.service';

@Component({
  selector: 'app-client-list-component',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './client-list-component.component.html',
  styleUrl: './client-list-component.component.css'
})
export class ClientListComponentComponent implements OnInit {
  clients: Client[] = [];
  errorMessage = '';
  searchTerm = '';
  private vehiculeParClient = new Map<number, Vehicule>();

  constructor(
    private clientService: ClientService,
    private vehiculeService: VehiculeService,
    private authService: AuthService,
    private router: Router,
    private menuState: MenuStateService
  ) {}

  ngOnInit(): void {
    this.loadClients();
    this.loadVehicules();
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

  loadVehicules(): void {
    this.vehiculeService.getAll().subscribe({
      next: (data) => {
        for (const v of data) {
          if (!this.vehiculeParClient.has(v.client.id)) {
            this.vehiculeParClient.set(v.client.id, v);
          }
        }
      }
    });
  }

  vehiculePrincipal(clientId: number): Vehicule | undefined {
    return this.vehiculeParClient.get(clientId);
  }

  get clientsFiltres(): Client[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return this.clients;
    }
    return this.clients.filter(c => {
      const vehicule = this.vehiculeParClient.get(c.id!);
      const vehiculeTexte = vehicule ? `${vehicule.marque} ${vehicule.modele}`.toLowerCase() : '';
      return c.nom.toLowerCase().includes(term)
        || c.prenom.toLowerCase().includes(term)
        || c.telephone.toLowerCase().includes(term)
        || vehiculeTexte.includes(term);
    });
  }

  initiales(nom: string, prenom: string): string {
    return ((prenom?.charAt(0) ?? '') + (nom?.charAt(0) ?? '')).toUpperCase();
  }

  avatarColor(id: number | undefined): string {
    const colors = ['#e74c3c', '#27ae60', '#2980b9', '#c6a51a', '#8e44ad', '#e67e22', '#16a085'];
    return colors[(id ?? 0) % colors.length];
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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openMenu(): void {
    this.menuState.open();
  }
}
