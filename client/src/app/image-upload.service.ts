import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ImageUploadService {
  constructor() {}

  handleImageUpload(
    event: any,
    callback: (result: string) => void,
    crop: boolean = false
  ) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (crop) {
          this.resizeAndCropImage(e.target.result, callback);
        } else {
          callback(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  private resizeAndCropImage(
    base64Str: string,
    callback: (result: string) => void
  ) {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxSize = Math.min(img.width, img.height);
      canvas.width = maxSize;
      canvas.height = maxSize;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(
        img,
        (img.width - maxSize) / 2,
        (img.height - maxSize) / 2,
        maxSize,
        maxSize,
        0,
        0,
        maxSize,
        maxSize
      );
      callback(canvas.toDataURL());
    };
  }
}
