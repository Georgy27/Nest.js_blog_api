import { IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { checkSortBy, toNumber } from '../helpers';

export class CommentsPaginationQueryDto {
  @IsOptional()
  @Transform(({ value }) => toNumber(value, { min: 1, default: 1 }))
  @IsNumber()
  pageNumber = 1;
  @IsOptional()
  @Transform(({ value }) => toNumber(value, { min: 1, default: 10 }))
  @IsNumber()
  pageSize = 10;
  @IsOptional()
  sortBy = 'createdAt';
  @IsOptional()
  @Transform(({ value }) => checkSortBy(value))
  sortDirection = 'desc';
}
