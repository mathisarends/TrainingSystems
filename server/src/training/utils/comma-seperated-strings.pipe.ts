import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class CommaSeparatedStringsPipe
  implements PipeTransform<string, string[]>
{
  transform(value: string): string[] {
    if (!value) {
      throw new BadRequestException(
        'No value for CommaSeparatedStringsPipe was given',
      );
    }

    const values = value.split(',').map((plan) => plan.trim());

    if (values.length === 0) {
      throw new BadRequestException('Plans parameter cannot be empty');
    }

    return values;
  }
}
