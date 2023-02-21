import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { BlogsQueryRepository } from '../../blogs/blogs.query.repository';

export function BlogIsExist(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: BlogIsExistRule,
    });
  };
}

@ValidatorConstraint({ name: 'BlogIsExist', async: false })
@Injectable()
export class BlogIsExistRule implements ValidatorConstraintInterface {
  constructor(private blogsQueryRepository: BlogsQueryRepository) {}

  async validate(value: string) {
    try {
      const blog = await this.blogsQueryRepository.findBlog(value);
      if (!blog) return false;
      return true;
    } catch (e) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return "Blog doesn't exist";
  }
}
