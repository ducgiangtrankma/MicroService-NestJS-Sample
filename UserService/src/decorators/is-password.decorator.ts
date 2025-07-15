import { registerDecorator, type ValidationOptions } from 'class-validator';
import { passwordRegex } from 'src/constants/regex';

export function IsPassword(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (object, propertyName) => {
    registerDecorator({
      propertyName: propertyName as string,
      name: 'isPassword',
      target: object.constructor,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: string) {
          return passwordRegex.test(value);
        },
        defaultMessage() {
          return `$property is invalid`;
        },
      },
    });
  };
}
