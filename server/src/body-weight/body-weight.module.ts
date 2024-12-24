import { Module } from '@nestjs/common';
import { BodyWeightController } from './body-weight.controller';
import { BodyWeightService } from './body-weight.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BodyWeight, BodyWeightSchema } from './model/body-weight.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: BodyWeight.name, schema: BodyWeightSchema }])],
  controllers: [BodyWeightController],
  providers: [BodyWeightService],
})
export class BodyWeightModule {}
