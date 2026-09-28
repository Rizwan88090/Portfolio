import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamMember } from './team-member.entity';
import { TEAM_SEED } from './team.seed';

@Injectable()
export class TeamService implements OnModuleInit {
  private readonly logger = new Logger(TeamService.name);

  constructor(@InjectRepository(TeamMember) private readonly repo: Repository<TeamMember>) {}

  /** Seeds the five founders on first start so /api/team always has data. */
  async onModuleInit() {
    if ((await this.repo.count()) === 0) {
      await this.repo.save(TEAM_SEED);
      this.logger.log(`Seeded ${TEAM_SEED.length} team members`);
    }
  }

  findAll() {
    return this.repo.find({ order: { sortOrder: 'ASC' } });
  }
}
