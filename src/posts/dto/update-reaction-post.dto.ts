import { IsEnum, IsString } from 'class-validator';
import {
  reactionStatusEnum,
  reactionStatusEnumKeys,
} from '../../helpers/reaction';

export class UpdateReactionPostDto {
  @IsEnum(reactionStatusEnum)
  @IsString()
  likeStatus: reactionStatusEnumKeys;
}
