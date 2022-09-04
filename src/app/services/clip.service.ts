import { HttpClient, HttpEvent, HttpHeaders, HttpParams, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { switchMap , map, timestamp, filter, retry} from 'rxjs/operators';
import IClip from '../models/clip.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ClipService implements Resolve<IClip|null>{
  isProcessing=false
  pageClips:IClip[]=[]
  serverUrl='http://localhost:8080'

  constructor(private http:HttpClient,
    private auth:AuthService,
    private router:Router) {
      
   }

   createClip(title:string,clipFileName:string,clipFile:File,screenshotBlob:Blob){
    
    const formData=new FormData();
    formData.append('title',title)
    formData.append('clipFileName',clipFileName)
    formData.append('clipFile',clipFile)
    formData.append('screenshotFileName',clipFileName)
    formData.append('screenshotFile',screenshotBlob)

    const req=new HttpRequest('POST',
    `${this.serverUrl}/clips/add`,formData,{
      reportProgress:true,
      headers:new HttpHeaders().set('auth','true')
    })
    return this.http.request<
    {message:string,clipId:string}|{message:string}
    >(req);  

   }

   getUserClips(sort$:BehaviorSubject<string>){
    return sort$.pipe(
      switchMap(order => {
        return this.http.get<IClip[]>(`${this.serverUrl}/user/clips`,{
                params:new HttpParams().set('order',order),
                headers:new HttpHeaders().set('auth','true')
              })
      })
    )
    // return combineLatest([
    //   this.auth.user$,
    //   sort$
    // ]).pipe(
    //   switchMap(values => {
    //     const [user,sort]=values
    //     console.log({user,sort})
    //     if(!user){
    //       of([])
    //     }
    //     return this.http.get<IClip[]>(`${this.serverUrl}/user/clips`,{
    //       params:new HttpParams().set('order',sort)
    //     })
    //   })
    // )

   }

   updateClip(id:string,title:string){
    const body={id,title}
    return this.http.post(`${this.serverUrl}/clip/update`,body,{
      responseType:'text',
      headers:new HttpHeaders().set('auth','true')
    })
   }

   deleteClip(id:string){
    return this.http.delete(`${this.serverUrl}/clip/${id}`,{
      responseType:'text',
      headers:new HttpHeaders().set('auth','true')
    })
   }

   async getClips(offSet:number){
    console.log('inside getClips')
    if(this.isProcessing){
      return
    }

    this.isProcessing=true
    this.http.get(`${this.serverUrl}/clips`,{
      params: new HttpParams().set('offset',offSet)
    }).subscribe(
      (response:any)=>{
        response.map((data:IClip ) =>{

          const clip:IClip={
            id:data.id,
            title:data.title,
            userId:data.userId,
            displayName:data.displayName,
            clipFileName:data.clipFileName,
            clipData:'data:video/mp4;base64,'+data.clipData.data,
            screenshotFileName:data.screenshotFileName,
            screenshotData:'data:image/png;base64,'+data.screenshotData.data,
            timestamp:data.timestamp
          }

          this.pageClips.push(clip);
        })

        
      }
    )

    this.isProcessing=false
   }

   getClip(id:string){
    return this.http.get<IClip|null>(`${this.serverUrl}/clips/${id}`)
  }

   resolve(route:ActivatedRouteSnapshot,state:RouterStateSnapshot){
    return this.getClip(route.params.id)
   }

}
