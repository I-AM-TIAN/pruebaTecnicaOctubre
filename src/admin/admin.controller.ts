import { Controller, Get, Query, Logger, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Role } from '@prisma/client';
import { Auth } from '../auth/decorators/auth.decorator';

@Controller('users')
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(private readonly adminService: AdminService) {}

  /**
   * GET /users?role=doctor|patient&page=1&limit=10
   * Solo accesible por Admin
   */
  @Get()
  @Auth(Role.admin)
  async getUsers(
    @Query('role') role?: Role,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    this.logger.log(`GET /users - role: ${role}, page: ${page}, limit: ${limit}`);
    return this.adminService.getUsers(role, page, limit);
  }
}
