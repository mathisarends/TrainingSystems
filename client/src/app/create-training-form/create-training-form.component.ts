import { Component } from '@angular/core';

@Component({
  selector: 'app-create-training-form',
  standalone: true,
  imports: [],
  templateUrl: './create-training-form.component.html',
  styleUrl: './create-training-form.component.scss',
})
export class CreateTrainingFormComponent {
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
