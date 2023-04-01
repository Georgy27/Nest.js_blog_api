import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PostsSqlRepository {
  constructor(private prisma: PrismaService) {}
}
