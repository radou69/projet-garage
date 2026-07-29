import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { RendezVousService, RendezVous } from '../services/rendez-vous.service';
import { AuthService } from '../services/auth.service';
import { MenuStateService } from '../services/menu-state.service';

@Component({
  selector: 'app-rendez-vous-list-component',
  imports: [CommonModule, RouterLink],
  templateUrl: './rendez-vous-list-component.component.html',
  styleUrl: './rendez-vous-list-component.component.css'
})
export class RendezVousListComponentComponent implements OnInit {
  rdvs: RendezVous[] = [];
  errorMessage = '';
  selectedDate = new Date();

  private readonly jourLabels = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];
  private readonly moisLabels = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];
  private readonly jourCompletLabels = [
    'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
  ];

  constructor(
    private rdvService: RendezVousService,
    private authService: AuthService,
    private router: Router,
    private menuState: MenuStateService
  ) {}

  ngOnInit(): void {
    this.loadRdvs();
  }

  loadRdvs(): void {
    this.rdvService.getAll().subscribe({
      next: (data) => {
        this.rdvs = data;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger la liste des rendez-vous.';
      }
    });
  }

  get joursSemaine(): Date[] {
    const jour = this.selectedDate.getDay();
    const lundi = new Date(this.selectedDate);
    const decalage = jour === 0 ? -6 : 1 - jour;
    lundi.setDate(lundi.getDate() + decalage);
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(lundi);
      d.setDate(lundi.getDate() + i);
      return d;
    });
  }

  get rdvsDuJour(): RendezVous[] {
    return this.rdvs
      .filter(r => this.estMemeJour(new Date(r.dateHeure), this.selectedDate))
      .sort((a, b) => new Date(a.dateHeure).getTime() - new Date(b.dateHeure).getTime());
  }

  estMemeJour(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate();
  }

  estJourSelectionne(d: Date): boolean {
    return this.estMemeJour(d, this.selectedDate);
  }

  selectionnerJour(d: Date): void {
    this.selectedDate = d;
  }

  jourPrecedent(): void {
    const d = new Date(this.selectedDate);
    d.setDate(d.getDate() - 1);
    this.selectedDate = d;
  }

  jourSuivant(): void {
    const d = new Date(this.selectedDate);
    d.setDate(d.getDate() + 1);
    this.selectedDate = d;
  }

  labelJourCourt(d: Date): string {
    return this.jourLabels[d.getDay()];
  }

  labelDateComplete(): string {
    const jour = this.jourCompletLabels[this.selectedDate.getDay()];
    const quantieme = this.selectedDate.getDate();
    const mois = this.moisLabels[this.selectedDate.getMonth()];
    const annee = this.selectedDate.getFullYear();
    return `${jour} ${quantieme} ${mois} ${annee}`;
  }

  heure(dateHeure: string): string {
    const d = new Date(dateHeure);
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${h}h${m}`;
  }

  statutLabel(statut?: string): string {
    switch (statut) {
      case 'planifie': return 'Planifié';
      case 'confirme': return 'Confirmé';
      case 'termine': return 'Terminé';
      case 'annule': return 'Annulé';
      default: return statut ?? '';
    }
  }

  cancelRdv(id: number): void {
    const confirmed = confirm('Annuler ce rendez-vous ?');
    if (!confirmed) {
      return;
    }
    this.rdvService.cancel(id).subscribe({
      next: () => {
        this.loadRdvs();
      },
      error: () => {
        this.errorMessage = "Impossible d'annuler ce rendez-vous.";
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
