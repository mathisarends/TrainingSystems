import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../core/services/http-client.service';

@Injectable({ providedIn: 'root' })
export class GymTicketService {
  constructor(private httpClient: HttpService) {}

  uploadGymTicket(ticket: string): Observable<any> {
    return this.httpClient.put('/user/gym-ticket', { gymTicket: ticket });
  }

  getGymTicket(): Observable<string> {
    return this.httpClient.get('/user/gym-ticket');
  }
}
