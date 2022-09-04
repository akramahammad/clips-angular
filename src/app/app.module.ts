import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http'
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UserModule } from './user/user.module';
import { NavComponent } from './nav/nav.component';
import { HomeComponent } from './home/home.component';
import { ClipComponent } from './clip/clip.component';
import { NotfoundComponent } from './notfound/notfound.component';
import { ClipslistComponent } from './clipslist/clipslist.component';
import { FbTimestampPipe } from './pipes/fb-timestamp.pipe';
import { AuthInterceptor } from './interceptors/auth-interceptor.service';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    HomeComponent,
    ClipComponent,
    NotfoundComponent,
    ClipslistComponent,
    FbTimestampPipe
  ],
  imports: [
    BrowserModule,
    UserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    {provide:HTTP_INTERCEPTORS, useClass:AuthInterceptor, multi:true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
