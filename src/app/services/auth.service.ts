import { HttpClient, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import { of } from 'rxjs';
import {filter, map,switchMap} from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import IUser from '../models/user.model';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  redirect=false
  serverUrl=environment.serverUrl
  isLoggedIn=false

  constructor(
    private http:HttpClient,
    private router:Router,
    private route:ActivatedRoute) {

    const token=localStorage.getItem('token')
    if(token!==undefined && token!==null){

      const body={token}
      this.http.post(`${this.serverUrl}/user/validate/token`,body,{
        responseType:'text',
        observe:'response'
      })
      .subscribe(
        (event)=>{
          if(event instanceof HttpResponse && event.status===200){
            this.isLoggedIn=true
          }
        }
        )
        
      }


    this.router.events.pipe(
      filter(r => r instanceof NavigationEnd),
      map(r =>this.route.firstChild),
      switchMap(r =>r?.data ?? of({}))
    )
    .subscribe( routeData => {
      this.redirect=routeData.authOnly ?? false
    })
   }

  async createUser(userData:IUser){
    
    if(!userData.password){
      throw new Error("Password is not available")
    }

    const req=new HttpRequest('POST',`${this.serverUrl}/user/register`,userData);
    this.http.request(req).subscribe(
      (event)=>{
        if(event instanceof HttpResponse && event.status===201){
          console.log(event)
          const body=event.body as {message:string ,token:string}
          if(body.token!==null && body.token!==undefined){
            this.setToken(body.token)
            setTimeout(()=>{
              this.isLoggedIn=true
            },1000)
          }
        }
      }
    )

  }

  login(username:string,password:string){
    const body={email:username, password}
    return this.http.post<{message:string,token:string}>(`${this.serverUrl}/user/login`,body)
  }

  async logout(event:Event){
    event.preventDefault()
    localStorage.removeItem('token')
    this.isLoggedIn=false
    await this.router.navigateByUrl('/')
  }

  checkEmailAvailable(email:string){
    return this.http.get(`${this.serverUrl}/user/email/${email}`,{
      responseType:'text',
      observe:'response'
    }).pipe(
      map(event =>{
        console.log(event)
        if(event.body==='Email already registered') return {emailTaken:true}
        return null
      })
    )
  }

  getToken(){
    localStorage.getItem('token')
  }

  setToken(token:string){
    localStorage.setItem('token',token)
  }


}
