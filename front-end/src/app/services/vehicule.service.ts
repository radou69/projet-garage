import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface VehiculeClient {
  id: number;
  nom: string;
  prenom: string;
}

export interface Vehicule {
  id?: number;
  marque: string;
  modele: string;
  immatriculation: string;
  carburant: string;
  vin: string;
  annee: number;
  kilometrage: number;
  actif?: boolean;
  client: VehiculeClient;
}

export interface VehiculeCreatePayload {
  marque: string;
  modele: string;
  immatriculation: string;
  carburant?: string;
  vin?: string;
  annee?: number;
  kilometrage?: number;
  client_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class VehiculeService {
  private apiUrl = 'https://127.0.0.1:8000/api/vehicules';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Vehicule[]> {
    return this.http.get<Vehicule[]>(this.apiUrl);
  }

  getOne(id: number): Observable<Vehicule> {
    return this.http.get<Vehicule>(`${this.apiUrl}/${id}`);
  }

  create(vehicule: VehiculeCreatePayload): Observable<Vehicule> {
    return this.http.post<Vehicule>(this.apiUrl, vehicule);
  }

  update(id: number, vehicule: VehiculeCreatePayload): Observable<Vehicule> {
    return this.http.put<Vehicule>(`${this.apiUrl}/${id}`, vehicule);
  }

  archive(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
