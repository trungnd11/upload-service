import { v2 as Cloudinary } from "cloudinary";

export type RawListResources = Awaited<
  ReturnType<typeof Cloudinary.api.resources>
>;
export type ResourcesArray = RawListResources["resources"];
