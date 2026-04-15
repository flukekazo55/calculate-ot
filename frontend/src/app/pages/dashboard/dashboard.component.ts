import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  DayType,
  OtDataPayload,
  OtMeta,
  OtRecord,
  OtDataService,
} from '../../services/ot-data.service';
import { AuthService } from '../../services/auth.service';
import { TranslateService } from '@ngx-translate/core';

declare global {
  interface Window {
    __APP_CONFIG?: { API_BASE?: string };
  }
}

type Lang = 'th' | 'en';
type TimeField = 'startTime' | 'endTime';

interface UiAlert {
  id: number;
  kind: 'success' | 'error';
  title: string;
  message: string;
  icon: string;
  primaryLabel: string;
  secondaryLabel?: string;
}

const localeMap: Record<Lang, string> = { th: 'th-TH', en: 'en-US' };
const API_BASE_STORAGE_KEY = 'otApiBase';
const API_QUERY_PARAM = 'api';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly dataService = inject(OtDataService);
  private readonly translate = inject(TranslateService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private alertSeq = 0;
  private readonly alertTimers = new Map<number, number>();

  currentLang: Lang = 'th';
  records: OtRecord[] = [];
  lastUpdate = '';
  backendAvailable = true;
  apiBase = '';
  alerts: UiAlert[] = [];

  dayType: Extract<DayType, 'weekday' | 'weekend' | 'holiday'> = 'weekday';
  activity = '';
  startTime = '18:00';
  endTime = '20:00';
  useTime = '';
  useNote = '';
  openTimePicker: TimeField | null = null;
  pickerHour = 0;
  pickerMinute = 0;
  readonly pickerHours = Array.from({ length: 24 }, (_, index) => index);
  readonly pickerMinutes = Array.from({ length: 12 }, (_, index) => index * 5);

  ngOnInit(): void {
    this.currentLang = this.initI18n();
    this.apiBase = this.resolveApiBase();
    this.loadData();
  }

  ngOnDestroy(): void {
    for (const timer of this.alertTimers.values()) {
      window.clearTimeout(timer);
    }
    this.alertTimers.clear();
  }

  t(key: string, ...args: any[]): string {
    const params = this.resolveTranslationParams(key, args);
    const fullKey = `app.${key}`;
    const translated = this.translate.instant(fullKey, params);
    if (translated === fullKey) return key;
    return translated;
  }

  onLanguageToggle(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const nextLang: Lang = target?.checked ? 'en' : 'th';
    this.currentLang = nextLang;
    this.translate.use(nextLang);
    this.safeLocalStorageSet('otLang', nextLang);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    if (target.closest('.timepicker-wrap')) return;
    this.openTimePicker = null;
  }

  toggleTimePicker(field: TimeField): void {
    if (this.openTimePicker === field) {
      this.openTimePicker = null;
      return;
    }

    const currentValue = this[field];
    const parts = this.parseTimeParts(currentValue);
    this.pickerHour = parts.hour;
    this.pickerMinute = parts.minute;
    this.openTimePicker = field;
  }

  isTimePickerOpen(field: TimeField): boolean {
    return this.openTimePicker === field;
  }

  pickHour(hour: number): void {
    this.pickerHour = hour;
  }

  pickMinute(minute: number): void {
    this.pickerMinute = minute;
  }

  setPickerNow(): void {
    const now = new Date();
    const hour = now.getHours();
    const minute = this.toNearestPickerMinute(now.getMinutes());
    this.pickerHour = hour;
    this.pickerMinute = minute;

    if (!this.openTimePicker) return;

    const field = this.openTimePicker;
    this[field] = this.formatTimeValue(hour, minute);
    this.syncUseTimeFromRange();
    this.openTimePicker = null;
  }

  confirmTimePicker(): void {
    if (!this.openTimePicker) return;
    const field = this.openTimePicker;
    this[field] = this.formatTimeValue(this.pickerHour, this.pickerMinute);
    this.syncUseTimeFromRange();
    this.openTimePicker = null;
  }

  displayTimeValue(value: string): string {
    return value || this.t('timePlaceholder');
  }

  calc(): void {
    const activity = this.activity.trim() || this.t('defaultActivity');
    const start = this.parseTime(this.startTime);
    const end = this.parseTime(this.endTime);

    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
      this.showError(this.t('calcInvalidRange'));
      return;
    }

    const earnedHours = this.calcWeighted(this.dayType, start, end) / 60;
    this.saveRecord('earn', earnedHours, activity, this.dayType);
    this.showSuccess(this.t('calcSuccess', activity, this.toHM(earnedHours).text), 'check_circle');
  }

  useOT(): void {
    const minutes = this.parseHHMM(this.useTime.trim());
    if (minutes === null) {
      this.showError(this.t('useInvalidFormat'));
      return;
    }

    const hours = minutes / 60;
    const note = this.useNote.trim() || this.t('useDefaultNote');
    const before = this.totalHours;
    const after = before - hours;

    if (after < 0) {
      this.showError(this.t('useOverLimit'));
      return;
    }

    const dateText = new Date().toLocaleDateString(this.getLocale());
    const formatted = this.t('formatUseEntry', {
      note,
      dateText,
      usedText: this.toHM(hours).text,
      beforeText: this.toHM(before).text,
      afterText: this.toHM(after).text,
    });

    const meta: OtMeta = {
      spentHours: hours,
      beforeHours: before,
      afterHours: after,
    };

    this.saveRecord('use', -hours, note, 'use', formatted, meta);
    this.showSuccess(this.t('useAlert', this.toHM(hours).text, this.toHM(after).text), 'schedule_send');
  }

  clearForm(): void {
    this.dayType = 'weekday';
    this.activity = '';
    this.startTime = '18:00';
    this.endTime = '20:00';
    this.useTime = '';
    this.useNote = '';
    this.openTimePicker = null;
    this.showSuccess(this.t('clearFormSuccess'), 'ink_eraser');
  }

  get totalHours(): number {
    return this.records.reduce((sum, item) => sum + Number(item.value || 0), 0);
  }

  get totalText(): string {
    return this.toHM(this.totalHours).text;
  }

  get totalCompactText(): string {
    return this.toCompactHM(this.totalHours);
  }

  get lastUpdateText(): string {
    return this.lastUpdate || this.t('lastUpdateEmpty');
  }

  get sortedRecords(): OtRecord[] {
    return [...this.records].reverse();
  }

  get currentUsername(): string {
    return this.authService.currentUser?.username || '';
  }

  isUseRecord(record: OtRecord): boolean {
    return record.type === 'use' || Number(record.value || 0) < 0;
  }

  dayTypeLabel(dayType: string): string {
    if (dayType === 'weekday' || dayType === 'weekend' || dayType === 'holiday') {
      return this.t(`dayType.${dayType}`);
    }
    if (dayType === 'use') return this.t('useCardTitle');
    return dayType || '-';
  }

  formatRecordDate(record: OtRecord): string {
    if (record.date) return record.date;
    if (record.timestamp) {
      return new Date(record.timestamp).toLocaleDateString(this.getLocale());
    }
    return '-';
  }

  formatHistoryDetail(record: OtRecord): string {
    if (!this.isUseRecord(record)) return this.toHM(record.value).text;
    const meta = record.meta;
    if (meta?.spentHours !== undefined) {
      return this.t(
        'useHistoryDetail',
        this.toHM(meta.beforeHours || 0).text,
        this.toHM(meta.afterHours || 0).text,
      );
    }
    return record.formatted || record.activity || '';
  }

  getRecordTag(record: OtRecord): string {
    if (!this.isUseRecord(record)) return this.dayTypeLabel(record.dayType);
    const note = String(record.activity || '').trim();
    const match = note.match(/#[A-Za-z0-9_-]+/);
    return match ? match[0] : this.t('useCardTitle');
  }

  trackByRecordId(_: number, record: OtRecord): number {
    return record.id;
  }

  trackByAlertId(_: number, alert: UiAlert): number {
    return alert.id;
  }

  dismissAlert(id: number): void {
    const timer = this.alertTimers.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      this.alertTimers.delete(id);
    }
    this.alerts = this.alerts.filter((item) => item.id !== id);
  }

  onAlertPrimary(alert: UiAlert): void {
    this.dismissAlert(alert.id);
  }

  onAlertSecondary(alert: UiAlert): void {
    if (alert.kind === 'success') {
      this.scrollToHistory();
    }
    this.dismissAlert(alert.id);
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/login');
  }

  private loadData(): void {
    this.dataService.loadData(this.apiBase).subscribe({
      next: (payload) => {
        this.backendAvailable = true;
        this.applyPayload(payload);
      },
      error: (err: unknown) => {
        this.records = [];
        this.lastUpdate = '';
        this.handleBackendError(err);
      },
    });
  }

  private saveData(): void {
    const payload: OtDataPayload = {
      records: this.records,
      lastUpdate: this.lastUpdate,
    };

    if (!this.backendAvailable) return;

    this.dataService.saveData(this.apiBase, payload).subscribe({
      next: () => {
        this.backendAvailable = true;
      },
      error: (err: unknown) => {
        this.handleBackendError(err);
      },
    });
  }

  private saveRecord(
    type: 'earn' | 'use',
    value: number,
    activity: string,
    dayType: DayType,
    formatted = '',
    meta: OtMeta | null = null,
  ): void {
    const now = new Date();
    const record: OtRecord = {
      id: now.getTime(),
      date: now.toLocaleDateString(this.getLocale()),
      timestamp: now.getTime(),
      type,
      activity,
      dayType,
      value,
    };

    if (formatted) record.formatted = formatted;
    if (meta) record.meta = meta;

    this.records = [...this.records, record];
    this.lastUpdate = now.toLocaleString(this.getLocale());
    this.saveData();
  }

  private parseTime(timeText: string): number {
    const [h, m] = timeText.split(':').map(Number);
    return h * 60 + m;
  }

  private parseHHMM(value: string): number | null {
    if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) return null;
    const [h, m] = value.split(':').map(Number);
    return h * 60 + m;
  }

  private parseTimeParts(value: string): { hour: number; minute: number } {
    const match = /^(\d{1,2}):(\d{2})$/.exec(value);
    if (!match) {
      return { hour: 0, minute: 0 };
    }

    const hour = this.clamp(Number(match[1]), 0, 23);
    const minute = this.toNearestPickerMinute(this.clamp(Number(match[2]), 0, 59));
    return { hour, minute };
  }

  private toNearestPickerMinute(minute: number): number {
    let nearest = this.pickerMinutes[0];
    let minDiff = Math.abs(minute - nearest);

    for (const candidate of this.pickerMinutes) {
      const diff = Math.abs(minute - candidate);
      if (diff < minDiff) {
        minDiff = diff;
        nearest = candidate;
      }
    }

    return nearest;
  }

  private clamp(value: number, min: number, max: number): number {
    if (Number.isNaN(value)) return min;
    return Math.min(max, Math.max(min, value));
  }

  private formatTimeValue(hour: number, minute: number): string {
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }

  private syncUseTimeFromRange(): void {
    const start = this.parseTime(this.startTime);
    const end = this.parseTime(this.endTime);
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
      return;
    }

    const duration = end - start;
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    this.useTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  private calcWeighted(
    type: 'weekday' | 'weekend' | 'holiday',
    start: number,
    end: number,
  ): number {
    const boundary = this.parseTime('17:00');
    const lunchStart = this.parseTime('12:00');
    const lunchEnd = this.parseTime('13:00');
    const segments = this.splitLunch(start, end, lunchStart, lunchEnd);

    let weightedMinutes = 0;
    for (const [segmentStart, segmentEnd] of segments) {
      const duration = segmentEnd - segmentStart;
      if (type === 'weekday') {
        weightedMinutes += duration * 1.5;
      } else if (type === 'holiday') {
        weightedMinutes += duration * 2;
      } else {
        if (segmentEnd <= boundary) {
          weightedMinutes += duration;
        } else if (segmentStart >= boundary) {
          weightedMinutes += duration * 1.5;
        } else {
          weightedMinutes += (boundary - segmentStart) + (segmentEnd - boundary) * 1.5;
        }
      }
    }

    return weightedMinutes;
  }

  private splitLunch(
    start: number,
    end: number,
    lunchStart: number,
    lunchEnd: number,
  ): Array<[number, number]> {
    if (end <= start) return [];
    if (end <= lunchStart || start >= lunchEnd) return [[start, end]];

    const segments: Array<[number, number]> = [];
    if (start < lunchStart) {
      segments.push([start, Math.min(end, lunchStart)]);
    }
    if (end > lunchEnd) {
      segments.push([Math.max(start, lunchEnd), end]);
    }
    return segments.filter(([s, e]) => e > s);
  }

  private toHM(hours: number): { H: number; M: number; text: string } {
    const totalMinutes = Math.max(0, Math.round(Math.abs(hours) * 60));
    const H = Math.floor(totalMinutes / 60);
    const M = totalMinutes % 60;
    const hourUnit = this.t('hourUnit');
    const minuteUnit = this.t('minuteUnit');

    return {
      H,
      M,
      text: `${H} ${hourUnit} ${M} ${minuteUnit}`,
    };
  }

  toClockHM(hours: number): string {
    const totalMinutes = Math.max(0, Math.round(Math.abs(hours) * 60));
    const H = Math.floor(totalMinutes / 60);
    const M = totalMinutes % 60;
    return `${String(H).padStart(2, '0')}:${String(M).padStart(2, '0')}`;
  }

  private toCompactHM(hours: number, lang: Lang = this.currentLang): string {
    const totalMinutes = Math.max(0, Math.round(Math.abs(hours) * 60));
    const H = Math.floor(totalMinutes / 60);
    const M = totalMinutes % 60;
    if (lang === 'th') return `${H} ชม. ${M} น.`;
    return `${H} h ${M} m`;
  }

  private resolveLanguage(): Lang {
    const saved = this.safeLocalStorageGet('otLang');
    return saved === 'en' || saved === 'th' ? saved : 'th';
  }

  private getLocale(): string {
    return localeMap[this.currentLang] || localeMap.en;
  }

  private resolveApiBase(): string {
    try {
      const params = new URLSearchParams(window.location.search);
      const queryValue = this.normalizeApiBase(params.get(API_QUERY_PARAM));
      if (queryValue) {
        this.safeLocalStorageSet(API_BASE_STORAGE_KEY, queryValue);
        return queryValue;
      }
    } catch {}

    const configValue = this.normalizeApiBase(window.__APP_CONFIG?.API_BASE || '');
    if (configValue) {
      this.safeLocalStorageSet(API_BASE_STORAGE_KEY, configValue);
      return configValue;
    }

    return this.normalizeApiBase(this.safeLocalStorageGet(API_BASE_STORAGE_KEY));
  }

  private normalizeApiBase(input: string | null | undefined): string {
    if (!input) return '';
    let value = String(input).trim();
    if (!value) return '';

    if (/^\/\//.test(value)) {
      value = `https:${value}`;
    } else if (
      !/^https?:\/\//i.test(value) &&
      /^[a-z0-9.-]+\.[a-z]{2,}(:\d+)?(\/.*)?$/i.test(value)
    ) {
      value = `https://${value}`;
    }

    return value.replace(/\/+$/, '');
  }

  private applyPayload(payload: unknown): void {
    const data = this.normalizePayload(payload);
    this.records = data.records;
    this.lastUpdate = data.lastUpdate;
  }

  private normalizePayload(payload: unknown): OtDataPayload {
    if (!payload || typeof payload !== 'object') {
      return { records: [], lastUpdate: '' };
    }

    const candidate = payload as Partial<OtDataPayload>;
    return {
      records: Array.isArray(candidate.records) ? candidate.records : [],
      lastUpdate: typeof candidate.lastUpdate === 'string' ? candidate.lastUpdate : '',
    };
  }

  private handleBackendError(error: unknown): void {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 404 || error.status === 0) {
        this.backendAvailable = false;
        return;
      }
    }
    this.backendAvailable = false;
  }

  private showSuccess(message: string, icon = 'check_circle'): void {
    this.pushAlert({
      kind: 'success',
      title: this.t('successTitle'),
      message,
      icon,
      primaryLabel: this.t('alertDismiss'),
      secondaryLabel: this.t('alertViewLedger'),
    });
  }

  private showError(message: string): void {
    this.pushAlert({
      kind: 'error',
      title: this.t('errorTitle'),
      message,
      icon: 'error',
      primaryLabel: this.t('alertClose'),
    }, 9000);
  }

  private pushAlert(input: Omit<UiAlert, 'id'>, autoCloseMs = 6500): void {
    const id = ++this.alertSeq;
    const next: UiAlert = { id, ...input };

    // Keep the stack compact so it behaves like toast alerts.
    if (this.alerts.length >= 3) {
      this.dismissAlert(this.alerts[0].id);
    }

    this.alerts = [...this.alerts, next];
    const timer = window.setTimeout(() => this.dismissAlert(id), autoCloseMs);
    this.alertTimers.set(id, timer);
  }

  private scrollToHistory(): void {
    const history = document.getElementById('history-section');
    history?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private safeLocalStorageGet(key: string): string {
    try {
      return localStorage.getItem(key) || '';
    } catch {
      return '';
    }
  }

  private safeLocalStorageSet(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {}
  }

  private initI18n(): Lang {
    this.translate.addLangs(['th', 'en']);
    this.translate.setDefaultLang('th');
    const lang = this.resolveLanguage();
    this.translate.use(lang);
    return lang;
  }

  private resolveTranslationParams(key: string, args: any[]): Record<string, any> | undefined {
    if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null && !Array.isArray(args[0])) {
      return args[0] as Record<string, any>;
    }

    if (key === 'calcSuccess') {
      return { activity: args[0] ?? '', durationText: args[1] ?? '' };
    }
    if (key === 'useAlert') {
      return { usedText: args[0] ?? '', remainText: args[1] ?? '' };
    }
    if (key === 'useHistoryDetail') {
      return { beforeText: args[0] ?? '', afterText: args[1] ?? '' };
    }
    return undefined;
  }
}



