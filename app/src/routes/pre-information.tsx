import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/pre-information")({ component: PreInformation });

function PreInformation() {
  return <main className="min-h-screen bg-q-background-primary px-5 py-10 text-q-text-primary sm:px-8"><article className="mx-auto max-w-3xl">
    <a href="/" className="ykiai-logo">YKI AI<span>®</span></a><p className="ykiai-eyebrow mt-16">LEGAL / BEFORE YOU BUY</p><h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Pre-contract information</h1>
    <p className="mt-4 text-sm text-q-text-secondary">The information below is a preparation draft. Complete all marked seller fields and verify the service details before enabling payment.</p>
    <h2 className="mt-8 text-xl font-semibold">Seller</h2><p className="mt-3 leading-7 text-q-text-secondary">Legal business name: [ADD VERIFIED LEGAL BUSINESS NAME]. Registered address: [ADD REGISTERED ADDRESS]. Contact email: [ADD MONITORED SUPPORT EMAIL]. Telephone: [ADD BUSINESS PHONE].</p>
    <h2 className="mt-8 text-xl font-semibold">Main characteristics of the service</h2><p className="mt-3 leading-7 text-q-text-secondary">YKI AI offers account-based digital credits intended for eligible AI-assisted creative features. Before ordering, the checkout must explain which features consume credits, the estimated or exact credit cost per action, any generation limits, and any third-party model or export restrictions. Do not describe a feature as available if it is not operational.</p>
    <h2 className="mt-8 text-xl font-semibold">Package price</h2><ul className="mt-3 list-disc space-y-2 pl-6 leading-7 text-q-text-secondary"><li>Starter — 250 credits — 199 TL.</li><li>Creator — 750 credits — 499 TL.</li><li>Pro — 2,000 credits — 999 TL.</li></ul><p className="mt-3 leading-7 text-q-text-secondary">Confirm whether the displayed prices include all applicable taxes and make this explicit before payment. These packages should not be purchasable until the payment integration is approved and working.</p>
    <h2 className="mt-8 text-xl font-semibold">Payment, delivery and support</h2><p className="mt-3 leading-7 text-q-text-secondary">Payment method: the provider shown on the final checkout page. Intended delivery: account crediting after confirmed payment. Support contact: [ADD MONITORED SUPPORT EMAIL]. Expected delivery timing and the process for failed or delayed crediting must be specified before launch.</p>
    <h2 className="mt-8 text-xl font-semibold">Cancellation and consumer rights</h2><p className="mt-3 leading-7 text-q-text-secondary">Please review the Cancellation & Refund Policy and Distance Sales Agreement before purchase. Any withdrawal conditions and exceptions must be explained in a way that complies with applicable consumer law. Mandatory rights are not limited by this information.</p>
    <div className="mt-8 rounded-xl border border-q-border-default p-4 text-sm leading-6 text-q-text-secondary">Publication checklist: complete seller identity and contact details; confirm tax-inclusive pricing; confirm actual credit use and delivery; align this page with the final sales agreement and refund policy; obtain legal review.</div>
    <a className="ykiai-text-link mt-8 inline-flex" href="/"><ArrowLeft size={16}/> Back home</a>
  </article></main>;
}
