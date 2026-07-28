import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VehiculeService, Vehicule } from '../services/vehicule.service';
import { ClientService, Client } from '../services/client.service';
import { ReparationService, Reparation } from '../services/reparation.service';
import { AuthService } from '../services/auth.service';
import { MenuStateService } from '../services/menu-state.service';

@Component({
  selector: 'app-vehicule-detail-component',
  imports: [CommonModule, RouterLink],
  templateUrl: './vehicule-detail-component.component.html',
  styleUrl: './vehicule-detail-component.component.css'
})
export class VehiculeDetailComponentComponent implements OnInit {
  vehicule: Vehicule | null = null;
  proprietaire: Client | null = null;
  reparations: Reparation[] = [];
  errorMessage = '';

  constructor(
    private vehiculeService: VehiculeService,
    private clientService: ClientService,
    private reparationService: ReparationService,
    private authService: AuthService,
    private menuState: MenuStateService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.vehiculeService.getOne(id).subscribe({
      next: (data) => {
        this.vehicule = data;
        if (data.client?.id) {
          this.clientService.getOne(data.client.id).subscribe({
            next: (c) => { this.proprietaire = c; }
          });
        }
      },
      error: () => {
        this.errorMessage = 'Impossible de charger la fiche véhicule.';
      }
    });

    this.reparationService.getAll().subscribe({
      next: (data) => {
        this.reparations = data.filter(r => r.vehicule.id === id);
      }
    });
  }

  initiales(nom: string, prenom: string): string {
    return ((prenom?.charAt(0) ?? '') + (nom?.charAt(0) ?? '')).toUpperCase();
  }

  statutLabel(statut?: string): string {
    switch (statut) {
      case 'en_attente': return 'En attente';
      case 'en_cours': return 'En cours';
      case 'terminee': return 'Terminé';
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
