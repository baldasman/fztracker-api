import { ApiProperty } from '@nestjs/swagger';

export class CreatedSuccessResponseModel {
  @ApiProperty({ enum: [201] }) resultCode: number;
  @ApiProperty({ enum: ['unix timestamp'] }) resultTimestamp: number;
  @ApiProperty({ enum: ['Created'] }) resultMessage: string;
}
