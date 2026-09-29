import { notFound } from "next/navigation";
import { listLocalMailPreviews } from "@/lib/mail";

export const dynamic = "force-dynamic";
export default async function LocalMailPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  const messages = await listLocalMailPreviews();
  return <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 sm:px-8">
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-navy-800">Local development only</p><h1 className="mt-2 text-3xl font-bold">Auth mail previews</h1>
    <p className="mt-3 text-sm leading-6 text-slate-600">Verification and password-reset messages are saved locally in the ignored <code>.dev-mail</code> directory. Links grant account actions; keep this page on the localhost-only development server.</p>
    {messages.length === 0 ? <p className="mt-6 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">No messages yet. Submit a local sign-up or password-reset request.</p> : <ol className="mt-6 space-y-4">{messages.map((message) => <li key={message.id} className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex flex-wrap justify-between gap-2"><h2 className="font-bold">{message.subject}</h2><time className="text-xs text-slate-500">{new Date(message.createdAt).toLocaleString()}</time></div><p className="mt-2 text-sm text-slate-600">To: {message.to}</p><p className="mt-3 whitespace-pre-wrap text-sm leading-6">{message.text}</p><a className="mt-3 inline-block break-all text-sm text-navy-800 underline" href={message.actionUrl}>Open one-time action link</a></li>)}</ol>}
  </main>;
}
