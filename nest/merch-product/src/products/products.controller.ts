import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';


@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }
    slug?: string;


    @Post()
    create(@Body() dto: CreateProductDto) {
        return this.productsService.create(dto);
    }


    @Get()
    findAll(@Query('skip') skip?: number, @Query('take') take?: number) {
        return this.productsService.findAll(Number(skip) || 0, Number(take) || 20);
    }

    @Get('/user/:user')
    findAll_user(@Param('user') user: string, @Query('skip') skip?: number, @Query('take') take?: number) {
        return this.productsService.findAll_user(user, Number(skip) || 0, Number(take) || 20);
    }


    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.productsService.findOne(id);
    }


    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
        return this.productsService.update(id, dto);
    }


    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.productsService.remove(id);
    }
}