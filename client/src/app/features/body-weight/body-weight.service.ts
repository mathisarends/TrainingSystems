import { Injectable } from '@angular/core';
import { HttpService } from '../../core/services/http-client.service';
import { BodyWeightEntryDto } from './dto/body-weight-entry-dto';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BodyWeightService {
  private readonly baseUrl = ''; // Basis-URL für die API-Endpunkte

  constructor(private httpService: HttpService) {}

  getBodyWeights(): Observable<BodyWeightEntryDto[]> {
    console.log('is called');
    return this.httpService.get<BodyWeightEntryDto[]>('/body-weight');
  }

  addBodyWeight(bodyWeightEntryDto: BodyWeightEntryDto): Observable<void> {
    return this.httpService.post<void>('/body-weight', bodyWeightEntryDto);
  }

  loadBodyWeightConfiguration(): void {}

  saveBodyWeightConfiguration(): void {}
}
