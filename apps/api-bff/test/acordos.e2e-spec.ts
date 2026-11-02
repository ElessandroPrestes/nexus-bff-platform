/**
 * acordos.e2e-spec.ts — Testes E2E do recurso Acordos no BFF.
 *
 * Sobe o servidor NestJS completo (AppModule) via Supertest.
 * O MongooseModule é substituído por um módulo vazio e IAcordosRepository
 * é sobrescrito por InMemoryAcordosRepository — nenhuma infra externa necessária.
 *
 * Cobertura:
 *  - Autenticação: 401 sem token, 401 com token inválido
 *  - POST   /api/v1/acordos  → 201 com payload válido
 *  - POST   /api/v1/acordos  → 400/422 com payload inválido (ValidationPipe)
 *  - GET    /api/v1/acordos  → 200 lista de acordos
 *  - GET    /api/v1/acordos/:id → 200 acordo existente
 *  - GET    /api/v1/acordos/:id → 404 acordo inexistente
 *  - PATCH  /api/v1/acordos/:id → 200 atualização parcial
 *  - DELETE /api/v1/acordos/:id → 403 sem role 'admin'
 *  - DELETE /api/v1/acordos/:id → 204 com role 'admin'
 */
import { INestApplication, Module, ValidationPipe } from '@nestjs/common';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import helmet from 'helmet';
import request from 'supertest';
import { IAcordosRepository } from '../src/acordos/interfaces/acordos-repository.interface';
import { InMemoryAcordosRepository } from '../src/acordos/repositories/in-memory-acordos.repository';
import { AcordoDocument } from '../src/acordos/schemas/acordo.schema';
import { AppModule } from '../src/app/app.module';

/** Módulo vazio que substitui MongooseModule.forRoot — sem conexão real. */
@Module({})
class MongooseMockModule {}

const TEST_JWT_SECRET = 'test-secret-e2e';

/** Gera um Bearer token JWT assinado com TEST_JWT_SECRET. */
function makeToken(payload: { sub: string; roles: string[] }): string {
  const svc = new JwtService({ secret: TEST_JWT_SECRET });
  return svc.sign(payload, { expiresIn: '1h' });
}

/** Payload de criação válido para Acordos. */
const ACORDO_VALIDO = {
  descricao: 'Parcelamento de dívida comercial para teste E2E',
  valorEmCentavos: 150_000,
  dataVencimento: '2027-12-31',
  status: 'PENDENTE',
  tipoPagamento: 'PIX',
  numeroParcelas: 12,
  devedorId: 'devedor-001',
  credorId: 'credor-001',
};

describe('AcordosController (E2E)', () => {
  let app: INestApplication;
  let tokenUser: string;
  let tokenAdmin: string;

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

    tokenUser = makeToken({ sub: 'user-01', roles: ['user'] });
    tokenAdmin = makeToken({ sub: 'admin-01', roles: ['admin'] });
  });

  afterAll(async () => {
    await app.close();
  });

  // ──────────────────────────────────────────────────────────
  // Autenticação
  // ──────────────────────────────────────────────────────────

  describe('Autenticação', () => {
    it('deve retornar 401 sem token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/acordos')
        .expect(401);
    });

    it('deve retornar 401 com token inválido', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/acordos')
        .set('Authorization', 'Bearer token-invalido')
        .expect(401);
    });
  });

  // ──────────────────────────────────────────────────────────
  // POST /api/v1/acordos
  // ──────────────────────────────────────────────────────────

  describe('POST /api/v1/acordos', () => {
    it('deve criar um acordo com payload válido e retornar 201', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/acordos')
        .set('Authorization', `Bearer ${tokenUser}`)
        .send(ACORDO_VALIDO)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        descricao: ACORDO_VALIDO.descricao,
        status: ACORDO_VALIDO.status,
        tipoPagamento: ACORDO_VALIDO.tipoPagamento,
      });
      expect(res.body.data.id).toBeDefined();
    });

    it('deve retornar 400 com payload inválido (descricao curta)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/acordos')
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({ ...ACORDO_VALIDO, descricao: 'abc' })
        .expect(400);
    });

    it('deve retornar 400 com campo extra proibido (forbidNonWhitelisted)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/acordos')
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({ ...ACORDO_VALIDO, campoNaoPermitido: 'valor' })
        .expect(400);
    });

    it('deve retornar 400 com valor inválido (valorEmCentavos negativo)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/acordos')
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({ ...ACORDO_VALIDO, valorEmCentavos: -100 })
        .expect(400);
    });

    it('deve retornar 400 com status inválido (enum)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/acordos')
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({ ...ACORDO_VALIDO, status: 'STATUS_INEXISTENTE' })
        .expect(400);
    });
  });

  // ──────────────────────────────────────────────────────────
  // GET /api/v1/acordos
  // ──────────────────────────────────────────────────────────

  describe('GET /api/v1/acordos', () => {
    it('deve retornar 200 com uma lista de acordos', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/acordos')
        .set('Authorization', `Bearer ${tokenUser}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────────
  // GET /api/v1/acordos/:id
  // ──────────────────────────────────────────────────────────

  describe('GET /api/v1/acordos/:id', () => {
    let acordoId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/acordos')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(ACORDO_VALIDO);
      acordoId = res.body.data.id as string;
    });

    it('deve retornar 200 para um acordo existente', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/acordos/${acordoId}`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(acordoId);
    });

    it('deve retornar 404 para um acordo inexistente', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/acordos/id-que-nao-existe')
        .set('Authorization', `Bearer ${tokenUser}`)
        .expect(404);
    });
  });

  // ──────────────────────────────────────────────────────────
  // PATCH /api/v1/acordos/:id
  // ──────────────────────────────────────────────────────────

  describe('PATCH /api/v1/acordos/:id', () => {
    let acordoId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/acordos')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(ACORDO_VALIDO);
      acordoId = res.body.data.id as string;
    });

    it('deve retornar 200 ao atualizar parcialmente um acordo', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/acordos/${acordoId}`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({ status: 'ATIVO' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ATIVO');
    });

    it('deve retornar 404 ao atualizar acordo inexistente', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/acordos/id-inexistente')
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({ status: 'ATIVO' })
        .expect(404);
    });
  });

  // ──────────────────────────────────────────────────────────
  // DELETE /api/v1/acordos/:id
  // ──────────────────────────────────────────────────────────

  describe('DELETE /api/v1/acordos/:id', () => {
    let acordoId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/acordos')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(ACORDO_VALIDO);
      acordoId = res.body.data.id as string;
    });

    it('deve retornar 403 ao tentar excluir sem role admin', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/acordos/${acordoId}`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .expect(403);
    });

    it('deve retornar 204 ao excluir com role admin', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/acordos/${acordoId}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(204);
    });

    it('deve retornar 404 ao excluir um acordo já removido', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/acordos/${acordoId}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(404);
    });
  });
});
