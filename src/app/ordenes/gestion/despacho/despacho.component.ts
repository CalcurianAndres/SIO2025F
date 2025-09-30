import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-despacho',
  templateUrl: './despacho.component.html',
  styleUrls: ['./despacho.component.css']
})
export class DespachoComponent implements OnInit {

  @Input() despacho:any
  @Output() onCloseModal = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  onClose(){
    this.despacho = false;
    this.onCloseModal.emit();
  }

}
