import { Injectable } from '@angular/core';
import { HttpService } from '../../core/services/http-client.service';

/**
 * Service to manage user settings related to permissions, such as email notifications.
 * This service communicates with the backend to fetch and update user permissions.
 */
@Injectable({ providedIn: 'root' })
export class BodyWeightService {
  constructor(private httpService: HttpService) {}
}
