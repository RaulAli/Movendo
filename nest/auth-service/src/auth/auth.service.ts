import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

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

        const tokens = await this.generateTokens(user.id, user.username, user.email, 'merchant');
        await this.updateRefreshToken(user.id, tokens.refreshToken);


        return {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                image: user.image,
                isActive: user.isActive,
                status: user.status,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
            ...tokens,
        };
    }

    async generateTokens(userId: string, username: string, email: string, role: string) {
        const payload = { sub: userId, username, email, role };
        const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '15m' }); // Short-lived
        const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '7d' }); // Long-lived
        return { accessToken, refreshToken };
    }

    async updateRefreshToken(userId: string, refreshToken: string) {
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        await this.prisma.merchantUser.update({
            where: { id: userId },
            data: { refreshToken: hashedRefreshToken },
        });
    }

    async logout(userId: string) {
        return this.prisma.merchantUser.update({
            where: { id: userId },
            data: { refreshToken: null },
        });
    }

    async refreshTokens(refreshToken: string) {
        try {
            const { sub: userId, username, email, role } = await this.jwtService.verifyAsync(refreshToken);

            const user = await this.prisma.merchantUser.findUnique({
                where: { id: userId },
            });

            if (!user || !user.refreshToken) {
                throw new UnauthorizedException('Access Denied');
            }

            const refreshTokenMatches = await bcrypt.compare(
                refreshToken,
                user.refreshToken,
            );

            if (!refreshTokenMatches) {
                throw new UnauthorizedException('Access Denied');
            }

            const tokens = await this.generateTokens(user.id, user.username, user.email, 'merchant');
            await this.updateRefreshToken(user.id, tokens.refreshToken);

            return tokens;
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }
    }
}
