import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('today')
  async today(@Request() req: { user: { userId: string } }) {
    return this.dashboardService.getToday(req.user.userId);
  }

  @Get('pipeline')
  async pipeline(@Request() req: { user: { userId: string } }) {
    return this.dashboardService.getPipeline(req.user.userId);
  }
}
