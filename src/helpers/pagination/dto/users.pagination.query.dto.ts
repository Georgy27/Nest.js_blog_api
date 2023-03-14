import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { checkSortBy, toNumber } from '../helpers';

enum IBanStatus {
  all = 'all',
  banned = 'banned',
  notBanned = 'notBanned',
}
export type banStatusEnumKeys = keyof typeof IBanStatus;

export class UsersPaginationQueryDto {
  @IsOptional()
  @IsEnum(IBanStatus)
  @IsString()
  banStatus: banStatusEnumKeys = 'all';
  @IsOptional()
  searchLoginTerm: string | null = null;
  @IsOptional()
  searchEmailTerm: string | null = null;
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
  sortDirection: 'asc' | 'desc' = 'desc';
}
