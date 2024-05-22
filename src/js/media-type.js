import {IMAGE_MEDIA_TYPES} from "./image-media-types.js";

const isImageMediaType = (mediaType) => IMAGE_MEDIA_TYPES.includes(mediaType);

export {isImageMediaType};
