import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, fromEvent, merge, Observable, timer, Subject } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InactivityService implements OnDestroy {
  private destroy$ = new Subject<void>();
  private inactivityTimer$ = new BehaviorSubject<number>(0);

  public onInactivity$: Observable<void>;

  constructor(private router: Router) {
    const userActivity$ = merge(
      fromEvent(document, 'mousemove'),
      fromEvent(document, 'mousedown'),
      fromEvent(document, 'keypress'),
      fromEvent(document, 'scroll'),
      fromEvent(document, 'touchstart')
    );

    this.onInactivity$ = userActivity$.pipe(
      switchMap(() => this.resetTimer()),
      filter(time => time === 0),
      switchMap(() => {
        console.warn('Usuario inactivo. Cerrando sesión.');
        return this.logout();
      })
    );
  }

  startWatching(timeoutMinutes: number = 15): void {
    const timeoutMs = timeoutMinutes * 60 * 1000;
    this.inactivityTimer$.next(timeoutMs);
  }

  stopWatching(): void {
    this.inactivityTimer$.next(0);
  }

  private resetTimer(): Observable<number> {
    const timeout = this.inactivityTimer$.value;
    if (timeout <= 0) return new Observable();

    return timer(0, 1000).pipe(
      switchMap(t => {
        const remaining = timeout - t;
        if (remaining <= 0) {
          return [0];
        }
        return [remaining];
      })
    );
  }

  private logout(): Observable<void> {
    import('./auth.service').then(({ AuthService }) => {
      const authService = new AuthService();
      authService.logout();
    });
    return new Observable();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}