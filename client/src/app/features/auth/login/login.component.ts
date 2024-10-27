import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { HttpService } from '../../../core/services/http-client.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { IconComponent } from '../../../shared/icon/icon.component';
import { HeaderService } from '../../header/header.service';
import { BaisAuthComponent } from '../basic-auth.component';
import { LoginDto } from './login-dto';
import { LoginService } from './login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './login.component.html',
  styleUrls: ['../auth-shared.scss'],
  providers: [LoginService],
})
export class LoginComponent extends BaisAuthComponent implements OnInit {
  constructor(
    router: Router,
    httpClient: HttpService,
    toastService: ToastService,
    private headerService: HeaderService,
    private loginService: LoginService,
    @Inject(DOCUMENT) document: Document,
  ) {
    super(router, httpClient, toastService, document);
  }

  ngOnInit(): Promise<void> {
    this.headerService.setHeadlineInfo({
      title: 'Login',
    });

    return this.loadGoogleClientScript();
  }

  async onSubmit(event: Event) {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const loginDto: LoginDto = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    this.loginService
      .loginUser(loginDto)
      .pipe(
        tap(() => {
          this.router.navigate(['/']);
        }),
      )
      .subscribe();
  }
}
