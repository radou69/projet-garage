import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { VehiculeService, VehiculeCreatePayload } from '../services/vehicule.service';
import { ClientService, Client } from '../services/client.service';

@Component({
  selector: 'app-vehicule-form-component',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './vehicule-form-component.component.html',
  styleUrl: './vehicule-form-component.component.css'
})
export class VehiculeFormComponentComponent implements OnInit {
  vehicule: VehiculeCreatePayload = {
    marque: '',
    modele: '',
    immatriculation: '',
    carburant: '',
    vin: '',
    annee: undefined as any,
    kilometrage: undefined as any,
    client_id: undefined as any
  };

  clients: Client[] = [];
  vehiculeId: number | null = null;
  isEditMode = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private vehiculeService: VehiculeService,
    private clientService: ClientService,
    private router: Router,
    private route: ActivatedRoute
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

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.vehiculeId = Number(idParam);
      this.vehiculeService.getOne(this.vehiculeId).subscribe({
        next: (data) => {
          this.vehicule = {
            marque: data.marque,
            modele: data.modele,
            immatriculation: data.immatriculation,
            carburant: data.carburant,
            vin: data.vin,
            annee: data.annee,
            kilometrage: data.kilometrage,
            client_id: data.client.id
          };
        },
        error: () => {
          this.errorMessage = 'Impossible de charger les données du véhicule.';
        }
      });
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const request = this.isEditMode && this.vehiculeId
      ? this.vehiculeService.update(this.vehiculeId, this.vehicule)
      : this.vehiculeService.create(this.vehicule);

    request.subscribe({
      next: () => {
        this.successMessage = this.isEditMode ? 'Véhicule modifié avec succès.' : 'Véhicule créé avec succès.';
        setTimeout(() => this.router.navigate(['/vehicules']), 1000);
      },
      error: () => {
        this.errorMessage = 'Erreur lors de l\'enregistrement. Vérifiez les champs.';
      }
    });
  }
}
