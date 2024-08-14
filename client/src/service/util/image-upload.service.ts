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
   * @param colorCallback - Optional callback function to handle the dominant colors.
   */
  handleImageUpload(
    event: any,
    callback: (result: string) => void,
    crop: boolean = false,
    colorCallback?: (colors: string[]) => void,
  ) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64Str = e.target.result;
        if (base64Str.length > this.maxSizeInBytes) {
          this.resizeImage(base64Str, (resizedBase64) => {
            if (colorCallback) {
              this.extractDominantColors(resizedBase64, (colors) => {
                colorCallback(colors);
              });
            }
            callback(resizedBase64);
          });
        } else if (crop) {
          this.resizeAndCropImage(base64Str, (resizedBase64) => {
            if (colorCallback) {
              this.extractDominantColors(resizedBase64, (colors) => {
                colorCallback(colors);
              });
            }
            callback(resizedBase64);
          });
        } else {
          if (colorCallback) {
            this.extractDominantColors(base64Str, (colors) => {
              colorCallback(colors);
            });
          }
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
  private resizeAndCropImage(base64Str: string, callback: (result: string) => void) {
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
        maxSize,
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

  /**
   * Extracts the dominant colors from an image.
   * @param base64Str - The base64 string representation of the image.
   * @param callback - Callback function to handle the extracted colors.
   */
  private extractDominantColors(base64Str: string, callback: (colors: string[]) => void, numColors: number = 5) {
    const img = new Image();
    img.src = base64Str;
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const colors = this.getDominantColorsFromData(imageData.data, numColors);
        callback(colors);
      }
    };
  }

  /**
   * Processes image data to find the dominant colors.
   * @param data - The image data array.
   * @param numColors - The number of dominant colors to extract.
   * @returns An array of dominant colors in RGB format.
   */
  private getDominantColorsFromData(data: Uint8ClampedArray, numColors: number): string[] {
    const colorMap: { [key: string]: number } = {};
    for (let i = 0; i < data.length; i += 4) {
      const rgb = `${data[i]},${data[i + 1]},${data[i + 2]}`;
      if (colorMap[rgb]) {
        colorMap[rgb]++;
      } else {
        colorMap[rgb] = 1;
      }
    }

    const sortedColors = Object.keys(colorMap).sort((a, b) => colorMap[b] - colorMap[a]);
    return sortedColors.slice(0, numColors).map((color) => `rgb(${color})`);
  }
}
