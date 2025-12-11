import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service'; // make sure you have PrismaService

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService, // for DB access
    private jwt: JwtService, // for signing tokens
  ) {}

  // ---------------------
  // SIGNUP
  // ---------------------
  async signup(dto: { email: string; password: string; name: string }) {
    // hash password
    const hashed = await bcrypt.hash(dto.password, 10);

    // create user in DB
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        name: dto.name,
        role: 'GUEST', // default role
      },
    });

    return user;
  }

  // ---------------------
  // LOGIN
  // ---------------------
  async login(dto: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches)
      throw new UnauthorizedException('Invalid credentials');

    const accessToken = this.jwt.sign({ sub: user.id, role: user.role });

    return { access_token: accessToken };
  }
}
