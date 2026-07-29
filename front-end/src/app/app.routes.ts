import { Routes } from '@angular/router';
import { LoginComponentComponent } from './login-component/login-component.component';
import { DashboardComponentComponent } from './dashboard-component/dashboard-component.component';
import { ClientListComponentComponent } from './client-list-component/client-list-component.component';
import { ClientFormComponentComponent } from './client-form-component/client-form-component.component';
import { VehiculeListComponentComponent } from './vehicule-list-component/vehicule-list-component.component';
import { VehiculeFormComponentComponent } from './vehicule-form-component/vehicule-form-component.component';
import { RendezVousListComponentComponent } from './rendez-vous-list-component/rendez-vous-list-component.component';
import { RendezVousFormComponentComponent } from './rendez-vous-form-component/rendez-vous-form-component.component';
import { DevisListComponentComponent } from './devis-list-component/devis-list-component.component';
import { DevisFormComponentComponent } from './devis-form-component/devis-form-component.component';
import { DevisDetailComponentComponent } from './devis-detail-component/devis-detail-component.component';
import { FactureListComponentComponent } from './facture-list-component/facture-list-component.component';
import { FactureDetailComponentComponent } from './facture-detail-component/facture-detail-component.component';
import { VehiculeOccasionListComponentComponent } from './vehicule-occasion-list-component/vehicule-occasion-list-component.component';
import { VehiculeOccasionFormComponentComponent } from './vehicule-occasion-form-component/vehicule-occasion-form-component.component';
import { UtilisateurListComponentComponent } from './utilisateur-list-component/utilisateur-list-component.component';
import { UtilisateurFormComponentComponent } from './utilisateur-form-component/utilisateur-form-component.component';
import { ReparationListComponentComponent } from './reparation-list-component/reparation-list-component.component';
import { ReparationFormComponentComponent } from './reparation-form-component/reparation-form-component.component';
import { ReparationDetailComponentComponent } from './reparation-detail-component/reparation-detail-component.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponentComponent },
  { path: 'dashboard', component: DashboardComponentComponent, canActivate: [authGuard] },
  { path: 'clients', component: ClientListComponentComponent, canActivate: [authGuard] },
  { path: 'clients/nouveau', component: ClientFormComponentComponent, canActivate: [authGuard] },
  { path: 'clients/modifier/:id', component: ClientFormComponentComponent, canActivate: [authGuard] },
  { path: 'vehicules', component: VehiculeListComponentComponent, canActivate: [authGuard] },
  { path: 'vehicules/nouveau', component: VehiculeFormComponentComponent, canActivate: [authGuard] },
  { path: 'vehicules/modifier/:id', component: VehiculeFormComponentComponent, canActivate: [authGuard] },
  { path: 'rendez-vous', component: RendezVousListComponentComponent, canActivate: [authGuard] },
  { path: 'rendez-vous/nouveau', component: RendezVousFormComponentComponent, canActivate: [authGuard] },
  { path: 'rendez-vous/modifier/:id', component: RendezVousFormComponentComponent, canActivate: [authGuard] },
  { path: 'devis', component: DevisListComponentComponent, canActivate: [authGuard] },
  { path: 'devis/nouveau', component: DevisFormComponentComponent, canActivate: [authGuard] },
  { path: 'devis/:id', component: DevisDetailComponentComponent, canActivate: [authGuard] },
  { path: 'factures', component: FactureListComponentComponent, canActivate: [authGuard] },
  { path: 'factures/:id', component: FactureDetailComponentComponent, canActivate: [authGuard] },
  { path: 'vehicules-occasion', component: VehiculeOccasionListComponentComponent, canActivate: [authGuard] },
  { path: 'vehicules-occasion/nouveau', component: VehiculeOccasionFormComponentComponent, canActivate: [authGuard] },
  { path: 'vehicules-occasion/modifier/:id', component: VehiculeOccasionFormComponentComponent, canActivate: [authGuard] },
  { path: 'employes', component: UtilisateurListComponentComponent, canActivate: [authGuard] },
  { path: 'employes/nouveau', component: UtilisateurFormComponentComponent, canActivate: [authGuard] },
  { path: 'reparations', component: ReparationListComponentComponent, canActivate: [authGuard] },
  { path: 'reparations/nouveau', component: ReparationFormComponentComponent, canActivate: [authGuard] },
  { path: 'reparations/:id', component: ReparationDetailComponentComponent, canActivate: [authGuard] }
];
