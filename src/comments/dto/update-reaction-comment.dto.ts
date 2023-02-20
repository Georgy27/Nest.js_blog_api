import { IsEnum, IsString } from 'class-validator';
import {
  reactionStatusEnum,
  reactionStatusEnumKeys,
} from '../../helpers/reaction';

export class UpdateReactionCommentDto {
  @IsEnum(reactionStatusEnum)
  @IsString()
  likeStatus: reactionStatusEnumKeys;
}
