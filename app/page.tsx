import ScopingWizard from "@/components/ScopingWizard";

export default function Page() {
  return (
    <div className="max-w-[1040px] mx-auto px-5 py-10 pb-16">
      <div className="flex items-center gap-2.5 font-semibold text-sm mb-7">
        <span className="w-[26px] h-[26px] border border-[var(--text)] rounded-md grid place-items-center font-mono text-xs">
          C
        </span>
        Cynbit — Blueprint
      </div>

      <div className="mb-7">
        <div className="text-[var(--accent)] text-sm font-semibold mb-1.5">Project intelligence</div>
        <h1 className="font-display font-bold text-[clamp(26px,4vw,36px)] leading-tight mb-2.5 max-w-[16ch]">
          Scope your project in four steps.
        </h1>
        <p className="text-[var(--muted)] max-w-[56ch] leading-relaxed">
          Answer a few questions about what you&apos;re building and get an instant, illustrative estimate — no call
          required to find out if we&apos;re a fit.
        </p>
      </div>

      <ScopingWizard />
    </div>
  );
}
