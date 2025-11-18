import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CategoriesService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';


@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }


    @Post()
    create(@Body() dto: CreateCategoryDto) {
        return this.categoriesService.create(dto);
    }


    @Get()
    findAll(@Query('skip') skip?: number, @Query('take') take?: number) {
        return this.categoriesService.findAll(Number(skip) || 0, Number(take) || 50);
    }


    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.categoriesService.findOne(id);
    }


    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
        return this.categoriesService.update(id, dto);
    }


    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.categoriesService.remove(id);
    }
}