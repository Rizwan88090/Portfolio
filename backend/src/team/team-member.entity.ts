import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('team_members')
export class TeamMember {
  @PrimaryColumn({ length: 60 })
  slug: string;

  @Column({ length: 120 })
  name: string;

  @Column({ length: 160 })
  role: string;

  @Column({ type: 'text' })
  bio: string;

  @Column('text', { array: true })
  skills: string[];

  @Column({ type: 'int', default: 5 })
  experienceYears: number;

  @Column({ length: 200 })
  image: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;
}
