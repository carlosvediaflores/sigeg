import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DocumentoGaceta } from '../../interfaces/hero-slide.interface';

@Component({
  selector: 'app-gaceta',
  imports: [],
  templateUrl: './gaceta.html',
  styleUrl: './gaceta.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Gaceta {
   // ==========================================
    // FILTROS
    // ==========================================

    busqueda = signal('');

    gestionSeleccionada = signal<number | null>(null);

    tipoSeleccionado = signal<string>('TODOS');



    // ==========================================
    // DATOS
    // ==========================================

    documentos = signal<DocumentoGaceta[]>([


        {
            id: 1,
            numero: '001/2026',
            tipo: 'LEY MUNICIPAL',
            titulo: 'Ley Municipal de Organización y Funcionamiento del Gobierno Autónomo Municipal de Ckochas',
            fecha: '15/01/2026',
            gestion: 2026,
            archivo: '#',
            fechaAprobacion: '10/01/2026'
        },


        {
            id: 2,
            numero: '002/2026',
            tipo: 'DECRETO MUNICIPAL',
            titulo: 'Decreto Municipal correspondiente a la gestión 2026',
            fecha: '22/01/2026',
            gestion: 2026,
            archivo: '#',
            fechaAprobacion: '10/01/2026'
        },


        {
            id: 3,
            numero: '003/2026',
            tipo: 'RESOLUCIÓN MUNICIPAL',
            titulo: 'Resolución Municipal de carácter administrativo',
            fecha: '05/02/2026',
            gestion: 2026,
            archivo: '#',
            fechaAprobacion: '10/01/2026'
        },


        {
            id: 4,
            numero: '004/2026',
            tipo: 'LEY MUNICIPAL',
            titulo: 'Ley Municipal de Administración Municipal',
            fecha: '18/02/2026',
            gestion: 2026,
            archivo: '#',
            fechaAprobacion: '10/01/2026'
        },


        {
            id: 5,
            numero: '005/2025',
            tipo: 'DECRETO MUNICIPAL',
            titulo: 'Decreto Municipal correspondiente a la gestión 2025',
            fecha: '12/11/2025',
            gestion: 2025,
            archivo: '#',
            fechaAprobacion: '10/01/2026'
        }


    ]);



    // ==========================================
    // TIPOS
    // ==========================================

    tipos = computed(() => {

        const valores = this.documentos()
            .map(x => x.tipo);

        return [...new Set(valores)];

    });



    // ==========================================
    // GESTIONES
    // ==========================================

    gestiones = computed(() => {

        const valores = this.documentos()
            .map(x => x.gestion);

        return [...new Set(valores)]
            .sort((a, b) => b - a);

    });



    // ==========================================
    // FILTRADO
    // ==========================================

    documentosFiltrados = computed(() => {


        const texto =
            this.busqueda()
                .toLowerCase()
                .trim();


        return this.documentos().filter(documento => {


            const coincideTexto =

                !texto ||

                documento.numero
                    .toLowerCase()
                    .includes(texto) ||

                documento.tipo
                    .toLowerCase()
                    .includes(texto) ||

                documento.titulo
                    .toLowerCase()
                    .includes(texto);



            const coincideGestion =

                this.gestionSeleccionada() === null ||

                documento.gestion ===
                this.gestionSeleccionada();



            const coincideTipo =

                this.tipoSeleccionado() === 'TODOS' ||

                documento.tipo ===
                this.tipoSeleccionado();



            return (

                coincideTexto &&

                coincideGestion &&

                coincideTipo

            );


        });


    });



    // ==========================================
    // MÉTODOS
    // ==========================================


    buscar(event: Event) {

        const input =
            event.target as HTMLInputElement;

        this.busqueda.set(input.value);

    }



    cambiarGestion(event: Event) {

        const select =
            event.target as HTMLSelectElement;

        const value = select.value;

        this.gestionSeleccionada.set(

            value === 'TODOS'
                ? null
                : Number(value)

        );

    }



    cambiarTipo(event: Event) {

        const select =
            event.target as HTMLSelectElement;

        this.tipoSeleccionado.set(
            select.value
        );

    }


}
