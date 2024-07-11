import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ModalEventsService } from '../../service/modal-events.service';

@Component({
  selector: 'app-create-training-form',
  standalone: true,
  imports: [],
  templateUrl: './create-training-form.component.html',
  styleUrl: './create-training-form.component.scss',
})
export class CreateTrainingFormComponent implements OnInit {
  private subscription: Subscription = new Subscription();

  constructor(private modalEventsService: ModalEventsService) {}

  ngOnInit() {
    this.subscription.add(
      this.modalEventsService.confirmClick$.subscribe(() =>
        //TODO: submit form here using http Client and newly created backend route
        console.log('got event')
      )
    );
  }

  handleImageUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const coverImage = document.getElementById(
          'cover-image'
        ) as HTMLImageElement;
        coverImage.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
}
