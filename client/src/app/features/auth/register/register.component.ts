import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../../../core/services/http-client.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { IconComponent } from '../../../shared/icon/icon.component';
import { HeaderService } from '../../header/header.service';
import { BaisAuthComponent } from '../basic-auth.component';
import { PulsatingCircleComponent } from '../components/pulsating-circle.componen';
import { RegisterUserDto } from './register-user-dto';
import { RegisterService } from './register.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [IconComponent, PulsatingCircleComponent],
  templateUrl: './register.component.html',
  styleUrls: ['../auth-shared.scss'],
  providers: [RegisterService],
})
export class RegisterComponent extends BaisAuthComponent implements OnInit {
  @ViewChild('googleLoginButton') googleLoginButton!: ElementRef;

  constructor(
    router: Router,
    httpClient: HttpService,
    toastService: ToastService,
    private headerService: HeaderService,
    private registerService: RegisterService,
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

    const resgisterUserDto: RegisterUserDto = {
      username: formData.get('username') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    };

    this.registerService.registerUser(resgisterUserDto).subscribe((response) => {
      this.toastService.success(response.message);
    });
  }
}
