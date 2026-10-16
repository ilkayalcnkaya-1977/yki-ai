import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/refund-policy")({ component: RefundPolicy });

function RefundPolicy() {
  return <main className="min-h-screen bg-q-background-primary px-5 py-10 text-q-text-primary sm:px-8"><article className="mx-auto max-w-3xl">
    <a href="/" className="ykiai-logo">YKI AI<span>®</span></a><p className="ykiai-eyebrow mt-16">LEGAL / CREDITS</p><h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Cancellation, refunds & credit issues</h1>
    <p className="mt-4 text-sm text-q-text-secondary">Draft policy — confirm with the seller's legal adviser and payment provider before sales begin.</p>
    <h2 className="mt-8 text-xl font-semibold">1. Before you purchase</h2><p className="mt-3 leading-7 text-q-text-secondary">Review the package price, credit amount, intended uses, any limits, and whether credits expire before confirming payment. Do not purchase a package if the described service is not available to your account.</p>
    <h2 className="mt-8 text-xl font-semibold">2. Failed or duplicate payments</h2><p className="mt-3 leading-7 text-q-text-secondary">If your bank shows a charge but the order is not confirmed, or if you believe you were charged twice, contact support with the transaction date, amount and order reference. Never send full card details. We will check the payment record and coordinate with the payment provider where needed.</p>
    <h2 className="mt-8 text-xl font-semibold">3. Missing credits or technical failures</h2><p className="mt-3 leading-7 text-q-text-secondary">If a confirmed purchase does not appear in your credit balance, or a generation fails after consuming credits, contact support with your account email, approximate time and project reference. We will review the logs and correct confirmed account or billing errors according to the applicable terms and law.</p>
    <h2 className="mt-8 text-xl font-semibold">4. Cancellation and statutory rights</h2><p className="mt-3 leading-7 text-q-text-secondary">Cancellation, withdrawal and refund eligibility for digital services depend on the nature of the service, the consumer's express requests and acknowledgements, and applicable Turkish consumer-protection legislation. Nothing in this policy removes mandatory legal rights. The final policy must clearly state the applicable process, time limits and any lawful exceptions before checkout is enabled.</p>
    <h2 className="mt-8 text-xl font-semibold">5. How to request help</h2><p className="mt-3 leading-7 text-q-text-secondary">Support email: illkayyalcnkaya@icloud.com. Seller: [ADD VERIFIED LEGAL BUSINESS NAME]. Address: Vatan Mahallesi, Hanımeli Sokak, Gülüm İş Hanı No: 11 A, Bayrampaşa, İstanbul. These fields must be completed before this page is final.</p>
    <a className="ykiai-text-link mt-8 inline-flex" href="/"><ArrowLeft size={16}/> Back home</a>
  </article></main>;
}
