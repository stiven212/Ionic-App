import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';


@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.page.html',
  styleUrls: ['./calculator.page.scss'],
})
export class CalculatorPage implements OnInit {

  constructor( public nav:NavController) { }
  total = 0;
  precio = 0;
  nombre ='';


  nextpage() {
   
    this.nav.navigateForward('calculator');
  }
  
  
  ngOnInit() {
  }

  addproduct(precio){
    this.total = this.total + parseInt( precio );
    this.precio = 0;
    this.nombre = '';
  }

  

}
