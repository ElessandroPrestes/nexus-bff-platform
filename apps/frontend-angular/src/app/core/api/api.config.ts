import { InjectionToken } from '@angular/core';

/** Base URL da API do BFF consumida pelo frontend. */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => '/api',
});
