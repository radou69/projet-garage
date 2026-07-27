import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReparationVehicule {
  id: number;
  marque: string;
  modele: string;
  immatriculation: string;
}

export interface Reparation {
  id?: number;
  date: string;
  description: string | null;
  statut?: string;
  coutTotal?: string;
  actif?: boolean;
  vehicule: ReparationVehicule;
}

export interface ReparationCreatePayload {
  date: string;
  description?: string;
  vehicule_id: number;
}

export interface ReparationPieceLigne {
  id?: number;
  quantite: number;
  piece?: {
    id: number;
    nom: string;
    prixUnitaire: string;
  };
  sousTotal?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReparationService {
  private apiUrl = 'https://127.0.0.1:8000/api/reparations';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Reparation[]> {
    return this.http.get<Reparation[]>(this.apiUrl);
  }

  getOne(id: number): Observable<Reparation> {
    return this.http.get<Reparation>(`${this.apiUrl}/${id}`);
  }

  create(reparation: ReparationCreatePayload): Observable<Reparation> {
    return this.http.post<Reparation>(this.apiUrl, reparation);
  }

  update(id: number, reparation: ReparationCreatePayload): Observable<Reparation> {
    return this.http.put<Reparation>(`${this.apiUrl}/${id}`, reparation);
  }

  cancel(id: number): Observable<Reparation> {
    return this.http.patch<Reparation>(`${this.apiUrl}/${id}/cancel`, {});
  }

  archive(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getPieces(reparationId: number): Observable<ReparationPieceLigne[]> {
    return this.http.get<ReparationPieceLigne[]>(`${this.apiUrl}/${reparationId}/pieces`);
  }

  addPiece(reparationId: number, pieceId: number, quantite: number): Observable<ReparationPieceLigne> {
    return this.http.post<ReparationPieceLigne>(`${this.apiUrl}/${reparationId}/pieces`, { piece_id: pieceId, quantite });
  }

  updatePiece(reparationId: number, ligneId: number, quantite: number): Observable<ReparationPieceLigne> {
    return this.http.put<ReparationPieceLigne>(`${this.apiUrl}/${reparationId}/pieces/${ligneId}`, { quantite });
  }

  deletePiece(reparationId: number, ligneId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${reparationId}/pieces/${ligneId}`);
  }
}
