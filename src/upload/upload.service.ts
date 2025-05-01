import { Injectable } from "@nestjs/common";
import { UploadApiResponse, UploadApiOptions } from "cloudinary";
import { CloudinaryService } from "../cloudinary/cloudinary.service";

@Injectable()
export class UploadService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async uploadBuffer(
    buffer: Buffer,
    folderPath: string,
    options?: UploadApiOptions,
  ): Promise<UploadApiResponse> {
    const uploadOptions: UploadApiOptions = {
      folder: folderPath,
      resource_type: "image",
      ...options,
    };
    return this.cloudinaryService.uploadStream(buffer, uploadOptions);
  }

  async listImages(folderPath: string) {
    return this.cloudinaryService.listResources(folderPath);
  }

  async deleteImage(publicId: string) {
    return this.cloudinaryService.deleteResource(publicId);
  }
}
