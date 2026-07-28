import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-inscription-component',
  imports: [FormsModule, RouterLink],
  templateUrl: './inscription-component.component.html',
  styleUrl: './inscription-component.component.css'
})
export class InscriptionComponentComponent {
  nomGarage = '';
  adresseGarage = '';
  nom = '';
  email = '';
  motDePasse = '';
  confirmationMotDePasse = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.errorMessage = '';

    if (this.motDePasse !== this.confirmationMotDePasse) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.authService.register({
      nom: this.nom,
      email: this.email,
      mot_de_passe: this.motDePasse,
      nom_garage: this.nomGarage,
      adresse_garage: this.adresseGarage
    }).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message ?? 'Une erreur est survenue.';
      }
    });
  }
}
