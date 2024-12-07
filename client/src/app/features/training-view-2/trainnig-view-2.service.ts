import { Injectable } from '@angular/core';
import { HttpService } from '../../core/services/http-client.service';

// TODO: hier die Requests zum speichern der einzelnen Übungen abschicken
@Injectable()
export class TrainingView2Service {
  constructor(private httpService: HttpService) {}
}
