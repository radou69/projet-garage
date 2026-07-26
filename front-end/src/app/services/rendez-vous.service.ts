import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RdvClient {
  id: number;
  nom: string;
  prenom: string;
}

export interface RendezVous {
  id?: number;
  dateHeure: string;
  description: string | null;
  statut?: string;
  client: RdvClient;
}

export interface RendezVousCreatePayload {
  dateHeure: string;
  description?: string;
  client_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class RendezVousService {
  private apiUrl = 'https://127.0.0.1:8000/api/rendez-vous';

  constructor(private http: HttpClient) {}

  getAll(): Observable<RendezVous[]> {
    return this.http.get<RendezVous[]>(this.apiUrl);
  }

  getOne(id: number): Observable<RendezVous> {
    return this.http.get<RendezVous>(`${this.apiUrl}/${id}`);
  }

  create(rdv: RendezVousCreatePayload): Observable<RendezVous> {
    return this.http.post<RendezVous>(this.apiUrl, rdv);
  }

  update(id: number, rdv: RendezVousCreatePayload): Observable<RendezVous> {
    return this.http.put<RendezVous>(`${this.apiUrl}/${id}`, rdv);
  }

  cancel(id: number): Observable<RendezVous> {
    return this.http.patch<RendezVous>(`${this.apiUrl}/${id}/cancel`, {});
  }
}
