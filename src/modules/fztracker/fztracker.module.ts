import { Module } from '@nestjs/common';

import { FZtrackerV1Module } from './v1/fztracker-v1.module';

@Module({
  imports: [
    FZtrackerV1Module
  ],
  exports: [
    FZtrackerV1Module
  ]
})
export class FZtrackerModule { }
