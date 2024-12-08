import { Injectable } from '@angular/core';
import { HttpService } from '../../../core/services/http-client.service';

@Injectable({
  providedIn: 'root',
})
export class TrainingViewTableRowService {
  constructor(private httpService: HttpService) {}
}
