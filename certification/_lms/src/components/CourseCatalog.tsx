"use client";

import { useMemo, useState } from "react";
import CourseCard from "@/components/CourseCard";
import type { CourseTrack } from "@/data/courses";

const categories = ["All areas", "Banking operations", "Capital markets", "Digital finance", "Financial crime operations", "Finance operations", "Payments"];

export default function CourseCatalog({ courses }: { courses: CourseTrack[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All areas");

  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return courses.filter((course) => {
      const matchesCategory = category === "All areas" || course.category === category;
      const searchableText = [course.title, course.category, course.description, ...course.intendedRoles].join(" ").toLocaleLowerCase();
      return matchesCategory && (!normalizedQuery || searchableText.includes(normalizedQuery));
    });
  }, [category, courses, query]);

  return (
    <>
      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_16rem] sm:p-5">
        <div>
          <label htmlFor="course-search" className="mb-2 block text-sm font-bold text-slate-800">Search by course or role</label>
          <input
            id="course-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="For example, KYC analyst"
            className="form-control w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 placeholder:text-slate-500"
          />
        </div>
        <div>
          <label htmlFor="course-category" className="mb-2 block text-sm font-bold text-slate-800">Learning area</label>
          <select
            id="course-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="form-control w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950"
          >
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {filteredCourses.length} {filteredCourses.length === 1 ? "proposed track" : "proposed tracks"} found.
      </p>
      {filteredCourses.length > 0 ? (
        <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => <CourseCard key={course.slug} course={course} />)}
        </div>
      ) : (
        <div className="mt-7 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <h2 className="text-lg font-bold text-slate-900">No tracks match those filters</h2>
          <p className="mt-2 text-sm text-slate-600">Try another role or learning area.</p>
          <button
            type="button"
            onClick={() => { setQuery(""); setCategory("All areas"); }}
            className="button-secondary mt-5 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold"
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}
