import { Injectable } from '@angular/core';
import { PermissionDto } from '@shared/settings/permission.dto';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/services/http-client.service';
import { BasicConfirmationResponse } from '../../../shared/dto/basic-confirmation-response';

/**
 * Service to manage user settings related to permissions, such as email notifications.
 * This service communicates with the backend to fetch and update user permissions.
 */
@Injectable()
export class SettingsService {
  constructor(private httpService: HttpService) {}

  /**
   * Fetches the current user's permissions from the backend.
   */
  getPermissions(): Observable<PermissionDto> {
    return this.httpService.get<PermissionDto>('/user/permissions');
  }

  /**
   * Updates the user's permissions by sending the provided permission data to the backend.
   */
  updatePermissions(permissionDto: PermissionDto): Observable<BasicConfirmationResponse> {
    return this.httpService.post('/user/permissions', permissionDto);
  }
}
