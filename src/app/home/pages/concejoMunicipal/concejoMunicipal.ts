import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-concejo-municipal',
  imports: [],
  templateUrl: './concejoMunicipal.html',
  styleUrl: './concejoMunicipal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConcejoMunicipal {
  concejales = [

{
 nombre:'Nombre Vicepresidente',
 cargo:'Vicepresidente',
 foto:'assets/images/concejo/vicepresidente.jpg',
 comision:'Comisión de Obras Públicas y Servicios'
},


{
 nombre:'Nombre Tesorero',
 cargo:'Tesorero',
 foto:'assets/images/concejo/tesorero.jpg',
 comision:'Comisión Económica y Financiera'
},


{
 nombre:'Nombre Concejal 1',
 cargo:'Concejal Municipal',
 foto:'assets/images/concejo/concejal1.jpg',
 comision:'Comisión de Desarrollo Productivo'
},


{
 nombre:'Nombre Concejal 2',
 cargo:'Concejal Municipal',
 foto:'assets/images/concejo/concejal2.jpg',
 comision:'Comisión Social y Cultural'
}

];
}
