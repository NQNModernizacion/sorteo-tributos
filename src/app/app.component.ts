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
  isLoading: boolean = false;

  mensaje: string = '';
  numero: number = 0;
  showMensaje: boolean = false;

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

      this.isLoading = true;
      this.impuesto = new Impuesto();

      this.impuesto.tipoImpuesto = this.form.controls['tipoImpuesto'].value;
      this.impuesto.identificacion = this.form.controls['identificacion'].value.split('-').join('');

      // Quito espacios en blanco
      this.impuesto.identificacion = this.impuesto.identificacion.replace(/\s/g, '');

      if (this.impuesto.tipoImpuesto == 'ROD')
        this.impuesto.identificacion = this.impuesto.identificacion.toUpperCase();
      

      this.sorteoService.getNumero(this.impuesto).subscribe({
        next: (resp: any) => {
          if (resp > 0) {
            this.numero = resp;
            this.mensaje = `Tu número de sorteo es ${resp}`;
          }
          else {
            this.mensaje = `No estas participando del sorteo. Participan todos los tributos que no poseen deuda al 30 de junio del 2025.`;
          }

          this.isLoading = false;
        },
        error: err => {
          this.mensaje = 'Porfavor aguarde unos minutos y vuelva a consultar';
          this.isLoading = false;
        }, 
        complete: () => this.isLoading = false
      })
    }

  }

  createForm() {

    this.form = this.formBuilder.nonNullable.group({
      tipoImpuesto: ['', [Validators.required]],
      identificacion: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
    });

  }

  // se dispara en el evento change de Tipo de tributo
  aplicarMascara(tipoImp: string) {

    let validator = Validators.maxLength(100);
    this.idImpuestoPlaceHolder = '';
    this.form.controls['identificacion'].reset();
    this.mensaje = '';

    switch (true) {
      case tipoImp == 'INM':
        validator = Validators.maxLength(7);
        this.idImpuestoMaxLength = 7;
        this.idImpuestoPlaceHolder = 'Ejemplo "0000000" (7 números)';
        this.showMensaje = false;
        break;
      case tipoImp == 'ROD':
        validator = Validators.maxLength(10);
        this.idImpuestoMaxLength = 10;
        this.idImpuestoPlaceHolder = 'Ejemplo "aa-111-aa" (guiones opcionales)';
        this.showMensaje = true;
        break;
      case tipoImp == 'CEC':
        validator = Validators.maxLength(10);
        this.idImpuestoMaxLength = 10;
        this.idImpuestoPlaceHolder = 'Ejemplo "00000000-0" (guion opcional)';
        this.showMensaje = false;
        break;
      case tipoImp == 'COM':
        validator = Validators.maxLength(6);
        this.idImpuestoMaxLength = 6;
        this.idImpuestoPlaceHolder = 'Ejemplo "000000" (6 números)';
        this.showMensaje = false;
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
