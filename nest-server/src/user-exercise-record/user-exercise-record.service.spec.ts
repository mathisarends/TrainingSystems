import { Test, TestingModule } from '@nestjs/testing';
import { UserExerciseRecordService } from './user-exercise-record.service';

describe('UserExerciseRecordService', () => {
  let service: UserExerciseRecordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserExerciseRecordService],
    }).compile();

    service = module.get<UserExerciseRecordService>(UserExerciseRecordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
