import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FlowerService {
  private apiUrl = 'https://self.pythonanywhere.com/api';

  constructor(private http: HttpClient) {}

  // Get flowers
  getFlowers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/flowers`);
  }

  // Add new flower
  addFlower(flowerData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/add_flower`, flowerData);
  }
}
