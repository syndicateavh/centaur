import { CAREER_TRACKS, PROGRAM } from './sourceContent.js';

const pageTrackIds = [
  'investment-banking-operations',
  'retail-banking',
  'finance-operations',
];

export const COURSE_DATA = Object.freeze(
  Object.fromEntries(
    CAREER_TRACKS.filter((track) => pageTrackIds.includes(track.id)).map((track) => [
      track.id,
      Object.freeze({
        ...track,
        seoId: track.id,
        programName: PROGRAM.name,
      }),
    ]),
  ),
);

export function getCourseData(id) {
  const course = COURSE_DATA[id];
  if (!course) throw new Error(`Unknown career track id: ${id}`);
  return course;
}
