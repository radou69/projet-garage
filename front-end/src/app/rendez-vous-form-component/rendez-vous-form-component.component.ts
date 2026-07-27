import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { RendezVousService, RendezVousCreatePayload } from '../services/rendez-vous.service';
import { ClientService, Client } from '../services/client.service';

@Component({
  selector: 'app-rendez-vous-form-component',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './rendez-vous-form-component.component.html',
  styleUrl: './rendez-vous-form-component.component.css'
})
export class RendezVousFormComponentComponent implements OnInit {
  // dateHeureLocal est au format attendu par l'input HTML datetime-local : "AAAA-MM-JJTHH:mm"
  // (mais affiché par le navigateur au format français JJ/MM/AAAA HH:mm)
  dateHeureLocal = '';
  description = '';
  clientId: number | undefined = undefined;

  clients: Client[] = [];
  rdvId: number | null = null;
  isEditMode = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private rdvService: RendezVousService,
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
      this.rdvId = Number(idParam);
      this.rdvService.getOne(this.rdvId).subscribe({
        next: (data) => {
          // API renvoie "AAAA-MM-JJ HH:mm:ss" -> on convertit pour l'input datetime-local
          this.dateHeureLocal = data.dateHeure.replace(' ', 'T').slice(0, 16);
          this.description = data.description ?? '';
          this.clientId = data.client.id;
        },
        error: () => {
          this.errorMessage = 'Impossible de charger les données du rendez-vous.';
        }
      });
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    // Input datetime-local -> "AAAA-MM-JJTHH:mm" ; API attend "AAAA-MM-JJ HH:mm:ss"
    const dateHeureApi = this.dateHeureLocal.replace('T', ' ') + ':00';

    const payload: RendezVousCreatePayload = {
      dateHeure: dateHeureApi,
      description: this.description,
      client_id: this.clientId as number
    };

    const request = this.isEditMode && this.rdvId
      ? this.rdvService.update(this.rdvId, payload)
      : this.rdvService.create(payload);

    request.subscribe({
      next: () => {
        this.successMessage = this.isEditMode ? 'Rendez-vous modifié avec succès.' : 'Rendez-vous créé avec succès.';
        setTimeout(() => this.router.navigate(['/rendez-vous']), 1000);
      },
      error: () => {
        this.errorMessage = 'Erreur lors de l\'enregistrement.';
      }
    });
  }
}
