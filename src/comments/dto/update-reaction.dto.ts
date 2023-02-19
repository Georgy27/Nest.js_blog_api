import { IsEnum, IsString, IsUrl, Length } from 'class-validator';
import {
  reactionStatusEnum,
  reactionStatusEnumKeys,
} from '../../helpers/reaction';

export class UpdateReactionDto {
  @IsEnum(reactionStatusEnum)
  @IsString()
  likeStatus: reactionStatusEnumKeys;
}
