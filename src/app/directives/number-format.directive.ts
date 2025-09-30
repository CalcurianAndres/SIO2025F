import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appNumberFormat]'
})
export class NumberFormatDirective {
  private el: HTMLInputElement;

  constructor(private elementRef: ElementRef<HTMLInputElement>) {
    this.el = elementRef.nativeElement;
    this.el.type = 'text';
    this.el.inputMode = 'decimal';
  }

  @HostListener('input', ['$event'])
  onInput() {
    let value = this.el.value;

    // quitar todo lo que no sea número, punto o coma
    value = value.replace(/[^0-9,\.]/g, '');

    // normalizar: "." -> ","
    value = value.replace(/\./g, ',');

    // separar entero y decimal
    const parts = value.split(',');
    let integerPart = parts[0].replace(/^0+(?!$)/, '');
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    this.el.value = parts[1] ? `${integerPart},${parts[1]}` : integerPart;
  }
}
