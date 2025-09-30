import { Component, OnInit, Input, Output,EventEmitter } from '@angular/core';

@Component({
  selector: 'app-vista-despachos',
  templateUrl: './vista-despachos.component.html',
  styleUrls: ['./vista-despachos.component.css']
})
export class VistaDespachosComponent implements OnInit {

  constructor() { }

  @Input() Despachos:any;
  @Input() despachos = [];
  @Output() onCloseModal = new EventEmitter()

  ngOnInit(): void {
  }

}
