import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { COBRANCA_ACORDO_QUEUE } from '@nexus/common';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const queue = process.env.RABBITMQ_QUEUE ?? COBRANCA_ACORDO_QUEUE;
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL ?? 'amqp://nexus:nexus@localhost:5672'],
      queue,
      queueOptions: {
        durable: true,
        deadLetterExchange: '',
        deadLetterRoutingKey: `${queue}.dlq`,
      },
      noAck: false,
      prefetchCount: Number(process.env.RABBITMQ_PREFETCH ?? 10),
      socketOptions: { heartbeatIntervalInSeconds: 30 },
    },
  });

  await app.startAllMicroservices();

  const port = Number(process.env.MS_COBRANCA_PORT ?? process.env.PORT ?? 3201);
  await app.listen(port);

  // Set when Nx waits for this server to be ready
  if (process.env.NX_READY_SIGNAL_SOCKET) {
    try {
      // Function keeps TypeScript and bundlers from rewriting or bundling the import
      const load = new Function('s', 'return import(s)') as (
        s: string,
      ) => Promise<{ emitReadySignal(server: unknown): boolean }>;
      (await load('@nx/js/ready-signal')).emitReadySignal(app.getHttpServer());
    } catch {
      // @nx/js isn't installed
    }
  }

  Logger.log(
    `🚀 Worker ms-cobranca ouvindo a fila '${queue}' — health em http://localhost:${port}/api`,
  );
}

bootstrap();
