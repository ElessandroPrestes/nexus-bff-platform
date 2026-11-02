import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { AcordoResponseDto, CreateAcordoDto, IApiResponse } from '@nexus/common';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';

/**
 * AcordosApiService — cliente HTTP tipado do recurso Acordo no BFF.
 * Não conhece componentes; expõe apenas Observables.
 */
@Injectable({ providedIn: 'root' })
export class AcordosApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly endpoint = `${this.baseUrl}/v1/acordos`;

  listar(): Observable<AcordoResponseDto[]> {
    return this.http
      .get<IApiResponse<AcordoResponseDto[]>>(this.endpoint)
      .pipe(map((resposta) => resposta.data ?? []));
  }

  buscarPorId(id: string): Observable<AcordoResponseDto> {
    return this.http
      .get<IApiResponse<AcordoResponseDto>>(`${this.endpoint}/${encodeURIComponent(id)}`)
      .pipe(
        map((resposta) => {
          if (!resposta.data) {
            throw new Error('Resposta da API sem dados do acordo');
          }
          return resposta.data;
        }),
      );
  }

  criar(dto: CreateAcordoDto): Observable<AcordoResponseDto> {
    return this.http.post<IApiResponse<AcordoResponseDto>>(this.endpoint, dto).pipe(
      map((resposta) => {
        if (!resposta.data) {
          throw new Error('Resposta da API sem dados do acordo');
        }
        return resposta.data;
      }),
    );
  }

  remover(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${encodeURIComponent(id)}`);
  }
}
