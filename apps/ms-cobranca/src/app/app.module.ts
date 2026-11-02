import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CobrancaModule } from '../cobranca/cobranca.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/nexus';

@Module({
  imports: [
    MongooseModule.forRoot(MONGODB_URI, {
      serverSelectionTimeoutMS: Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS ?? 5000),
    }),
    CobrancaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
