import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import slugify from 'slugify';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';


@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }


    async create(dto: CreateCategoryDto) {
        const slug = slugify(dto.name, { lower: true });
        try {
            return await this.prisma.category.create({ data: { ...dto, slug } as any });
        } catch (e) {
            throw new BadRequestException('Could not create category');
        }
    }


    async findAll(skip = 0, take = 50) {
        return this.prisma.category.findMany({ skip, take });
    }

    async findAll_User(user: string, skip = 0, take = 50) {
        return this.prisma.category.findMany({
            where: {
                authorId: user
            },
            skip,
            take
        });
    }

    async findOne(id: string) {
        const c = await this.prisma.category.findUnique({ where: { id } });
        if (!c) throw new NotFoundException('Category not found');
        return c;
    }


    async update(id: string, dto: UpdateCategoryDto) {
        const updateData: any = { ...dto };

        if (dto.name) {
            updateData.slug = slugify(dto.name, { lower: true });
        }

        updateData.updatedAt = new Date();

        try {
            return await this.prisma.category.update({
                where: { id },
                data: updateData,
            });
        } catch (e: any) {
            console.error('Error updating category:', e);
            throw e;
        }
    }




    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.category.delete({ where: { id } });
    }
}