import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {

  constructor(

    private readonly productsService: ProductsService

  ) {}
  
  async runSeed() {

    return await this.insertNewProducts();

  }

  private async insertNewProducts() {

    await this.productsService.deleteAllProducts();

    const products = initialData.products;

    const insertPromise = [];

    products.forEach( product => {

      insertPromise.push( this.productsService.create( product ) );

    });

    await Promise.all( insertPromise );
        
    return { ok: true, msg: 'Seed Executed'};

  }

}
