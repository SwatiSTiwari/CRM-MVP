import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
  chat(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes('pipeline')) {
      return 'Your pipeline currently has leads across all stages. Check the Dashboard for a snapshot.';
    }
    if (lower.includes('task') || lower.includes('todo')) {
      return 'You can view and manage your tasks in the Tasks page.';
    }
    if (lower.includes('lead')) {
      return 'Head over to the Leads page to create, search, and manage leads.';
    }
    if (lower.includes('meeting')) {
      return 'You can schedule meetings from any lead detail page.';
    }
    return "I'm your CRM assistant. I can help with leads, tasks, meetings, and pipeline questions.";
  }

  draftEmail(context: { leadName: string; purpose?: string }): string {
    return `Subject: Following up, ${context.leadName}\n\nHi ${context.leadName},\n\nI hope this message finds you well. I wanted to follow up and see if you had any questions or needed assistance with the next steps.\n\nBest regards,\nYour Name`;
  }

  summarizeCall(): string {
    return 'AI-generated summary: The call covered product interest, next steps were discussed, and a follow-up meeting was suggested.';
  }
}
