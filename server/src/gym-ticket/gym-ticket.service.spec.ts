import { Test, TestingModule } from '@nestjs/testing';
import { GymTicketService } from './gym-ticket.service';

describe('GymTicketService', () => {
  let service: GymTicketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GymTicketService],
    }).compile();

    service = module.get<GymTicketService>(GymTicketService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
