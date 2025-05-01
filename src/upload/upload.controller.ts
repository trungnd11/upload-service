import {
  Controller,
  Post,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Get,
  Delete,
} from "@nestjs/common";

import type { MulterModuleOptions } from "@nestjs/platform-express";
import { FileInterceptor } from "@nestjs/platform-express";

import { memoryStorage } from "multer";
import type { Express } from "express";

import { UploadService } from "./upload.service";

@Controller("upload")
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post(":service/:folder")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(new BadRequestException("Chỉ hỗ trợ JPG/PNG"), false);
        }
        cb(null, true);
      },
    } as MulterModuleOptions),
  )
  async uploadDynamic(
    @Param("service") service: string,
    @Param("folder") folder: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException("Vui lòng gửi kèm file ảnh");
    }

    const folderPath = `${service}/${folder}`;

    const result = await this.uploadService.uploadBuffer(
      file.buffer,
      folderPath,
    );

    return {
      public_id: result.public_id,
      url: result.secure_url,
      folder: folderPath,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  }

  @Get(":service/:folder")
  async listImages(
    @Param("service") service: string,
    @Param("folder") folder: string,
  ): Promise<any> {
    const prefix = `${service}/${folder}`;
    const resources = await this.uploadService.listImages(prefix);

    return resources.map((r) => ({
      public_id: r.public_id,
      url: r.secure_url,
      width: r.width,
      height: r.height,
      format: r.format,
    }));
  }

  @Delete(":service/:folder/:publicId")
  async deleteImage(
    @Param("service") service: string,
    @Param("folder") folder: string,
    @Param("publicId") publicId: string,
  ): Promise<any> {
    const fullId = `${service}/${folder}/${publicId}`;
    const res = await this.uploadService.deleteImage(fullId);

    return { deleted: res.result === "ok" };
  }
}
