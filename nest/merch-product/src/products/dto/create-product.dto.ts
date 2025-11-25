import { IsString, IsOptional, IsNumber, IsInt, IsBoolean, IsIn } from 'class-validator';


export class CreateProductDto {
    @IsString()
    brand!: string;


    @IsString()
    name!: string;


    @IsOptional()
    @IsString()
    desc?: string;


    @IsNumber()
    price!: number;


    @IsInt()
    stock!: number;


    @IsOptional()
    @IsString({ each: true })
    images?: string[];



    @IsOptional()
    @IsString()
    categoryId?: string;


    @IsString()
    authorId!: string;


    @IsOptional()
    @IsBoolean()
    isActive?: boolean;


    @IsOptional()
    @IsIn(['draft', 'published', 'archived'])
    status?: string;
}