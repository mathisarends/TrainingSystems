import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsIsoDateString(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isISO8601String',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }
          const iso8601Regex =
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;
          return iso8601Regex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid ISO 8601 string (e.g., YYYY-MM-DDTHH:mm:ss.sssZ).`;
        },
      },
    });
  };
}
