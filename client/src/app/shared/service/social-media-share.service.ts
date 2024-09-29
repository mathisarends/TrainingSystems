import { Injectable } from '@angular/core';

@Injectable()
export class ShareService {
  /**
   * Checks if the Web Share API is supported in the current browser.
   */
  isShareSupported(): boolean {
    return !!navigator.share;
  }

  /**
   * Shares content using the Web Share API. The method allows sharing a title, text, and/or a URL.
   * If the Web Share API is not supported in the current browser, the method will return a rejected Promise.
   */
  async shareContent(options: { title?: string; text?: string; url?: string }): Promise<void> {
    if (!this.isShareSupported()) {
      throw new Error('Web Share API is not supported');
    }

    await navigator.share({
      title: options.title ?? '',
      text: options.text ?? '',
      url: options.url ?? '',
    });
  }

  /**
   * Opens WhatsApp and shares the provided text via a prefilled message.
   * If WhatsApp is not installed or cannot handle the request, it opens WhatsApp Web in the browser.
   *
   * @param text - The message to share via WhatsApp.
   *
   * @example
   * ```typescript
   * shareService.shareViaWhatsApp('Hello! Check out this amazing content.');
   * ```
   */
  shareViaWhatsApp(text: string): void {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  }
}
