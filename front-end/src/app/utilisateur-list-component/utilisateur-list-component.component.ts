import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UtilisateurService, Utilisateur } from '../services/utilisateur.service';
import { AuthService } from '../services/auth.service';
import { MenuStateService } from '../services/menu-state.service';

@Component({
  selector: 'app-utilisateur-list-component',
  imports: [CommonModule, RouterLink],
  templateUrl: './utilisateur-list-component.component.html',
  styleUrl: './utilisateur-list-component.component.css'
})
export class UtilisateurListComponentComponent implements OnInit {
  utilisateurs: Utilisateur[] = [];
  errorMessage = '';

  constructor(
    private utilisateurService: UtilisateurService,
    public authService: AuthService,
    private router: Router,
    public menuState: MenuStateService
  ) {}

  ngOnInit(): void {
    this.loadUtilisateurs();
  }

  loadUtilisateurs(): void {
    this.utilisateurService.getAll().subscribe({
      next: (data) => {
        this.utilisateurs = data;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger la liste des employés.';
      }
    });
  }

  estPatron(utilisateur: Utilisateur): boolean {
    return utilisateur.roles.includes('ROLE_PATRON');
  }

  desactiverUtilisateur(id: number): void {
    const confirmed = confirm('Désactiver ce compte employé ?');
    if (!confirmed) {
      return;
    }
    this.utilisateurService.desactiver(id).subscribe({
      next: () => {
        this.loadUtilisateurs();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Impossible de désactiver ce compte.';
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

  initiales(nom: string): string {
    const parts = nom.trim().split(/\s+/).filter(p => p.length > 0);
    const first = parts[0]?.charAt(0) ?? '';
    const second = parts[1]?.charAt(0) ?? '';
    return (first + second).toUpperCase();
  }
}
