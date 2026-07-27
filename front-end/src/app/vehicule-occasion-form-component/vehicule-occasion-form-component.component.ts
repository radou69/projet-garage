import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { VehiculeOccasionService, VehiculeOccasion, VehiculeOccasionCreatePayload } from '../services/vehicule-occasion.service';
import { ClientService, Client } from '../services/client.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-vehicule-occasion-form-component',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './vehicule-occasion-form-component.component.html',
  styleUrl: './vehicule-occasion-form-component.component.css'
})
export class VehiculeOccasionFormComponentComponent implements OnInit {
  vo: VehiculeOccasionCreatePayload = {
    marque: '',
    modele: '',
    annee: undefined,
    kilometrage: undefined,
    prix: undefined as any
  };

  voId: number | null = null;
  isEditMode = false;
  statutActuel = '';
  clientActuel: string | null = null;

  clients: Client[] = [];
  clientAcheteurId: number | undefined = undefined;

  errorMessage = '';
  successMessage = '';

  constructor(
    private voService: VehiculeOccasionService,
    private clientService: ClientService,
    public authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.clientService.getAll().subscribe({
      next: (data) => {
        this.clients = data;
      }
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.voId = Number(idParam);
      this.voService.getOne(this.voId).subscribe({
        next: (data) => {
          this.vo = {
            marque: data.marque,
            modele: data.modele,
            annee: data.annee ?? undefined,
            kilometrage: data.kilometrage ?? undefined,
            prix: Number(data.prix)
          };
          this.statutActuel = data.statut ?? 'disponible';
          this.clientActuel = data.client ? `${data.client.prenom} ${data.client.nom}` : null;
        },
        error: () => {
          this.errorMessage = 'Impossible de charger ce véhicule.';
        }
      });
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const request = this.isEditMode && this.voId
      ? this.voService.update(this.voId, this.vo)
      : this.voService.create(this.vo);

    request.subscribe({
      next: () => {
        this.successMessage = this.isEditMode ? 'Véhicule modifié avec succès.' : 'Véhicule ajouté au stock avec succès.';
        setTimeout(() => this.router.navigate(['/vehicules-occasion']), 1000);
      },
      error: () => {
        this.errorMessage = 'Erreur lors de l\'enregistrement. Vérifiez les champs.';
      }
    });
  }

  vendreVehicule(): void {
    this.errorMessage = '';
    if (!this.voId || !this.clientAcheteurId) {
      this.errorMessage = 'Merci de sélectionner un client acheteur.';
      return;
    }
    const confirmed = confirm('Confirmer la vente de ce véhicule ? Cette action est définitive.');
    if (!confirmed) {
      return;
    }
    this.voService.vendre(this.voId, this.clientAcheteurId).subscribe({
      next: () => {
        this.successMessage = 'Véhicule marqué comme vendu.';
        this.statutActuel = 'vendu';
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Impossible de finaliser la vente.';
      }
    });
  }
}
