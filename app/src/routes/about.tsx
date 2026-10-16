import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/about")({ component: About });

function About() {
  return <main className="min-h-screen bg-q-background-primary px-5 py-10 text-q-text-primary sm:px-8">
    <div className="mx-auto max-w-3xl">
      <a href="/" className="ykiai-logo">YKI AI<span>®</span></a>
      <p className="ykiai-eyebrow mt-16"><Sparkles size={14}/> ABOUT YKI AI</p>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">Ideas into creative possibilities.</h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-q-text-secondary">YKI AI is a creative platform being built to help creators develop ideas for short-form video and visual content. Our goal is to bring ideation, creative direction and AI-assisted production workflows together in one place.</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-q-border-default p-5"><h2 className="font-semibold">Explore</h2><p className="mt-2 text-sm text-q-text-secondary">Develop a concept, mood and creative direction.</p></article>
        <article className="rounded-2xl border border-q-border-default p-5"><h2 className="font-semibold">Create</h2><p className="mt-2 text-sm text-q-text-secondary">Use available studio tools to shape visual ideas.</p></article>
        <article className="rounded-2xl border border-q-border-default p-5"><h2 className="font-semibold">Refine</h2><p className="mt-2 text-sm text-q-text-secondary">Iterate on content for your intended channel.</p></article>
      </div>
      <p className="mt-8 text-sm leading-6 text-q-text-secondary">Features and generation availability may vary during the early-access period. A credit purchase should only be offered when the relevant service and payment process are active and clearly described.</p>
      <div className="mt-10 flex flex-wrap gap-4"><a className="ykiai-primary" href="/studio">Explore the studio <ArrowUpRight size={16}/></a><a className="ykiai-text-link" href="/"><ArrowLeft size={16}/> Back home</a></div>
    </div>
  </main>;
}
