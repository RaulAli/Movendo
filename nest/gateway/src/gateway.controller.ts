import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { GatewayService } from './gateway.service';

@Controller()
export class GatewayController {
    constructor(private gatewayService: GatewayService) { }

    @Get('categories')
    async getAllCategories() {
        const url = `${process.env.CATEGORIES_URL}/categories`;
        return this.gatewayService.proxyGet(url);
    }

    @Get('categories/:id')
    async getCategory(@Param('id') id: string) {
        return this.gatewayService.proxyGet(`${process.env.CATEGORIES_URL}/categories/${id}`);
    }

    @Post('categories')
    async createCategory(@Body() body: any) {
        return this.gatewayService.proxyPost(`${process.env.CATEGORIES_URL}/categories`, body);
    }

    @Put('categories/:id')
    async updateCategory(@Param('id') id: string, @Body() body: any) {
        return this.gatewayService.proxyPut(`${process.env.CATEGORIES_URL}/categories/${id}`, body);
    }

    @Delete('categories/:id')
    async deleteCategory(@Param('id') id: string) {
        return this.gatewayService.proxyDelete(`${process.env.CATEGORIES_URL}/categories/${id}`);
    }

    //Products
    @Get('products')
    async getAllProduct() {
        return this.gatewayService.proxyGet(`${process.env.PRODUCTS_URL}/products`);
    }

    @Get('products/:id')
    async getProduct(@Param('id') id: string) {
        return this.gatewayService.proxyGet(`${process.env.PRODUCTS_URL}/products/${id}`);
    }

    @Post('products')
    async createProduct(@Body() body: any) {
        return this.gatewayService.proxyPost(`${process.env.PRODUCTS_URL}/products`, body);
    }

    @Put('products/:id')
    async updateProduct(@Param('id') id: string, @Body() body: any) {
        return this.gatewayService.proxyPut(`${process.env.PRODUCTS_URL}/products/${id}`, body);
    }

    @Delete('products/:id')
    async deleteProduct(@Param('id') id: string) {
        return this.gatewayService.proxyDelete(`${process.env.PRODUCTS_URL}/products/${id}`);
    }


}

//Rutas de Entrada
