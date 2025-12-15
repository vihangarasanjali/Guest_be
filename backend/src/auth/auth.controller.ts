import {
  Controller,
  Get,
  UseGuards,
  Req,
  Post,
  Body,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtGuard } from './jwt/jwt.guard';
import { JwtService } from '@nestjs/jwt';
import { Roles } from './roles/roles.decorator';
import { RolesGuard } from './roles/roles.guard';
import * as requestUserType from 'src/types/request-user.type';

@Controller('auth')
export class AuthController {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  @Post('signup')
  async signup(
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
      role?: string;
    },
  ) {
    const { name, email, password, role } = body;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return { message: 'User already exists' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'GUEST',
      },
    });

    return {
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const { email, password } = body;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({ sub: user.id, role: user.role });

    return {
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role, // <-- include role here
      },
    };
  }

  @UseGuards(JwtGuard)
  @Get('profile')
  getProfile(@Req() req: Request): requestUserType.RequestUser {
    return req.user as requestUserType.RequestUser;
  }

  // Example route restricted to ADMIN only
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin-data')
  getAdminData() {
    return { secret: 'Only admins can see this' };
  }
}
