import { Injectable } from '@angular/core';

@Injectable()
export class ImageDownloadService {
  downloadImage(imageData: string, fileName: string = 'image.png'): void {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = fileName;
    link.click();
  }
}