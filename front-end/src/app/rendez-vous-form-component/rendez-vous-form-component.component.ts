import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { RendezVousService, RendezVousCreatePayload } from '../services/rendez-vous.service';
import { ClientService, Client } from '../services/client.service';
import { AuthService } from '../services/auth.service';
import { MenuStateService } from '../services/menu-state.service';

@Component({
  selector: 'app-rendez-vous-form-component',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './rendez-vous-form-component.component.html',
  styleUrl: './rendez-vous-form-component.component.css'
})
export class RendezVousFormComponentComponent implements OnInit {
  // dateOnly ("AAAA-MM-JJ") et heureOnly ("HH:mm") sont les formats attendus par les inputs
  // HTML date/time ; ils sont recombinés en "AAAA-MM-JJ HH:mm:ss" pour l'API dans onSubmit().
  dateOnly = '';
  heureOnly = '';
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
    private authService: AuthService,
    private menuState: MenuStateService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openMenu(): void {
    this.menuState.open();
  }

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
          // API renvoie "AAAA-MM-JJ HH:mm:ss" -> on sépare pour les inputs date et heure
          const [datePart, timePart] = data.dateHeure.replace(' ', 'T').slice(0, 16).split('T');
          this.dateOnly = datePart;
          this.heureOnly = timePart;
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

    // Inputs date + heure ("AAAA-MM-JJ" + "HH:mm") -> API attend "AAAA-MM-JJ HH:mm:ss"
    const dateHeureApi = `${this.dateOnly} ${this.heureOnly}:00`;

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
