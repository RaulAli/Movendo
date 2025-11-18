import { IsString, IsOptional, IsBoolean, IsIn } from 'class-validator';


export class CreateCategoryDto {
    @IsString()
    nombre: string;


    @IsOptional()
    @IsString()
    descripcion?: string;


    @IsOptional()
    @IsString()
    authorId?: string;


    @IsOptional()
    @IsBoolean()
    isActive?: boolean;


    @IsOptional()
    @IsIn(['draft', 'published', 'archived'])
    status?: string;
}