import { Test, TestingModule } from '@nestjs/testing';
import { GymTicketController } from './gym-ticket.controller';

describe('GymTicketController', () => {
  let controller: GymTicketController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GymTicketController],
    }).compile();

    controller = module.get<GymTicketController>(GymTicketController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
