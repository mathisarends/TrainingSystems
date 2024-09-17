import { Injectable } from '@angular/core';
import { HttpService } from '../../../service/http/http-client.service';
import { Observable } from 'rxjs';

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
