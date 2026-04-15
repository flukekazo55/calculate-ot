import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export type DayType = 'weekday' | 'weekend' | 'holiday' | 'use';
export type RecordType = 'earn' | 'use';

export interface OtMeta {
  spentHours?: number;
  beforeHours?: number;
  afterHours?: number;
}

export interface OtRecord {
  id: number;
  date: string;
  type: RecordType;
  activity: string;
  dayType: DayType;
  value: number;
  timestamp?: number;
  formatted?: string;
  meta?: OtMeta;
}

export interface OtDataPayload {
  records: OtRecord[];
  lastUpdate: string;
}

export interface SaveResponse {
  message: string;
  savedData?: OtDataPayload;
}

export interface ResetResponse {
  message: string;
  resetData?: OtDataPayload;
}

@Injectable({ providedIn: 'root' })
export class OtDataService {
  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthService,
  ) {}

  loadData(apiBase: string): Observable<OtDataPayload> {
    return this.http.get<OtDataPayload>(this.buildApiUrl(apiBase, 'load'));
  }

  saveData(apiBase: string, payload: OtDataPayload): Observable<SaveResponse> {
    return this.http.post<SaveResponse>(this.buildApiUrl(apiBase, 'save'), payload);
  }

  resetData(apiBase: string): Observable<ResetResponse> {
    return this.http.post<ResetResponse>(this.buildApiUrl(apiBase, 'reset'), {});
  }

  private buildApiUrl(apiBase: string, path: string): string {
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
    const url = !apiBase ? `./${normalizedPath}` : `${apiBase}/${normalizedPath}`;
    const owner = this.auth.currentUser?.username?.trim() || '';
    if (!owner) return url;
    return `${url}?username=${encodeURIComponent(owner)}`;
  }
}
