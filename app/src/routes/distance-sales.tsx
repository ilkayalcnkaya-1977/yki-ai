import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/distance-sales")({ component: DistanceSales });

function DistanceSales() {
  return <main className="min-h-screen bg-q-background-primary px-5 py-10 text-q-text-primary sm:px-8"><article className="mx-auto max-w-3xl">
    <a href="/" className="ykiai-logo">YKI AI<span>®</span></a><p className="ykiai-eyebrow mt-16">LEGAL / DISTANCE SALES</p><h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Distance sales agreement</h1>
    <p className="mt-4 text-sm text-q-text-secondary">Template — this agreement must be completed with the actual seller details and checked for compliance before checkout is enabled.</p>
    <h2 className="mt-8 text-xl font-semibold">1. Seller details</h2><p className="mt-3 leading-7 text-q-text-secondary">Seller legal name: [ADD VERIFIED LEGAL BUSINESS NAME]. Address: [ADD REGISTERED BUSINESS ADDRESS]. Telephone: [ADD BUSINESS PHONE]. Email: [ADD MONITORED SUPPORT EMAIL]. Tax office and number, where applicable: [ADD VERIFIED DETAILS].</p>
    <h2 className="mt-8 text-xl font-semibold">2. Subject of the agreement</h2><p className="mt-3 leading-7 text-q-text-secondary">This agreement concerns the digital credit package selected by the consumer on the YKI AI website. The exact package name, credit quantity, total price including applicable taxes, payment method and key limitations must be shown to the consumer before the order is placed.</p>
    <h2 className="mt-8 text-xl font-semibold">3. Order and payment</h2><p className="mt-3 leading-7 text-q-text-secondary">The consumer confirms the order after reviewing the pre-contract information and total price. Payment is processed through the payment provider shown at checkout. Credits should be added only after verified payment confirmation and according to the package purchased.</p>
    <h2 className="mt-8 text-xl font-semibold">4. Digital delivery</h2><p className="mt-3 leading-7 text-q-text-secondary">The intended delivery method is to credit the purchaser's YKI AI account after the payment provider confirms the transaction. The actual delivery time, account requirements and what happens if delivery fails must be stated clearly before purchase.</p>
    <h2 className="mt-8 text-xl font-semibold">5. Withdrawal, cancellation and complaints</h2><p className="mt-3 leading-7 text-q-text-secondary">The consumer's rights, any legally applicable withdrawal period and exceptions for digital content or services must be described accurately in the final version. Complaints can be sent to [ADD MONITORED SUPPORT EMAIL]. Mandatory consumer rights under Turkish law are not waived by this agreement.</p>
    <h2 className="mt-8 text-xl font-semibold">6. Effective date and records</h2><p className="mt-3 leading-7 text-q-text-secondary">Effective date: [ADD PUBLICATION DATE]. The seller should retain order and consent records as required by applicable law. This draft must be reviewed and completed before being used as a binding agreement.</p>
    <a className="ykiai-text-link mt-8 inline-flex" href="/"><ArrowLeft size={16}/> Back home</a>
  </article></main>;
}
