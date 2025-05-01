import { Injectable, Inject } from "@nestjs/common";
import {
  v2 as Cloudinary,
  UploadApiResponse,
  UploadApiOptions,
} from "cloudinary";
import { Readable } from "stream";
import { CloudModuleNameEnum } from "./enums/cloud.module.name.enum";
import { ResourcesArray } from "./interfaces/cloud.resource.interface";

type DestroyResult = Awaited<ReturnType<typeof Cloudinary.uploader.destroy>>;

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject(CloudModuleNameEnum.CLOUDINARY)
    private readonly cloudinaryClient: typeof Cloudinary,
  ) {}

  async uploadStream(
    buffer: Buffer,
    options?: UploadApiOptions,
  ): Promise<UploadApiResponse> {
    const stream = Readable.from(buffer);

    return new Promise<UploadApiResponse>((resolve, reject) => {
      const upload = this.cloudinaryClient.uploader.upload_stream(
        options,
        (err, result) => {
          if (err) {
            return reject(err);
          }
          if (!result) {
            return reject(
              new Error("Cloudinary upload failed: no result returned"),
            );
          }
          resolve(result);
        },
      );
      stream.pipe(upload);
    });
  }

  async listResources(
    prefix: string,
    maxResults = 100,
  ): Promise<ResourcesArray> {
    const res = await this.cloudinaryClient.api.resources({
      type: "upload",
      prefix,
      max_results: maxResults,
    });
    return res.resources;
  }

  async deleteResource(publicId: string): Promise<DestroyResult> {
    return this.cloudinaryClient.uploader.destroy(publicId, {
      invalidate: true,
    });
  }
}
