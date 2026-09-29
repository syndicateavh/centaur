import type { LessonBlock } from "@/lib/course-player";

export default function LessonContent({ blocks }: { blocks: LessonBlock[] }) {
  return <div className="mt-8 space-y-6 text-[1.02rem] leading-8 text-slate-700">
    {blocks.map((block, index) => {
      if (block.type === "lead") return <p key={index} className="text-xl leading-8 text-slate-900">{block.text}</p>;
      if (block.type === "heading") return <h2 key={index} className="pt-2 text-2xl font-bold tracking-tight text-slate-950">{block.text}</h2>;
      if (block.type === "paragraph") return <p key={index}>{block.text}</p>;
      if (block.type === "list" || block.type === "takeaways") return <ul key={index} className="list-disc space-y-2 pl-6">{block.items.map((item) => <li key={item}>{item}</li>)}</ul>;
      if (block.type === "activity") return <section key={index} className="rounded-xl border border-indigo-200 bg-indigo-50 p-5"><h2 className="text-lg font-bold text-indigo-950">Practice: {block.title}</h2><p className="mt-2">{block.text}</p></section>;
      if (block.type === "callout") return <aside key={index} className="rounded-xl border-l-4 border-gold-500 bg-gold-50 p-5"><h2 className="font-bold text-gold-950">{block.title}</h2><p className="mt-1">{block.text}</p></aside>;
      return null;
    })}
  </div>;
}
