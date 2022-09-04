import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  credentials={
    email: '',
    password: ''
  }

  showAlert=false
  alertMessage=''
  alertColor='blue'
  inSubmission=false

  constructor(private auth:AuthService) { }

  ngOnInit(): void {
  }

  async login(){
    console.log("Logging in...");
    this.showAlert=true
    this.alertMessage='Logging in...Please wait!'
    this.inSubmission=true
    
    this.auth.login(this.credentials.email,this.credentials.password)
        .subscribe({
          next:(event)=>{
          this.auth.setToken(event.token)
          this.alertColor='green'
          this.alertMessage='Logged in successfully!'
          setTimeout(()=>{
            this.auth.isLoggedIn=true
            this.inSubmission=false
          },1000)

        },
        error:(error)=>{
          console.error(error)
          this.alertColor='red'
          this.alertMessage='Invalid credentials'  
          this.inSubmission=false
          return

        }
      })
    
  }

}
