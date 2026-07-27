import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FactureClient {
  id: number;
  nom: string;
  prenom: string;
}

export interface Facture {
  id?: number;
  date: string;
  montantTtc: string;
  montantAcompte: string;
  dateAcompte: string | null;
  statut: string;
  actif?: boolean;
  client: FactureClient;
  devisId?: number | null;
}

export interface FactureItem {
  id?: number;
  designation: string;
  quantite: number;
  prixUnitaire: string | number;
  montant?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FactureService {
  private apiUrl = 'https://127.0.0.1:8000/api/factures';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Facture[]> {
    return this.http.get<Facture[]>(this.apiUrl);
  }

  getOne(id: number): Observable<Facture> {
    return this.http.get<Facture>(`${this.apiUrl}/${id}`);
  }

  getItems(id: number): Observable<FactureItem[]> {
    return this.http.get<FactureItem[]>(`${this.apiUrl}/${id}/items`);
  }

  payerAcompte(id: number, montantAcompte: number): Observable<Facture> {
    return this.http.patch<Facture>(`${this.apiUrl}/${id}/acompte`, { montantAcompte });
  }

  annuler(id: number): Observable<Facture> {
    return this.http.patch<Facture>(`${this.apiUrl}/${id}/annuler`, {});
  }

  archive(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
