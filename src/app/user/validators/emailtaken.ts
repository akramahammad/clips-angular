import { HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AbstractControl, AsyncValidator, ValidationErrors } from "@angular/forms";
import { Observable, of } from "rxjs";
import { AuthService } from "src/app/services/auth.service";

@Injectable({
    providedIn:'root'
})
export class Emailtaken implements AsyncValidator {
    constructor(public auth:AuthService){}

    validate=(control:AbstractControl):Observable<ValidationErrors|null> => {
        return this.auth.checkEmailAvailable(control.value)
    }
}
