import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../core/services/http-client.service';
import { GymTicketDto } from './model/gym-ticket-dto';

@Injectable()
export class GymTicketService {
  constructor(private httpClient: HttpService) {}

  uploadGymTicket(gymTicketDto: GymTicketDto): Observable<any> {
    return this.httpClient.put('/gym-ticket', gymTicketDto);
  }

  getGymTicket(): Observable<string> {
    return this.httpClient.get('/gym-ticket');
  }
}
