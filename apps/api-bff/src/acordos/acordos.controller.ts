import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AcordoResponseDto, CreateAcordoDto, IApiResponse, UpdateAcordoDto } from '@nexus/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { AcordosService } from './acordos.service';

/**
 * AcordosController — roteamento HTTP de Acordos (SRP: só roteia e formata resposta).
 *
 * Todas as rotas são protegidas por JwtAuthGuard (global).
 * Remoção restrita ao papel 'admin' via @Roles.
 * Prefixo global da API: /api — definido em main.ts.
 */
@Controller('v1/acordos')
export class AcordosController {
  constructor(private readonly acordosService: AcordosService) {}

  private ok<T>(data: T, message = 'OK'): IApiResponse<T> {
    return { success: true, data, message, timestamp: new Date().toISOString() };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateAcordoDto): Promise<IApiResponse<AcordoResponseDto>> {
    const acordo = await this.acordosService.create(dto);
    return this.ok(acordo, 'Acordo criado com sucesso');
  }

  @Get()
  async findAll(): Promise<IApiResponse<AcordoResponseDto[]>> {
    const acordos = await this.acordosService.findAll();
    return this.ok(acordos);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IApiResponse<AcordoResponseDto>> {
    const acordo = await this.acordosService.findOne(id);
    return this.ok(acordo);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAcordoDto,
  ): Promise<IApiResponse<AcordoResponseDto>> {
    const acordo = await this.acordosService.update(id, dto);
    return this.ok(acordo, 'Acordo atualizado com sucesso');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin')
  async remove(@Param('id') id: string): Promise<void> {
    await this.acordosService.remove(id);
  }
}
