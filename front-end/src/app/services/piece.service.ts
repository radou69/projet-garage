import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Piece {
  id: number;
  nom: string;
  prixUnitaire: string;
}

@Injectable({
  providedIn: 'root'
})
export class PieceService {
  private apiUrl = 'https://127.0.0.1:8000/api/pieces';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Piece[]> {
    return this.http.get<Piece[]>(this.apiUrl);
  }
}
