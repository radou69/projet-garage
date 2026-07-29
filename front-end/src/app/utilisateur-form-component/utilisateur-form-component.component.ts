import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UtilisateurService } from '../services/utilisateur.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-utilisateur-form-component',
  imports: [FormsModule, RouterLink],
  templateUrl: './utilisateur-form-component.component.html',
  styleUrl: './utilisateur-form-component.component.css'
})
export class UtilisateurFormComponentComponent implements OnInit {
  nom = '';
  email = '';
  motDePasse = '';
  errorMessage = '';
  successMessage = '';

  constructor(
    private utilisateurService: UtilisateurService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Défense côté UI en plus de la protection déjà assurée par l'API (403 sinon)
    if (!this.authService.isPatron()) {
      this.router.navigate(['/employes']);
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.utilisateurService.creerEmploye({
      nom: this.nom,
      email: this.email,
      mot_de_passe: this.motDePasse
    }).subscribe({
      next: () => {
        this.successMessage = 'Compte employé créé avec succès.';
        setTimeout(() => this.router.navigate(['/employes']), 1000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la création du compte.';
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
