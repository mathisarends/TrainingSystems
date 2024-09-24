import { Component, input } from '@angular/core';

/**
 * A reusable image upload component that displays a cover image and handles file upload.
 */
@Component({
  selector: 'app-image-upload',
  standalone: true,
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss'],
})
export class ImageUploadComponent {
  placeholderImage = input.required<string>();
}
