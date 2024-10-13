import { Injectable } from '@angular/core';

@Injectable()
export class PictureService {
  isBase64Image(imageSrc: string): boolean {
    const base64Pattern = /^data:image\/(png|jpeg|jpg|gif|webp|bmp|ico);base64,/;

    return base64Pattern.test(imageSrc);
  }
}
