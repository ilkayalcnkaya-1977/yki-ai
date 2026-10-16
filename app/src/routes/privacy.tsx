import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacy")({ component: Privacy });

function Privacy() {
  return <main className="min-h-screen bg-q-background-primary px-5 py-10 text-q-text-primary sm:px-8"><article className="mx-auto max-w-3xl">
    <a href="/" className="ykiai-logo">YKI AI<span>®</span></a><p className="ykiai-eyebrow mt-16">LEGAL / PRIVACY</p><h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Privacy & KVKK information</h1>
    <p className="mt-4 text-sm text-q-text-secondary">Draft for review — publish only after the data controller and processing details have been verified.</p>
    <h2 className="mt-8 text-xl font-semibold">1. Data controller</h2><p className="mt-3 leading-7 text-q-text-secondary">Data controller: İlkay Yalçınkaya. Contact: illkayyalcnkaya@icloud.com. Registered address: Vatan Mahallesi, Hanımeli Sokak, Gülüm İş Hanı No: 11 A, Bayrampaşa, İstanbul. These details must be completed before this notice is treated as final.</p>
    <h2 className="mt-8 text-xl font-semibold">2. Information that may be processed</h2><p className="mt-3 leading-7 text-q-text-secondary">Depending on the features you use, the platform may process account and authentication details, prompts and content you submit, credit balances and transaction records, technical logs, and messages you send to support. Payment card information should be handled by the payment provider; YKI AI should not request your full card number or security code in support messages.</p>
    <h2 className="mt-8 text-xl font-semibold">3. Purposes and legal grounds</h2><p className="mt-3 leading-7 text-q-text-secondary">Data may be processed to provide requested services, maintain account security, record purchases and credits, respond to support requests, meet legal obligations, and establish or defend legal claims, where an applicable legal basis under Turkish law exists.</p>
    <h2 className="mt-8 text-xl font-semibold">4. Sharing and retention</h2><p className="mt-3 leading-7 text-q-text-secondary">Data may be shared with service providers necessary to operate hosting, authentication, databases, AI processing, analytics or payment services, subject to appropriate safeguards and applicable law. Retention periods must be defined according to the data type and legal obligations; data should not be retained longer than necessary.</p>
    <h2 className="mt-8 text-xl font-semibold">5. Your rights and requests</h2><p className="mt-3 leading-7 text-q-text-secondary">You may have rights under the Turkish Personal Data Protection Law (KVKK), including requesting information about processing, correction or deletion where applicable, and raising a complaint with the competent authority. Send requests to illkayyalcnkaya@icloud.com after the contact details have been completed.</p>
    <h2 className="mt-8 text-xl font-semibold">6. Cookies and security</h2><p className="mt-3 leading-7 text-q-text-secondary">Strictly necessary technologies may be used for login, session security and core functionality. Any optional analytics or advertising technologies should be disclosed and consent collected where required. Reasonable technical and organisational safeguards should be maintained.</p>
    <p className="mt-8 rounded-xl border border-q-border-default p-4 text-sm leading-6 text-q-text-secondary">Completion required: verify the actual data flows, processors, international transfers, cookie behaviour, retention periods and legal grounds. This template is not a substitute for legal review.</p>
    <a className="ykiai-text-link mt-8 inline-flex" href="/"><ArrowLeft size={16}/> Back home</a>
  </article></main>;
}
