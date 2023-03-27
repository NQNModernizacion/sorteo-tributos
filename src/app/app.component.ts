import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TipoImpuesto } from './models/tipoImpuesto.model';
import { Impuesto } from './models/impuesto.model';
import { SorteoService } from './services/sorteo.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'sorteo-deudas';
  form!: FormGroup;
  tipoImpuesto: TipoImpuesto[] = [
    { id: 1, descripcion: 'INM', leyenda: 'Inmueble (Nro. Partida)'},
    { id: 2, descripcion: 'ROD', leyenda: 'Rodado (Dominio)'},
    { id: 3, descripcion: 'CEC', leyenda: 'Cementerio (Nro contrato)'},
    { id: 4, descripcion: 'COM', leyenda: 'Comercio (Lic. comercial)'},
  ];

  impuesto!: Impuesto;
  idImpuestoMaxLength: number = 100;
  idImpuestoPlaceHolder: string = '';

  mensaje: string = '';
  numero: number = 0;

  constructor(private formBuilder: FormBuilder,
              private sorteoService: SorteoService) {}

  ngOnInit(): void {
    this.createForm();
  }


  onSubmit() {

    this.numero = 0;
    this.mensaje = '';

    if (!this.form.valid) {
      this.form.markAllAsTouched();
    }
    else {

      this.impuesto = new Impuesto();

      this.impuesto.tipoImpuesto = this.form.controls['tipoImpuesto'].value;
      this.impuesto.identificacion = this.form.controls['identificacion'].value.split('-').join('');

      // Quito espacios en blanco
      this.impuesto.identificacion = this.impuesto.identificacion.replace(/\s/g, '');

      this.sorteoService.getNumero(this.impuesto).subscribe( (resp: any) => {

        if(resp > 0) {
          this.numero = resp;
          this.mensaje = `Tu número es ${resp}`;
        }
        else {
          this.mensaje = `No estas participando del sorteo. 
                          Si regularizaste tu tributo con nuestro municipio hasta el 27 de marzo , 
                          volvé a ingresar en las próximas 72hs para obtener tu número de sorteo. 
                          ¡Gracias por participar!`;
        }
      }, err => {
        this.mensaje = 'Error en el servidor';
      })

    }

  }

  createForm() {

    this.form = this.formBuilder.nonNullable.group({
      tipoImpuesto: ['', [Validators.required]],
      identificacion: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
    });

  }

  aplicarMascara(tipoImp: string) {

    let validator = Validators.maxLength(100);
    this.idImpuestoPlaceHolder = '';

    switch (true) {
      case tipoImp == 'INM':
        validator = Validators.maxLength(7);
        this.idImpuestoMaxLength = 7;
        this.idImpuestoPlaceHolder = 'Ejemplo "0000000" (7 números)';
        break;
      case tipoImp == 'ROD':
        validator = Validators.maxLength(10);
        this.idImpuestoMaxLength = 10;
        this.idImpuestoPlaceHolder = 'Ejemplo "xx-xxx-xx" (guiones opcionales)';
        break;
      case tipoImp == 'CEC':
        validator = Validators.maxLength(10);
        this.idImpuestoMaxLength = 10;
        this.idImpuestoPlaceHolder = 'Ejemplo "00000000-0" (guion opcional)';
        break;
      case tipoImp == 'COM':
        validator = Validators.maxLength(6);
        this.idImpuestoMaxLength = 6;
        this.idImpuestoPlaceHolder = 'Ejemplo "000000" (6 números)';
        break;
      
    }

    this.form.controls['identificacion'].setValidators(validator);
  }

  get tipoInpuestoInvalid() {
    return this.form.get('tipoImpuesto')?.invalid && this.form.get('tipoImpuesto')?.touched;
  }
  get identificacionInvalid() {
    return this.form.get('identificacion')?.invalid && this.form.get('identificacion')?.touched;
  }


}
