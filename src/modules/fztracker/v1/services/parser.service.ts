import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import { CsvParser } from 'nest-csv-parser';
import { EntityImportModel } from '../models/entity.model';


@Injectable()
export class ParseService {
  constructor(
    private readonly csvParser: CsvParser, private readonly logger: Logger) { }

  async parseEntities(filename: string, headers: string[], separator: string) {
    const encoding = 'UTF-8';

    const stream = fs.createReadStream(filename, encoding);

    const data = await this.csvParser.parse(stream, EntityImportModel, null, null, {
      encoding,
      separator,
      mapHeaders: ({ header, index }) => {
        return headers[index];
      },
    });

    return data;
  }
}
