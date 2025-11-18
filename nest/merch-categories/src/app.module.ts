import { Module } from '@nestjs/common';
import { CategoriesModule } from './category/category.module';


@Module({
    imports: [CategoriesModule]
})
export class AppModule { }