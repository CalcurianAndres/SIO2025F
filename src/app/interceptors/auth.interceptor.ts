import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        const token = localStorage.getItem('token');

        // 🔥 Lista de rutas a excluir
        const rutasExcluidas = [
            '/api/renew',
            '/api/renew2'
        ];

        // Si la URL coincide con alguna ruta excluida → NO agrega token
        if (rutasExcluidas.some(ruta => req.url.includes(ruta))) {
            return next.handle(req);
        }

        // Agregar token normalmente
        if (token) {
            const authReq = req.clone({
                setHeaders: {
                    authorization: `${token}`
                }
            });
            return next.handle(authReq);
        }

        return next.handle(req);
    }
}


