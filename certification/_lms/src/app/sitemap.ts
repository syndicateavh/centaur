import type { MetadataRoute } from "next";
import { courseTracks } from "@/data/courses";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const publicUrl = process.env.LMS_PUBLIC_URL;
  if (!publicUrl) return [];

  const publicPages = ["/", "/courses", "/faq", "/help"];
  const coursePages = courseTracks.map((course) => `/courses/${course.slug}`);
  return [...publicPages, ...coursePages].map((path) => ({
    url: new URL(path, publicUrl).toString(),
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : path === "/courses" ? 0.9 : 0.7,
  }));
}
