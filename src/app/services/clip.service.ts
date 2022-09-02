import { HttpClient, HttpEvent, HttpParams, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { data, event } from 'cypress/types/jquery';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { switchMap , map, timestamp, filter} from 'rxjs/operators';
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

   createClip(userId:string,displayName:string,
    title:string,clipFileName:string,clipFile:File,screenshotBlob:Blob){
    
    const formData=new FormData();
    formData.append('userId',userId)
    formData.append('displayName',displayName)
    formData.append('title',title)
    formData.append('clipFileName',clipFileName)
    formData.append('clipFile',clipFile)
    formData.append('screenshotFileName',clipFileName)
    formData.append('screenshotFile',screenshotBlob)

    const req=new HttpRequest('POST',`${this.serverUrl}/clips/add`,formData,{
      reportProgress:true,
      responseType:'text'
    })
    return this.http.request(req);  

   }

   getUserClips(sort$:BehaviorSubject<string>){
    return combineLatest([
      this.auth.user$,
      sort$
    ]).pipe(
      switchMap(values => {
        const [user,sort]=values
        console.log({user,sort})
        if(!user){
          of([])
        }
        return this.http.get<IClip[]>(`${this.serverUrl}/user/${user.userId}/clips`,{
          params:new HttpParams().set('order',sort)
        })
      })
    )
   }

   updateClip(id:string,title:string){
    const body={id,title}
    return this.http.post(`${this.serverUrl}/clip/update`,body,{
      responseType:'text'
    })
   }

   deleteClip(id:string){
    return this.http.delete(`${this.serverUrl}/clip/${id}`,{
      responseType:'text'
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

    

    // let query=this.collection.ref.orderBy('timestamp','desc').limit(6)
    
    // const {length}= this.pageClips
    // if(length){
    //   const lastDocId=this.pageClips[length-1].docId
    //   const lastDoc= await this.collection.doc(lastDocId).get().toPromise()
    //   query=query.startAfter(lastDoc)
      
    // }

    // const snapshot=await query.get()
    // snapshot.forEach( doc =>{
    //   this.pageClips.push({
    //     docId:doc.id,
    //     ...doc.data()
    //   })
    // })

    this.isProcessing=false
   }

   getClip(id:string){
    return this.http.get<IClip|null>(`${this.serverUrl}/clips/${id}`)
  }

   resolve(route:ActivatedRouteSnapshot,state:RouterStateSnapshot){
    return this.getClip(route.params.id)
   }

}
