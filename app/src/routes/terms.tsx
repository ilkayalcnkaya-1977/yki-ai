import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/terms")({ component: Terms });

function Terms() {
  return <main className="min-h-screen bg-q-background-primary px-5 py-10 text-q-text-primary sm:px-8"><article className="mx-auto max-w-3xl">
    <a href="/" className="ykiai-logo">YKI AI<span>®</span></a><p className="ykiai-eyebrow mt-16">LEGAL / TERMS</p><h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Terms of use</h1>
    <p className="mt-4 text-sm text-q-text-secondary">Draft for review — seller identity and service scope must be confirmed before acceptance.</p>
    <h2 className="mt-8 text-xl font-semibold">1. The service</h2><p className="mt-3 leading-7 text-q-text-secondary">YKI AI provides creative software features intended to assist with ideation and AI-supported visual or video workflows. Available features, supported models, export quality, processing times and usage limits may change. Only features explicitly shown as available may be relied upon.</p>
    <h2 className="mt-8 text-xl font-semibold">2. Accounts and security</h2><p className="mt-3 leading-7 text-q-text-secondary">You are responsible for keeping your account credentials secure and for activity performed through your account. Do not share passwords, attempt unauthorised access, or interfere with platform security.</p>
    <h2 className="mt-8 text-xl font-semibold">3. Acceptable use and content</h2><p className="mt-3 leading-7 text-q-text-secondary">You must have the rights and permissions needed to submit content. Do not use the service to violate law, infringe intellectual property or privacy rights, impersonate others, distribute malware, or create prohibited harmful content. You remain responsible for reviewing generated output before publishing or commercial use.</p>
    <h2 className="mt-8 text-xl font-semibold">4. Credits and purchases</h2><p className="mt-3 leading-7 text-q-text-secondary">If credit packages are enabled, the quantity, price, applicable taxes, intended use, expiry (if any), and limitations must be disclosed before payment. A purchase is not complete until the payment provider confirms it. Do not assume a package is available for purchase while checkout is disabled.</p>
    <h2 className="mt-8 text-xl font-semibold">5. Availability and intellectual property</h2><p className="mt-3 leading-7 text-q-text-secondary">The platform may experience maintenance or outages. Rights in user-submitted content and generated output depend on the applicable third-party model terms, the law, and any separate terms displayed for the feature. YKI AI does not promise that every output is unique or suitable for a particular purpose.</p>
    <h2 className="mt-8 text-xl font-semibold">6. Contact and disputes</h2><p className="mt-3 leading-7 text-q-text-secondary">Service provider: [ADD VERIFIED LEGAL BUSINESS NAME]. Contact: [ADD VERIFIED SUPPORT EMAIL]. Address: [ADD REGISTERED BUSINESS ADDRESS]. Applicable mandatory consumer rights remain unaffected. Complete this section with the correct seller details and obtain legal review before launch.</p>
    <a className="ykiai-text-link mt-8 inline-flex" href="/"><ArrowLeft size={16}/> Back home</a>
  </article></main>;
}
