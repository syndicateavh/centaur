import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const publicUrl = process.env.LMS_PUBLIC_URL;
  if (!publicUrl && process.env.NODE_ENV === "production") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    ...(publicUrl ? { sitemap: new URL("/sitemap.xml", publicUrl).toString() } : {}),
  };
}
