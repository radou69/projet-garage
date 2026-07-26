import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface VoClient {
  id: number;
  nom: string;
  prenom: string;
}

export interface VehiculeOccasion {
  id?: number;
  marque: string;
  modele: string;
  annee: number | null;
  kilometrage: number | null;
  prix: string;
  statut?: string;
  client: VoClient | null;
}

export interface VehiculeOccasionCreatePayload {
  marque: string;
  modele: string;
  annee?: number;
  kilometrage?: number;
  prix: number;
}

@Injectable({
  providedIn: 'root'
})
export class VehiculeOccasionService {
  private apiUrl = 'https://127.0.0.1:8000/api/vehicule-occasions';

  constructor(private http: HttpClient) {}

  getAll(): Observable<VehiculeOccasion[]> {
    return this.http.get<VehiculeOccasion[]>(this.apiUrl);
  }

  getOne(id: number): Observable<VehiculeOccasion> {
    return this.http.get<VehiculeOccasion>(`${this.apiUrl}/${id}`);
  }

  create(vo: VehiculeOccasionCreatePayload): Observable<VehiculeOccasion> {
    return this.http.post<VehiculeOccasion>(this.apiUrl, vo);
  }

  update(id: number, vo: VehiculeOccasionCreatePayload): Observable<VehiculeOccasion> {
    return this.http.put<VehiculeOccasion>(`${this.apiUrl}/${id}`, vo);
  }

  vendre(id: number, clientId: number): Observable<VehiculeOccasion> {
    return this.http.patch<VehiculeOccasion>(`${this.apiUrl}/${id}/vendre`, { client_id: clientId });
  }
}
