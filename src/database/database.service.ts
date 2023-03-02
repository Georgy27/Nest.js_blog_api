import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DatabaseService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  getDbHandle(): Connection {
    return this.connection;
  }
}
