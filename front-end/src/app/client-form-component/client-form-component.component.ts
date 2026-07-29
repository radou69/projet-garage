import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ClientService, Client } from '../services/client.service';
import { VehiculeService, VehiculeCreatePayload } from '../services/vehicule.service';
import { AuthService } from '../services/auth.service';
import { MenuStateService } from '../services/menu-state.service';

@Component({
  selector: 'app-client-form-component',
  imports: [FormsModule, RouterLink],
  templateUrl: './client-form-component.component.html',
  styleUrl: './client-form-component.component.css'
})
export class ClientFormComponentComponent implements OnInit {
  client: Client = {
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    adresse: ''
  };

  vehicule = {
    marque: '',
    modele: '',
    immatriculation: ''
  };

  clientId: number | null = null;
  isEditMode = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private clientService: ClientService,
    private vehiculeService: VehiculeService,
    private authService: AuthService,
    private menuState: MenuStateService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.clientId = Number(idParam);
      this.clientService.getOne(this.clientId).subscribe({
        next: (data) => {
          this.client = data;
        },
        error: () => {
          this.errorMessage = "Impossible de charger les données du client.";
        }
      });
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.isEditMode && this.clientId) {
      this.clientService.update(this.clientId, this.client).subscribe({
        next: () => {
          this.successMessage = 'Client modifié avec succès.';
          setTimeout(() => this.router.navigate(['/clients']), 1000);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Erreur lors de l\'enregistrement. Vérifiez les champs.';
        }
      });
      return;
    }

    this.clientService.create(this.client).subscribe({
      next: (createdClient) => {
        const payload: VehiculeCreatePayload = {
          marque: this.vehicule.marque,
          modele: this.vehicule.modele,
          immatriculation: this.vehicule.immatriculation,
          client_id: createdClient.id!
        };
        this.vehiculeService.create(payload).subscribe({
          next: () => {
            this.successMessage = 'Client et véhicule créés avec succès.';
            setTimeout(() => this.router.navigate(['/clients']), 1000);
          },
          error: (err) => {
            this.errorMessage = err.error?.message
              ? `Le client a été créé, mais : ${err.error.message}`
              : "Le client a été créé, mais une erreur est survenue lors de l'enregistrement du véhicule.";
          }
        });
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de l\'enregistrement. Vérifiez les champs.';
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
