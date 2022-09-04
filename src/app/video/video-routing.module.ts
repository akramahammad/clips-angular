import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageComponent } from './manage/manage.component';
import { UploadComponent } from './upload/upload.component';
import { AuthGuard } from '../guards/auth.guard';

const routes: Routes = [
  {
    path:'manage',
    component:ManageComponent,
    data:{
      authOnly:true
    },
    canActivate:[AuthGuard]
  },
  {
    path:'upload',
    component:UploadComponent,
    data:{
      authOnly:true
    },
    canActivate:[AuthGuard]
  },
  {
    path:'manage-clips',
    redirectTo:'manage'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VideoRoutingModule { }
