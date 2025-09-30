import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { RestApiService } from '../services/rest-api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private api:RestApiService,
              private router:Router){

  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot){

      return this.api.validarToken()
      .pipe(
        tap(isAuth =>{
          if (!isAuth){
            this.router.navigateByUrl('login')
          }
        })
      )
  }
  
}