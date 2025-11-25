import { IsString, IsOptional, IsBoolean, IsIn } from 'class-validator';

export class CreateCategoryDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    desc?: string;

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
