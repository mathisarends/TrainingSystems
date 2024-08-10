import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClientService } from '../../../../service/http/http-client.service';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpMethods } from '../../../types/httpMethods';
import { DOCUMENT } from '@angular/common';
import { ToastService } from '../../../components/toast/toast.service';
import { BaisAuthComponent } from '../basic-auth.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrls: ['../auth-shared.scss'],
})
export class LoginComponent extends BaisAuthComponent implements OnInit {
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
      email: formData.get('email'),
      password: formData.get('password'),
    };

    this.httpClient
      .request<any>(HttpMethods.POST, 'user/login', data)
      .subscribe({
        next: (response: Response) => {
          console.log('Login successful:', response);
          this.router.navigate(['/']);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Login error:', error);
          if (error.status === 401) {
            console.log('Unauthorized: Wrong credentials');
            this.toastService.show(
              'Ungültige Anmeldedaten',
              'Die Kombination aus Nutzername und Passwort ist falsch'
            );
          } else if (error.status === 400) {
            console.log('Bad request:', error.error);
          } else {
            console.log('An unknown error occurred');
          }
        },
      });
  }
}