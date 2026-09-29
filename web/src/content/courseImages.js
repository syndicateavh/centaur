import { createImageSources } from '../lib/imagePresets.js';

const COURSE_IMAGE_WIDTHS = Object.freeze([480, 768, 1280]);

function createCourseImage(id) {
  const basePath = `/images/courses/${id}`;

  return Object.freeze({
    alt: '',
    height: 1024,
    sources: Object.freeze(createImageSources({
      basePath,
      widths: COURSE_IMAGE_WIDTHS,
    }).map(Object.freeze)),
    src: `${basePath}.jpg`,
    width: 1536,
  });
}

export const COURSE_TRACK_IMAGES = Object.freeze({
  'investment-banking-operations': createCourseImage('investment-banking-operations'),
  'retail-banking': createCourseImage('retail-banking'),
  'kyc-aml-compliance': createCourseImage('kyc-aml-compliance'),
  'digital-payments': createCourseImage('digital-payments'),
  'finance-operations': createCourseImage('finance-operations'),
  'fintech-neo-banking': createCourseImage('fintech-neo-banking'),
});

export function getCourseTrackImage(id) {
  const image = COURSE_TRACK_IMAGES[id];
  if (!image) throw new Error(`Unknown course-track image: ${id}`);
  return image;
}
