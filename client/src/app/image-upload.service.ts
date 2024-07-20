import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ImageUploadService {
  constructor() {}

  handleImageUpload(event: any, callback: (result: string) => void) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const result = e.target.result;
        callback(result);
      };
      reader.readAsDataURL(file);
    }
  }
}
