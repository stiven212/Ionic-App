import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage {
  products = [];
  export = null;
  newProduct = 'My cool product';

  constructor(private databaseService: DatabaseService, public route: Router) {
    this.loadProducts();
   
  }
  



  loadProducts() {
    this.databaseService.getProductList().subscribe(res => {
      this.products = res.values;
      console.log('my products: ', res);
    });
  }

  // Mode is either "partial" or "full"
  async createExport(mode) {
    const dataExport = await this.databaseService.getDatabaseExport(mode);
    console.log('my export: ', dataExport);
    
    this.export = dataExport.export;
  }
 
  async addProduct() {
    await this.databaseService.addDummyProduct(this.newProduct);
    this.newProduct = '';
    this.loadProducts();
  }
 
  async deleteProduct(product) {    
    await this.databaseService.deleteProduct(product.id);
    this.products = this.products.filter(p => p != product);    
  }
 
  // For testing..
  deleteDatabase() {
    this.databaseService.deleteDatabase();
  }

  gotoCalculator(){
    this.route.navigateByUrl('/calculator');
  }
}
