import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor{

  constructor(private auth:AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('Inside auth interceptor')
    const token=this.auth.getToken()
    const authReq=req.clone({
      headers:req.headers.set('Authorization',`Bearer ${token}`)
    })

    return next.handle(authReq);
  }

}
