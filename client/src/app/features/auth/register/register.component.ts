import { DOCUMENT } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../../../core/services/http-client.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { IconComponent } from '../../../shared/icon/icon.component';
import { HeaderService } from '../../header/header.service';
import { BaisAuthComponent } from '../basic-auth.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './register.component.html',
  styleUrls: ['../auth-shared.scss'],
})
export class RegisterComponent extends BaisAuthComponent implements OnInit {
  constructor(
    router: Router,
    httpClient: HttpService,
    toastService: ToastService,
    private headerService: HeaderService,
    @Inject(DOCUMENT) document: Document,
  ) {
    super(router, httpClient, toastService, document);
  }

  ngOnInit(): Promise<void> {
    this.headerService.setHeadlineInfo({
      title: 'Register',
    });

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
        this.toastService.success('Account erfolgreich erstellt');
        this.router.navigate(['login']);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Registration error:', error);
        if (error.status === 409) {
          this.toastService.error('Es gibt bereits einen Nutzer mit dieser Email');
        } else if (error.status === 400) {
          console.log('Fehler', 'Bad request');
        } else {
          console.log('An unknown error occurred');
        }
      },
    });
  }
}
