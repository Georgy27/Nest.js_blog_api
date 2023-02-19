import { IsString, Length } from 'class-validator';

export class CreateCommentForPostDto {
  @Length(20, 300)
  @IsString()
  content: string;
}
