import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { RestApiService } from '../services/rest-api.service';

@Injectable({
  providedIn: 'root'
})
export class TwoStep implements CanActivate {

  constructor(private api:RestApiService,
              private router:Router){
                // console.log('work')
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot){

      return this.api.ValidarVerificacion()
      .pipe(
        tap(isAuth =>{
          if (!isAuth){
            this.router.navigateByUrl('/ventas/verificacion')
          }
        })
      )
  }
  
}