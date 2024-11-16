import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'validationClass',
  standalone: true,
})
export class DeleteValidationPipe implements PipeTransform {
  transform(userInput: string, expectedKeyword: string): string {
    if (!userInput) {
      return '';
    }
    return userInput === expectedKeyword ? 'valid-input' : 'invalid-input';
  }
}
