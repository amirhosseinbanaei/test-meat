import { Phone } from "lucide-react";

export function PhoneBlock({ phone }: { phone: string }) {
  return (
    <a
      href={`tel:${phone.replace(/\s|-/g, "")}`}
      dir="ltr"
      className="inline-flex items-center gap-2 text-brand-red text-base sm:text-lg"
    >
      <Phone className="size-5 sm:size-6" strokeWidth={2} />
      <span className="font-sans">{phone}</span>
    </a>
  );
}
