import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fbTimestamp'
})
export class FbTimestampPipe implements PipeTransform {

  constructor(private datePipe:DatePipe){}

  transform(value: Date|undefined){
    return this.datePipe.transform(value,'mediumDate');
  }

}
