import { Injectable } from '@angular/core';

/**
 * Service to handle image uploads, resizing, and cropping.
 */
@Injectable({
  providedIn: 'root',
})
export class ImageUploadService {
  private maxSizeInBytes = 1_000_000; // 1 MB in bytes

  constructor() {}

  /**
   * Handles the image upload process, including optional resizing and cropping.
   * @param event - The file input change event.
   * @param callback - Callback function to handle the processed image result.
   * @param crop - Flag indicating whether to crop the image to a square.
   */
  handleImageUpload(
    event: any,
    callback: (result: string) => void,
    crop: boolean = false
  ) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64Str = e.target.result;
        if (base64Str.length > this.maxSizeInBytes) {
          this.resizeImage(base64Str, callback);
        } else if (crop) {
          this.resizeAndCropImage(base64Str, callback);
        } else {
          callback(base64Str);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Resizes and crops an image to a square based on the smallest dimension.
   * @param base64Str - The base64 string representation of the image.
   * @param callback - Callback function to handle the processed image result.
   */
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

  /**
   * Resizes an image to fit within a maximum width and height, maintaining aspect ratio.
   * @param base64Str - The base64 string representation of the image.
   * @param callback - Callback function to handle the processed image result.
   */
  private resizeImage(base64Str: string, callback: (result: string) => void) {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      const maxWidth = 800; // Maximum width for resizing
      const maxHeight = 800; // Maximum height for resizing

      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);
      callback(canvas.toDataURL());
    };
  }
}
