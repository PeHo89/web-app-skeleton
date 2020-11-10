import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

  addFile(path: string, filenameWithExtension: string, data: Buffer): void {
    const fullPath = `${process.env.DATA_PATH}/${path}`;

    fs.mkdirSync(fullPath, { recursive: true });

    fs.writeFile(`${fullPath}/${filenameWithExtension}`, data, (error) => {
      if (error) {
        this.logger.error(
          `Failed uploading file '${filenameWithExtension}' to '${fullPath}'`,
        );
      } else {
        this.logger.log(
          `Successfully uploaded file '${filenameWithExtension}' to '${fullPath}'`,
        );
      }
    });
  }

  async getFile(
    path: string,
    filenameWithoutExtension: string,
  ): Promise<string | null> {
    const fullPath = `${process.env.DATA_PATH}/${path}`;

    const filesInPath = fs.readdirSync(fullPath);

    for (const file of filesInPath) {
      if (file.includes(filenameWithoutExtension)) {
        return fs.readFileSync(`${fullPath}/${file}`).toString('base64');
      }
    }
    return null;
  }

  async deleteFile(
    path: string,
    filenameWithoutExtension: string,
  ): Promise<void> {
    const fullPath = `${process.env.DATA_PATH}/${path}`;

    const filesInPath = fs.readdirSync(fullPath);

    for (const file of filesInPath) {
      if (file.includes(filenameWithoutExtension)) {
        fs.unlinkSync(`${fullPath}/${file}`);
        break;
      }
    }
  }
}
