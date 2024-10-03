import { Injectable } from '@angular/core';
import { HttpService } from '../../core/services/http-client.service';

@Injectable()
export class ServiceNameService {
  constructor(private httpService: HttpService) {}
}
