import { Component, OnInit } from '@angular/core';
import { BaisAuthComponent } from '../basic-auth.component';
import { Router } from '@angular/router';
import { HttpClientService } from '../../../../service/http/http-client.service';
import { DOCUMENT } from '@angular/common';
import { Inject } from '@angular/core';
import { ToastService } from '../../../components/toast/toast.service';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpMethods } from '../../../types/httpMethods';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [],
  templateUrl: './register.component.html',
  styleUrls: ['../auth-shared.scss'],
})
export class RegisterComponent extends BaisAuthComponent implements OnInit {
  constructor(
    router: Router,
    httpClient: HttpClientService,
    toastService: ToastService,
    @Inject(DOCUMENT) document: Document
  ) {
    super(router, httpClient, toastService, document);
  }

  ngOnInit(): Promise<void> {
    return this.loadGoogleClientScript();
  }

  async onSubmit(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const data = {
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    };
    this.httpClient
      .request<any>(HttpMethods.POST, 'user/register', data)
      .subscribe({
        next: (response: Response) => {
          console.log('Account erfolgreich erstellt');
          this.router.navigate(['login']);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Registration error:', error);
          if (error.status === 409) {
            console.log('User already exists');
          } else if (error.status === 400) {
            console.log('Bad request:', error.error);
          } else {
            console.log('An unknown error occurred');
          }
        },
      });
  }
}
