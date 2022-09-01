import { HttpClient, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import { Observable, of } from 'rxjs';
import {delay, filter, first, map, switchMap, tap} from 'rxjs/operators';
import IUser from '../models/user.model';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isAuthenticated$:Observable<boolean>
  isAuthenticatedWithDelay$:Observable<boolean>
  redirect=false
  serverUrl='http://localhost:8080'
  user:IUser|null=null
  user$:Observable<any>

  constructor(
    private http:HttpClient,
    private router:Router,
    private route:ActivatedRoute) {
    this.user$=of(
        {
          userId:'630f50deb5f33e479186e5ee',
          name:'jack',
          email:'jack@mail.com',
          age:20,
          mobileNumber:'4545124522',
          token:null
        }
      )
    this.isAuthenticated$=of(true)
    this.user$.subscribe(
      (data)=>{
        this.user={
          id:data.userId,
          name:data.name,
          email:data.email,
          age:data.age,
          mobileNumber:data.mobileNumber,
        }
      }
    )
    this.isAuthenticatedWithDelay$=this.isAuthenticated$.pipe(
      delay(1000)
    )

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

    const req=new HttpRequest('POST',`${this.serverUrl}/register`,userData);
    this.http.request(req).subscribe(
      (event)=>{
        if(event instanceof HttpResponse){
          console.log(event)
        }
      }
    )

  }

  public async logout(event:Event){
    event.preventDefault()
    // await this.auth.signOut()
    await this.router.navigateByUrl('/')
    
  }

}
