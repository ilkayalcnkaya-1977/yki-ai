import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Mail, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/contact")({ component: Contact });

function Contact() {
  return <main className="min-h-screen bg-q-background-primary px-5 py-10 text-q-text-primary sm:px-8">
    <div className="mx-auto max-w-3xl">
      <a href="/" className="ykiai-logo">YKI AI<span>®</span></a>
      <p className="ykiai-eyebrow mt-16"><MessageCircle size={14}/> CONTACT</p>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">We’re here to help.</h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-q-text-secondary">For account, credit balance, payment or technical questions, contact the YKI AI support team. Please include the account email you use on the platform and a short description of the issue. Never send your password or full card details.</p>
      <section className="mt-8 rounded-2xl border border-q-border-default p-6">
        <div className="flex items-start gap-4"><Mail size={22}/><div><h2 className="font-semibold">Support contact</h2><p className="mt-2 text-sm leading-6 text-q-text-secondary">For support requests, write to the email below. Include your account email and a short description of the issue. Never send your password or full card details.</p><p className="mt-3 text-sm font-medium">Site owner: İlkay Yalçınkaya</p><p className="mt-1 text-sm text-q-text-secondary">Support email: illkayyalcnkaya@icloud.com</p><p className="mt-1 text-sm text-q-text-secondary">Business address: Vatan Mahallesi, Hanımeli Sokak, Gülüm İş Hanı No: 11 A, Bayrampaşa, İstanbul</p></div></div>
      </section>
      <p className="mt-6 text-sm leading-6 text-q-text-secondary">The contact details above are based on the information provided by the site owner. The seller should confirm that the legal identity and contact details match the official tax and business records before checkout is enabled.</p>
      <a className="ykiai-text-link mt-8" href="/"><ArrowLeft size={16}/> Back home</a>
    </div>
  </main>;
}
