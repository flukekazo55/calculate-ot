import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';

type Lang = 'th' | 'en';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit {
  currentLang: Lang = 'th';
  username = '';
  email = '';
  password = '';
  confirmPassword = '';

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

  get hasMinLength(): boolean {
    return this.password.length >= 8;
  }

  get hasUppercase(): boolean {
    return /[A-Z]/.test(this.password);
  }

  get hasLowercase(): boolean {
    return /[a-z]/.test(this.password);
  }

  get hasNumber(): boolean {
    return /\d/.test(this.password);
  }

  submit(): void {
    if (this.loading) return;

    const username = this.username.trim();
    const email = this.email.trim();

    if (!username || !email || !this.password || !this.confirmPassword) {
      this.error = this.t('register.errors.requiredFields');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = this.t('register.errors.passwordMismatch');
      return;
    }

    if (!this.hasMinLength || !this.hasUppercase || !this.hasLowercase || !this.hasNumber) {
      this.error = this.t('register.errors.passwordRequirements');
      return;
    }

    this.error = '';
    this.loading = true;

    this.authService.register({ username, email, password: this.password }).subscribe({
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
      return this.t('register.errors.unableToCreate');
    }

    if (err.status === 0) return this.t('shared.errors.backendUnavailable');
    if (err.status === 409) return this.t('register.errors.duplicateIdentity');

    const details = err.error?.details;
    if (typeof details === 'string' && details.trim()) {
      return details;
    }

    return this.t('register.errors.unableToCreate');
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
