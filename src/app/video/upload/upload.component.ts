import { Component, OnDestroy} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';
import { FfmpegService } from 'src/app/services/ffmpeg.service';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnDestroy {

  isDragOver=false
  file:File | null =null
  showUpload=true
  title = new FormControl('',[
    Validators.required,
    Validators.minLength(3)
  ])

  uploadForm= new FormGroup({
    title:this.title
  })

  showAlert=false
  alertColor='blue'
  alertMessage=''
  inSubmission=false
  percentage=0
  showPercentage=false
  uploadSubscription?:Subscription
  screenshots:string[] =[]
  selectedScreenshot=''

  constructor(private clipService:ClipService,private auth:AuthService,
     private router:Router, public ffmpegService:FfmpegService) {
    this.ffmpegService.init();
   }

  ngOnDestroy(): void {
    this.uploadSubscription?.unsubscribe()
  }

  async storeFile(event:Event){
    
    if(this.ffmpegService.isRunning) return

    this.isDragOver=false

    this.file=(event as DragEvent).dataTransfer?
    (event as DragEvent).dataTransfer?.files.item(0) ?? null :
    (event.target as HTMLInputElement).files?.item(0) ?? null

    if(!this.file || this.file.type!=='video/mp4'){
      return
    }

    this.screenshots=await this.ffmpegService.getScreenshots(this.file);
    this.selectedScreenshot=this.screenshots[0]

    this.title.setValue(
      this.file.name.replace(/\.[^/.]+$/,'')
    )
    this.showUpload=false
    
  }

  async uploadFile(){
    console.log('Uploading file')
    this.uploadForm.disable()
    this.alertColor='blue'
    this.alertMessage='File upload in progress...'
    this.showAlert=true
    this.showPercentage=true
    this.inSubmission=true
    let clipFileName= `ID-${Date.now().toFixed()}`;
    const screenshotBlob= await this.ffmpegService.getScreenshotBlob(this.selectedScreenshot);
    if(this.file===null){
      return
    }
    
    this.uploadSubscription=this.clipService.createClip(this.title.value,
      clipFileName,this.file,screenshotBlob)
      .subscribe({
        next:(event)=>{
          console.log(event)
          if(event.type===HttpEventType.UploadProgress){
            if(event.total!==undefined){
              this.percentage=Math.round(event.loaded/event.total * 100)/100
            }
          }
          if(event instanceof HttpResponse && event.status===201){
            const body=event.body as {message:string,clipId:string}
            setTimeout(()=>{
              this.router.navigate(['clips',body.clipId])
            },1000)
                    
            this.alertMessage='File uploaded successfully'
            this.alertColor='green'
            this.inSubmission=true
            this.showPercentage=false        
          }
          else if(event instanceof HttpResponse && event.status===413){
            this.uploadForm.enable()
            this.alertMessage='Max file size exceeded!'
            this.alertColor='red'
            this.inSubmission=true
            this.showPercentage=false
            const interval=setTimeout(()=>{
              this.file=null
              this.showUpload=true
              this.alertMessage=''
              this.showAlert=false
              this.inSubmission=false
              this.showPercentage=false
              this.alertColor='blue'
            },1000)  
          }

        },
        error:(err)=>{
          console.error(err)
          this.uploadForm.enable()
          this.alertMessage='Upload failed ! Please try again'
          this.alertColor='red'
          this.inSubmission=true
          this.showPercentage=false
          const interval=setTimeout(()=>{
            this.file=null
            this.showUpload=true
            this.alertMessage=''
            this.alertColor='blue'
            this.showAlert=false
            this.inSubmission=false
            this.showPercentage=false
          },1000)
        },
      })

  }
}
