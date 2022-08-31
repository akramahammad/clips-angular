import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import videojs from 'video.js';
import IClip from '../models/clip.model';

@Component({
  selector: 'app-clip',
  templateUrl: './clip.component.html',
  styleUrls: ['./clip.component.css'],
  encapsulation:ViewEncapsulation.None,
  providers:[DatePipe]
})
export class ClipComponent implements OnInit {
  clip?:IClip|null
  @ViewChild('videoPlayer',{static:true}) target?:ElementRef
  player?:videojs.Player

  constructor(private route:ActivatedRoute) { }

  ngOnInit(): void {
    this.player=videojs(this.target?.nativeElement)

    this.route.data.subscribe( data =>{
      this.clip=data.clip as IClip

      this.player?.src({
        src:'data:video/mp4;base64,'+this.clip.clipData.data,
        type:'video/mp4'
      })
      
    })

    

  }

}
