import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DevisClient {
  id: number;
  nom: string;
  prenom: string;
}

export interface Devis {
  id?: number;
  date: string;
  montantHt?: string;
  montantTtc?: string;
  statut?: string;
  actif?: boolean;
  client: DevisClient;
  factureId?: number | null;
}

export interface DevisCreatePayload {
  date: string;
  client_id: number;
}

export interface DevisItem {
  id?: number;
  designation: string;
  quantite: number;
  prixUnitaire: string | number;
  montant?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DevisService {
  private apiUrl = 'https://127.0.0.1:8000/api/devis';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Devis[]> {
    return this.http.get<Devis[]>(this.apiUrl);
  }

  getOne(id: number): Observable<Devis> {
    return this.http.get<Devis>(`${this.apiUrl}/${id}`);
  }

  create(devis: DevisCreatePayload): Observable<Devis> {
    return this.http.post<Devis>(this.apiUrl, devis);
  }

  update(id: number, devis: DevisCreatePayload): Observable<Devis> {
    return this.http.put<Devis>(`${this.apiUrl}/${id}`, devis);
  }

  updateStatut(id: number, statut: string): Observable<Devis> {
    return this.http.put<Devis>(`${this.apiUrl}/${id}`, { statut });
  }

  archive(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  transformerEnFacture(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/transformer-en-facture`, {});
  }

  getItems(devisId: number): Observable<DevisItem[]> {
    return this.http.get<DevisItem[]>(`${this.apiUrl}/${devisId}/items`);
  }

  addItem(devisId: number, item: DevisItem): Observable<DevisItem> {
    return this.http.post<DevisItem>(`${this.apiUrl}/${devisId}/items`, item);
  }

  updateItem(devisId: number, ligneId: number, item: DevisItem): Observable<DevisItem> {
    return this.http.put<DevisItem>(`${this.apiUrl}/${devisId}/items/${ligneId}`, item);
  }

  deleteItem(devisId: number, ligneId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${devisId}/items/${ligneId}`);
  }
}
