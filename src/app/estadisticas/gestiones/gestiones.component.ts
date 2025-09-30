import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-gestiones',
  templateUrl: './gestiones.component.html',
  styleUrls: ['./gestiones.component.css']
})
export class GestionesComponent implements OnInit {

  @Input() modal_gestiones:any
  @Input() g_trabajos:any
  @Input() g_gestiones:any

  @Output() onCloseModal = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  closemodal(){
    this.onCloseModal.emit();
  }

}
