import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClipComponent } from './clip/clip.component';
import { HomeComponent } from './home/home.component';
import { NotfoundComponent } from './notfound/notfound.component';
import { ClipService } from './services/clip.service';

const routes: Routes = [
  {
    path:'',
    component:HomeComponent
  },
  {
    path:'clips/:id',
    component:ClipComponent,
    resolve:{
      clip:ClipService
    }
  },
  {
    path:'',
    loadChildren: async () => (await (import('./video/video.module'))).VideoModule
  },
  {
    path:'**',
    component:NotfoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
