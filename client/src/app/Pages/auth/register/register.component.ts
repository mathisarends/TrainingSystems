import { Component, OnInit } from '@angular/core';
import { BaisAuthComponent } from '../basic-auth.component';
import { Router } from '@angular/router';
import { HttpService } from '../../../../service/http/http-client.service';
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
    httpClient: HttpService,
    toastService: ToastService,
    @Inject(DOCUMENT) document: Document,
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
      username: formData.get('username') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    };
    this.httpClient.post<any>('/user/register', data).subscribe({
      next: () => {
        this.toastService.show('Erfolg', 'Account erfolgreich erstellt');
        this.router.navigate(['login']);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Registration error:', error);
        if (error.status === 409) {
          this.toastService.show('Fehler', 'Es gibt bereits einen Nutzer mit dieser Email');
        } else if (error.status === 400) {
          console.log('Fehler', 'Bad request');
        } else {
          console.log('An unknown error occurred');
        }
      },
    });
  }
}
