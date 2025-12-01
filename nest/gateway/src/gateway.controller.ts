import { Controller, Get, Post, Put, Delete, Body, Param, Req, HttpException, HttpStatus } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { Request } from 'express';

@Controller()
export class GatewayController {
    constructor(private gatewayService: GatewayService) { }

    @Post('merchant/login')
    async login(@Body() body: any, @Req() req: Request) {
        return this.gatewayService.proxyPost(`${process.env.AUTH_URL}/auth/login`, body, req);
    }

    @Post('merchant/register')
    async register(@Body() body: any, @Req() req: Request) {
        return this.gatewayService.proxyPost(`${process.env.AUTH_URL}/auth/register`, body, req);
    }

    @Post('merchant/refresh')
    async refresh(@Body() body: any, @Req() req: Request) {
        return this.gatewayService.proxyPost(`${process.env.AUTH_URL}/auth/refresh`, body, req);
    }

    @Post('merchant/logout')
    async logout(@Body() body: any, @Req() req: Request) {
        return this.gatewayService.proxyPost(`${process.env.AUTH_URL}/auth/logout`, body, req);
    }

    @Get('categories')
    async getAllCategories(@Req() req: Request) {
        const url = `${process.env.CATEGORIES_URL}/categories`;
        return this.gatewayService.proxyGet(url, req);
    }

    @Get('categories/:id')
    async getCategory(@Param('id') id: string, @Req() req: Request) {
        return this.gatewayService.proxyGet(`${process.env.CATEGORIES_URL}/categories/${id}`, req);
    }

    @Get('categories/user/:user')
    async getCategoryUser(@Param('user') user: string, @Req() req: Request) {
        return this.gatewayService.proxyGet(`${process.env.CATEGORIES_URL}/categories/user/${user}`, req);
    }

    @Post('categories')
    async createCategory(@Body() body: any, @Req() req: Request) {
        return this.gatewayService.proxyPost(`${process.env.CATEGORIES_URL}/categories`, body, req);
    }

    @Put('categories/:id')
    async updateCategory(@Param('id') id: string, @Body() body: any, @Req() req: Request) {
        return this.gatewayService.proxyPut(`${process.env.CATEGORIES_URL}/categories/${id}`, body, req);
    }

    @Delete('categories/:id')
    async deleteCategory(@Param('id') id: string, @Req() req: Request) {
        return this.gatewayService.proxyDelete(`${process.env.CATEGORIES_URL}/categories/${id}`, req);
    }

    //Products
    @Get('products')
    async getAllProduct(@Req() req: Request) {
        return this.gatewayService.proxyGet(`${process.env.PRODUCTS_URL}/products`, req);
    }

    @Get('products/user/:user')
    async getProduct_User(@Param('user') user: string, @Req() req: Request) {
        return this.gatewayService.proxyGet(`${process.env.PRODUCTS_URL}/products/user/${user}`, req);
    }

    @Get('products/:id')
    async getProduct(@Param('id') id: string, @Req() req: Request) {
        return this.gatewayService.proxyGet(`${process.env.PRODUCTS_URL}/products/${id}`, req);
    }

    @Post('products')
    async createProduct(@Body() body: any, @Req() req: Request) {
        return this.gatewayService.proxyPost(`${process.env.PRODUCTS_URL}/products`, body, req);
    }

    @Put('products/:id')
    async updateProduct(@Param('id') id: string, @Body() body: any, @Req() req: Request) {
        return this.gatewayService.proxyPut(`${process.env.PRODUCTS_URL}/products/${id}`, body, req);
    }

    @Delete('products/:id')
    async deleteProduct(@Param('id') id: string, @Req() req: Request) {
        return this.gatewayService.proxyDelete(`${process.env.PRODUCTS_URL}/products/${id}`, req);
    }

    @Get('hola')
    async gethola(@Req() req: Request) {
        return this.gatewayService.proxyGet(`${process.env.PRODUCTS_URL}/products/hola`, req);
    }


}

//Rutas de Entrada
