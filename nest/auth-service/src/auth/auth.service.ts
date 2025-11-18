import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService) { }

    async register(dto: RegisterDto) {
        // 1. Comprobar si ya existen username o email
        const existingUser = await this.prisma.merchantUser.findFirst({
            where: {
                OR: [
                    { email: dto.email },
                    { username: dto.username },
                ],
            },
        });

        if (existingUser) {
            throw new BadRequestException('El email o username ya está en uso');
        }

        // 2. Hashear contraseña
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        // 3. Crear usuario
        const user = await this.prisma.merchantUser.create({
            data: {
                username: dto.username,
                email: dto.email,
                password: hashedPassword,
                image: dto.image,
                // status, isActive, createdAt, updatedAt usan los defaults del modelo
            },
            // opcional: para no devolver el password
            select: {
                id: true,
                username: true,
                email: true,
                image: true,
                isActive: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return user;
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.merchantUser.findFirst({
            where: {
                OR: [
                    { email: dto.email }
                ],
            },
        });

        if (!user) {
            throw new BadRequestException('El email no existe');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.password);

        if (!isPasswordValid) {
            throw new BadRequestException('La contraseña es incorrecta');
        }

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            image: user.image,
            isActive: user.isActive,
            status: user.status,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
