import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';

type Lang = 'th' | 'en';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  currentLang: Lang = 'th';
  readonly webTitle =
    (typeof document !== 'undefined' && document.title ? document.title : 'CALCULATE OT').replace(
      /\s*\(.+\)\s*$/,
      '',
    );
  identity = '';
  password = '';
  rememberMe = true;

  loading = false;
  error = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.initI18n();
    if (this.authService.isAuthenticated) {
      void this.router.navigateByUrl('/ot');
    }
  }

  t(key: string, params?: Record<string, unknown>): string {
    const fullKey = `auth.${key}`;
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

  submit(): void {
    if (this.loading) return;

    const identity = this.identity.trim();
    const password = this.password;

    if (!identity || !password) {
      this.error = this.t('login.errors.missingCredentials');
      return;
    }

    this.error = '';
    this.loading = true;

    this.authService.login({ identity, password }).subscribe({
      next: () => {
        void this.router.navigateByUrl('/ot');
      },
      error: (err: unknown) => {
        this.error = this.resolveError(err);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  private resolveError(err: unknown): string {
    if (!(err instanceof HttpErrorResponse)) {
      return this.t('login.errors.unableToSignIn');
    }

    if (err.status === 0) return this.t('shared.errors.backendUnavailable');
    if (err.status === 401) return this.t('login.errors.invalidCredentials');

    const details = err.error?.details;
    if (typeof details === 'string' && details.trim()) {
      return details;
    }

    return this.t('login.errors.unableToSignIn');
  }

  private initI18n(): void {
    this.translate.addLangs(['th', 'en']);
    this.translate.setDefaultLang('th');
    const lang = this.resolveLanguage();
    this.currentLang = lang;
    this.translate.use(lang);
  }

  private resolveLanguage(): Lang {
    const saved = this.safeLocalStorageGet('otLang');
    return saved === 'en' || saved === 'th' ? saved : 'th';
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
}
