import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtGuard } from './jwt/jwt.guard';
import { RolesGuard } from './roles/roles.guard';
import { Roles } from './roles/roles.decorator';

@Controller('admin')
@UseGuards(JwtGuard, RolesGuard) // JWT first, then roles check
export class AdminController {
  @Roles('ADMIN')
  @Get('dashboard')
  getAdminDashboard(@Req() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    return { message: 'Welcome ADMIN!', user: req.user };
  }
}
