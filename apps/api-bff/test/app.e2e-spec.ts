/**
 * app.e2e-spec.ts — Testes E2E da rota raiz do BFF.
 *
 * Sobe o servidor NestJS completo (AppModule) via Supertest.
 * O MongooseModule é substituído por um módulo vazio para que os testes
 * não precisem de MongoDB real — isolamento de infra nos E2E.
 *
 * Cobre:
 *  - GET /api    → rota pública, retorna dados da aplicação (200 OK)
 *  - Rota protegida sem token    → 401 Unauthorized
 *  - Rota inexistente             → 404 Not Found
 */
import { INestApplication, Module, ValidationPipe } from '@nestjs/common';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import helmet from 'helmet';
import request from 'supertest';
import { IAcordosRepository } from '../src/acordos/interfaces/acordos-repository.interface';
import { InMemoryAcordosRepository } from '../src/acordos/repositories/in-memory-acordos.repository';
import { AcordoDocument } from '../src/acordos/schemas/acordo.schema';
import { AppModule } from '../src/app/app.module';

/**
 * Módulo vazio que substitui o MongooseModule.forRoot no contexto de teste.
 * Evita tentativa de conexão real ao MongoDB.
 */
@Module({})
class MongooseMockModule {}

/**
 * Segredo JWT usado apenas em testes.
 * Alinhado com a variável de ambiente JWT_SECRET que a JwtStrategy consome.
 */
const TEST_JWT_SECRET = 'test-secret-e2e';

describe('AppController (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env['JWT_SECRET'] = TEST_JWT_SECRET;
    process.env['CORS_ORIGIN'] = 'http://localhost:5216';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // Substitui MongooseModule.forRoot por módulo vazio (sem conexão real)
      .overrideModule(MongooseModule)
      .useModule(MongooseMockModule)
      // Substitui o Model injetado pelo @InjectModel do MongoAcordosRepository
      .overrideProvider(getModelToken(AcordoDocument.name))
      .useValue({})
      // Substitui IAcordosRepository por InMemory (sem MongoDB)
      .overrideProvider(IAcordosRepository)
      .useClass(InMemoryAcordosRepository)
      .compile();

    app = moduleFixture.createNestApplication();

    app.use(helmet());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.setGlobalPrefix('api');

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api', () => {
    it('deve retornar 200 na rota pública raiz', async () => {
      const response = await request(app.getHttpServer())
        .get('/api')
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe('Rota protegida sem token', () => {
    it('deve retornar 401 ao acessar rota protegida sem Authorization', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/acordos')
        .expect(401);
    });
  });

  describe('Rota inexistente', () => {
    it('deve retornar 404 para rota desconhecida', async () => {
      await request(app.getHttpServer())
        .get('/api/rota-que-nao-existe')
        .expect(404);
    });
  });
});
