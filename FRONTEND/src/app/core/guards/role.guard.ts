import { Injectable } from '@angular/core';
import { CanMatch, Router, Route, UrlSegment, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { AppRole } from '@core/constants/roles.constants';

@Injectable({
    providedIn: 'root'
})
export class RoleGuard implements CanMatch {
    constructor(private authService: AuthService, private router: Router) { }

    canMatch(route: Route, _segments: UrlSegment[]): boolean | UrlTree | Observable<boolean | UrlTree> {
        const expectedRole = route.data?.['role'] as AppRole;
        const currentUserRole = this.authService.getUserRole();

        if (!this.authService.isAuthenticated()) {
            return this.router.createUrlTree(['/login']);
        }

        if (!expectedRole) {
            return this.router.createUrlTree(['/login']);
        }

        if (this.authService.hasRole(expectedRole)) {
            return of(true);
        }

        const userRoleName = currentUserRole;
        const redirectUrl = this.authService.getRedirectUrlForRole(userRoleName!);

        if (redirectUrl) {
            return this.router.createUrlTree([redirectUrl]);
        }

        return this.router.createUrlTree(['/login']);
    }
}