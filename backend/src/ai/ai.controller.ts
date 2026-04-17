import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class ChatDto {
  @IsString()
  message: string;
}

class DraftEmailDto {
  @IsString()
  leadName: string;

  @IsOptional()
  @IsString()
  purpose?: string;
}

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(@Body() body: ChatDto) {
    return { reply: this.aiService.chat(body.message) };
  }

  @Post('draft-email')
  async draftEmail(@Body() body: DraftEmailDto) {
    return { draft: this.aiService.draftEmail(body) };
  }

  @Post('summarize-call')
  async summarizeCall() {
    return { summary: this.aiService.summarizeCall() };
  }
}
