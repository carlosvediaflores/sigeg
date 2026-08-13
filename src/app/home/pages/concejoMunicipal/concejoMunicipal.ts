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
 nombre:'NICOLAZ CARMONA CONDORI',
 cargo:'Vicepresidente',
 foto:'assets/images/municipio/concejal2.jpg',
 comision:'COMISIÓN DE GESTIÓN, DESARROLLO INSTITUCIONAL ECONÓMICA ADMINISTRATIVA, FINANCIERA, SERVICIOS PÚBLICOS - COMISIÓN DE DESARROLLO HUMANO (EDUCACIÓN, SALUD DEPORTES), GENERO GENERACIONAL Y SEGURIDAD CIUDADANA. - COMISIÓN DE ÉTICA'
},


{
 nombre:'MARCELINA CÁRDENAS SAUSA',
 cargo:'Secretaria',
 foto:'assets/images/municipio/concejal3.jpg',
 comision:'COMISIÓN DE PLANIFICACIÓN, GESTIÓN TERRITORIAL, LÍMITES E INFRAESTRUCTURA, TÉCNICA JURÍDICA, MEDIO AMBIENTE Y MINERÍA. - COMISIÓN DE DESARROLLO HUMANO (EDUCACIÓN, SALUD DEPORTES), GENERO GENERACIONAL Y SEGURIDAD CIUDADANA. - COMISIÓN DE ÉTICA'
},


{
 nombre:'GREGORIO RIVERA TORO',
 cargo:'Concejal Municipal',
 foto:'assets/images/municipio/concejal4.jpg',
 comision:'COMISIÓN DE PLANIFICACIÓN, GESTIÓN TERRITORIAL, LÍMITES E INFRAESTRUCTURA, TÉCNICA JURÍDICA, MEDIO AMBIENTE Y MINERÍA. - COMISIÓN DE DESARROLLO PRODUCTIVO, CULTURA Y TURISMO. - COMISIÓN DE ÉTICA.'
},


{
 nombre:' FLORA MICO ALVARES',
 cargo:'Concejal Municipal',
 foto:'assets/images/municipio/concejal5.jpg',
 comision:'COMISIÓN DE GESTIÓN, DESARROLLO INSTITUCIONAL ECONÓMICA ADMINISTRATIVA, FINANCIERA, SERVICIOS PÚBLICOS.- COMISIÓN DE DESARROLLO PRODUCTIVO, CULTURA Y TURISMO'
}

];
}
