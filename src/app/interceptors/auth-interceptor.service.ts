import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor{

  constructor(private router:Router) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('Inside auth interceptor')
    const token=localStorage.getItem('token')
    if(!req.headers.has('auth') || token===undefined||token===null) return next.handle(req)
    
    console.log('Has auth header')
    const authReq=req.clone({
      headers:req.headers.set('Authorization',`Bearer ${token}`).delete('auth')
    })
    console.log(authReq)
    return next.handle(authReq)
    .pipe(
      catchError((error:HttpErrorResponse)=>{
        console.log(error)
        
        if(error.status===401){
          this.router.navigate(['/']);
          return throwError('User is not authenticated')
        }
        return throwError('Technical Error. Please try again later')
      })
    );
  }

}
