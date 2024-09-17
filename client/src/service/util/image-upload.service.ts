import { Injectable } from '@angular/core';
import { ToastService } from '../../app/components/toast/toast.service';

/**
 * Service to handle image uploads, resizing, and cropping.
 */
@Injectable({
  providedIn: 'root',
})
export class ImageUploadService {
  private maxSizeInBytes = 1_000_000;
  private allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  constructor(private toastService: ToastService) {}

  /**
   * Handles the image upload process, including optional resizing and cropping.
   * @param event - The file input change event.
   * @param crop - Flag indicating whether to crop the image to a square.
   * @returns A Promise that resolves to the processed Base64 string or null if the process failed.
   */
  async handleImageUpload(event: Event, crop: boolean = false): Promise<string | null> {
    const file = this.getFileFromEvent(event);
    if (!file) return null;

    if (!this.isValidImageType(file.type)) {
      this.toastService.error('Unerlaubtes Datenformat');
      console.error('Invalid file type. Please upload a valid image file.');
      return null;
    }

    try {
      const base64Str = await this.readFile(file);
      if (base64Str.length > this.maxSizeInBytes) {
        return await this.resizeImage(base64Str);
      }

      if (crop) {
        return await this.resizeAndCropImage(base64Str);
      }

      return base64Str;
    } catch (error) {
      console.error('Error processing image:', error);
      return null;
    }
  }

  /**
   * Extracts the file from the file input event.
   * @param event - The file input change event.
   * @returns The selected file or null if none is selected.
   */
  private getFileFromEvent(event: Event): File | null {
    const input = event.target as HTMLInputElement;
    return input?.files?.[0] || null;
  }

  /**
   * Checks if the file type is a valid image type.
   * @param fileType - The MIME type of the file.
   * @returns True if the file type is valid, false otherwise.
   */
  private isValidImageType(fileType: string): boolean {
    return this.allowedMimeTypes.includes(fileType);
  }

  /**
   * Reads a file and converts it to a Base64 string.
   * @param file - The file to read.
   * @returns A Promise that resolves to the Base64 string.
   */
  private readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Resizes and crops an image to a square based on the smallest dimension.
   * @param base64Str - The base64 string representation of the image.
   * @returns A Promise that resolves to the processed Base64 string.
   */
  private resizeAndCropImage(base64Str: string): Promise<string> {
    return new Promise((resolve) => {
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
        resolve(canvas.toDataURL());
      };
    });
  }

  /**
   * Resizes an image to fit within a maximum width and height, maintaining aspect ratio.
   * @param base64Str - The base64 string representation of the image.
   * @returns A Promise that resolves to the processed Base64 string.
   */
  private resizeImage(base64Str: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        const maxWidth = 800;
        const maxHeight = 800;

        const { width, height } = this.calculateAspectRatioFit(img.width, img.height, maxWidth, maxHeight);

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL());
      };
    });
  }

  /**
   * Calculates the new dimensions for an image while maintaining the aspect ratio.
   * @param srcWidth - The original width of the image.
   * @param srcHeight - The original height of the image.
   * @param maxWidth - The maximum allowed width.
   * @param maxHeight - The maximum allowed height.
   * @returns An object containing the new width and height.
   */
  private calculateAspectRatioFit(srcWidth: number, srcHeight: number, maxWidth: number, maxHeight: number) {
    const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    return { width: Math.round(srcWidth * ratio), height: Math.round(srcHeight * ratio) };
  }
}
