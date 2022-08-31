import { HttpClient, HttpEvent, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { data, event } from 'cypress/types/jquery';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { switchMap , map, timestamp, filter} from 'rxjs/operators';
import IClip from '../models/clip.model';

@Injectable({
  providedIn: 'root'
})
export class ClipService implements Resolve<IClip|null>{
  isProcessing=false
  collection: any
  pageClips:IClip[]=[]
  serverUrl='http://localhost:8080'

  constructor(private http:HttpClient,
    private router:Router) {
      
   }

   createClip(clip:IClip,clipFile:File,screenshotBlob:Blob):Observable<HttpEvent<any>>{
    
    const formData=new FormData();
    formData.append('userId',clip.userId)
    formData.append('displayName',clip.displayName)
    formData.append('title',clip.title)
    formData.append('clipFileName',clip.clipFileName)
    formData.append('clipFile',clipFile)
    formData.append('screenshotFileName',clip.screenshotFileName)
    formData.append('screenshotData',screenshotBlob)

    const req=new HttpRequest('POST',`${this.serverUrl}/clips/add`,formData,{
      reportProgress:true,
      responseType:'json'
    })
    return this.http.request(req);  

   }

  //  getUserClips(sort$:BehaviorSubject<string>){
  //   return combineLatest([
  //     this.auth.user,
  //     sort$
  //   ]).pipe(
  //     switchMap(values => {
  //       const [user,sort]=values
  //       console.log({user,sort})
  //       if(!user){
  //         of([])
  //       }

  //       const query=this.collection.ref.where(
  //         'uid', '==', user?.uid
  //       ).orderBy(
  //         'timestamp',sort==='recent'?'desc':'asc'
  //       )
  //       return query.get()
  //     }),
  //     map(snapshot => (snapshot as QuerySnapshot<IClip>).docs)
  //   )
  //  }

  //  updateClip(id:string,title:string){
  //   return this.collection.doc(id).update({
  //     title
  //   })
  //  }

  //  async deleteClip(clip:IClip){
  //   const clipRef=this.storage.ref(`clips/${clip.fileName}`)
  //   const screenshotRef= this.storage.ref(`screenshots/${clip.screenshotFileName}`)
  //   await clipRef.delete()
  //   await screenshotRef.delete()
  //   await this.collection.doc(clip.docId).delete()
  //  }

   async getClips(){
    if(this.isProcessing){
      return
    }

    this.isProcessing=true
    this.http.get(`${this.serverUrl}/clips`).subscribe(
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
    // const request=new HttpRequest('GET',`${this.serverUrl}/clips/${id}`)
    return this.http.get<IClip|null>(`${this.serverUrl}/clips/${id}`)
  }

   resolve(route:ActivatedRouteSnapshot,state:RouterStateSnapshot){
    return this.getClip(route.params.id)
   }

}
