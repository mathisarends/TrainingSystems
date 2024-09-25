import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/services/http-client.service';
import { BasicConfirmationResponse } from '../../../shared/dto/basic-confirmation-response';
import { PermissionDto } from './model/permission-dto';

@Injectable()
export class SettingsService {
  constructor(private httpService: HttpService) {}

  getPermissions(): Observable<PermissionDto> {
    return this.httpService.get<PermissionDto>('/user/permissions');
  }

  updatePermissions(permissionDto: PermissionDto): Observable<BasicConfirmationResponse> {
    return this.httpService.post('/user/permissions', permissionDto);
  }
}
