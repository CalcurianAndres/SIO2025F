import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash'; 

@Pipe({
  name: 'unicos',
  pure: false
})
export class UnicosPipe implements PipeTransform {

  transform(value: any): any{
    if(value!== undefined && value!== null){
        return _.uniqBy(value, 'name');
    }
    return value;
}

}
