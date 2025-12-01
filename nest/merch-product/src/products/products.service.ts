import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import slugify from 'slugify';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';


@Injectable()
export class ProductsService {
    constructor(
        private prisma: PrismaService,
        private httpService: HttpService
    ) { }


    async validateCategory(categoryId: string) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`${process.env.CATEGORIES_URL || 'http://localhost:3001'}/categories/${categoryId}`)
            );
            return response.data;
        } catch (e) {
            throw new BadRequestException('Category does not exist');
        }
    }

    async create(dto: CreateProductDto) {
        if (dto.categoryId) await this.validateCategory(dto.categoryId);
        const slug = slugify(dto.name, { lower: true });
        return this.prisma.product.create({ data: { ...dto, slug } as any });
    }


    async findAll(skip = 0, take = 20) {
        return this.prisma.product.findMany({ skip, take });
    }

    async findAll_user(user: string, skip = 0, take = 20) {
        return this.prisma.product.findMany({
            where: {
                authorId: user
            },
            skip,
            take
        });
    }


    async findOne(id: string) {
        const p = await this.prisma.product.findUnique({ where: { id } });
        if (!p) throw new NotFoundException('Product not found');
        return p;
    }


    async update(id: string, dto: UpdateProductDto) {
        const updateData: Partial<UpdateProductDto> & { slug?: string } = { ...dto };

        if (dto.name) {
            updateData.slug = slugify(dto.name, { lower: true });
        }

        return this.prisma.product.update({
            where: { id },
            data: updateData,
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.product.delete({ where: { id } });
    }

    async assignToEvent(): Promise<{ id_merchant: string[] }> {
        const whereClause: any = { isActive: true };

        const allProducts = await this.prisma.product.findMany({ where: whereClause });
        if (allProducts.length === 0) return { id_merchant: [] };

        const shuffled = [...allProducts];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        const selected = shuffled.slice(0, 2);
        const merchantIds = selected.map(p => p.id);

        return { id_merchant: merchantIds };
    }

}