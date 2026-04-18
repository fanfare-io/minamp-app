export const DEFAULT_ASSET_SCALE = 2;
export const SUPPORTED_SCALES = [2, 3] as const;
export type AssetScale = typeof SUPPORTED_SCALES[number];
export const FORMAT_VERSION = 1;
export const MSZ_EXTENSION = ".msz";
export const GUIDES_GROUP_NAME = "Guides";
export const ARTWORK_GROUP_NAME = "Artwork";
export const SCALE_PLUGIN_DATA_KEY = "assetScale";
