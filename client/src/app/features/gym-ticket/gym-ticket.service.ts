import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { HttpService } from '../../core/services/http-client.service';
import { GymTicketDto } from './model/gym-ticket-dto';
import { GYM_TICKET_NOT_LOADED_STATE } from './model/gym-ticket-not-loaded-state';

@Injectable()
export class GymTicketService {
  gymTicket = signal(GYM_TICKET_NOT_LOADED_STATE);

  constructor(private httpClient: HttpService) {}

  uploadGymTicket(gymTicketDto: GymTicketDto): Observable<any> {
    return this.httpClient.put('/gym-ticket', gymTicketDto);
  }

  getGymTicket(): Observable<string> {
    return this.httpClient.get<string>('/gym-ticket').pipe(tap((ticket) => this.gymTicket.set(ticket)));
  }
}
