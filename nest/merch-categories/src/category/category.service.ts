import { BadRequestException, NotFoundException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import slugify from 'slugify';
import { ObjectId } from 'bson';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    private ensureValidObjectId(id: string) {
        if (!ObjectId.isValid(id)) {
            throw new BadRequestException(`ID inválido: ${id}`);
        }
    }

    async create(dto: CreateCategoryDto) {
        const slug = slugify(dto.name, { lower: true });
        try {
            return await this.prisma.category.create({
                data: { ...dto, slug } as any
            });
        } catch (e) {
            throw new BadRequestException('No se pudo crear la categoría (slug duplicado?)');
        }
    }

    async findAll(skip = 0, take = 50) {
        return this.prisma.category.findMany({ skip, take });
    }

    async findAll_User(user: string, skip = 0, take = 50) {
        return this.prisma.category.findMany({
            where: { authorId: user },
            skip,
            take
        });
    }

    async findOne(id: string) {
        this.ensureValidObjectId(id);
        const c = await this.prisma.category.findUnique({ where: { id } });
        if (!c) throw new NotFoundException('Categoría no encontrada');
        return c;
    }

    async update(id: string, dto: UpdateCategoryDto) {
        this.ensureValidObjectId(id);

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
            throw new BadRequestException('Error al actualizar la categoría');
        }
    }

    async remove(id: string) {
        this.ensureValidObjectId(id);
        await this.findOne(id);
        return this.prisma.category.delete({ where: { id } });
    }
}
