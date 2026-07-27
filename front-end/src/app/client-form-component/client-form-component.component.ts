import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ClientService, Client } from '../services/client.service';

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

  clientId: number | null = null;
  isEditMode = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private clientService: ClientService,
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

    const request = this.isEditMode && this.clientId
      ? this.clientService.update(this.clientId, this.client)
      : this.clientService.create(this.client);

    request.subscribe({
      next: () => {
        this.successMessage = this.isEditMode ? 'Client modifié avec succès.' : 'Client créé avec succès.';
        setTimeout(() => this.router.navigate(['/clients']), 1000);
      },
      error: () => {
        this.errorMessage = 'Erreur lors de l\'enregistrement. Vérifiez les champs.';
      }
    });
  }
}
