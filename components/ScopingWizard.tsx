"use client";

import { useMemo, useState } from "react";
import { PILLARS, STAGES, TIMELINES, findPillar, findStage, findTimeline } from "@/lib/domain";
import { computeEstimate, formatRange } from "@/lib/estimate";
import { EstimateRange, PillarId, StageId, TimelineId } from "@/lib/types";

const TOTAL_STEPS = 4;

type FormState = {
  pillar: PillarId | null;
  scope: string[];
  stage: StageId | null;
  timeline: TimelineId | null;
  name: string;
  email: string;
  company: string;
};

const EMPTY: FormState = { pillar: null, scope: [], stage: null, timeline: null, name: "", email: "", company: "" };

export default function ScopingWizard() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<{ estimate: EstimateRange } | null>(null);

  const pillar = form.pillar ? findPillar(form.pillar) : undefined;

  const previewEstimate = useMemo(() => {
    if (!form.pillar || !form.stage || !form.timeline) return null;
    return computeEstimate(form.pillar, form.scope, form.stage, form.timeline);
  }, [form.pillar, form.scope, form.stage, form.timeline]);

  function toggleScope(id: string) {
    setForm((f) => ({
      ...f,
      scope: f.scope.includes(id) ? f.scope.filter((s) => s !== id) : [...f.scope, id],
    }));
  }

  async function submit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.errors?.[0]?.message ?? "Something went wrong. Try again.");
        setSubmitting(false);
        return;
      }
      setResult({ estimate: data.lead.estimate });
    } catch {
      setSubmitError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <Panel>
        <Eyebrow>Sent</Eyebrow>
        <h2 className="font-display text-2xl font-bold mb-5">Thanks, {form.name.split(" ")[0]}.</h2>
        <div className="font-mono text-3xl mb-4">{formatRange(result.estimate)}</div>
        <p className="text-[var(--muted)] leading-relaxed max-w-prose mb-4">
          This scope and estimate were recomputed and saved server-side — the number above came from{" "}
          <code>/api/leads</code>, not the browser. The Cynbit team can review every submission from the same
          endpoint.
        </p>
        <button
          className="rounded-lg border border-[var(--line)] text-[var(--muted)] px-4 py-2 text-sm"
          onClick={() => {
            setForm(EMPTY);
            setResult(null);
            setStep(0);
          }}
        >
          Start over
        </button>
      </Panel>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-[330px_minmax(0,1fr)]">
      <aside className="bg-[var(--panel)] border border-[var(--line)] rounded-[10px] p-5 h-fit md:sticky md:top-4">
        <h2 className="text-xs font-semibold text-[var(--muted)] mb-3">Your blueprint</h2>
        {!form.pillar ? (
          <p className="text-sm text-[var(--muted)] leading-relaxed">Your selections will appear here as you go.</p>
        ) : (
          <div className="text-sm">
            <SheetRow k="Service" v={pillar!.title} />
            {form.scope.length > 0 && (
              <SheetRow
                k="Scope"
                v={form.scope
                  .map((id) => pillar!.scope.find((s) => s.id === id)?.title)
                  .filter(Boolean)
                  .join(", ")}
              />
            )}
            {form.stage && <SheetRow k="Stage" v={findStage(form.stage)!.title} />}
            {form.timeline && <SheetRow k="Timeline" v={findTimeline(form.timeline)!.title} />}
          </div>
        )}
        {previewEstimate && (
          <div className="mt-4 pt-4 border-t border-[var(--line)]">
            <div className="text-xs text-[var(--muted)] mb-1">Illustrative estimate</div>
            <div className="font-mono text-lg">{formatRange(previewEstimate)}</div>
            <div className="text-[11px] text-[var(--muted)] mt-1.5 leading-relaxed">
              Range only — calibrated to Cynbit&apos;s real rate card before this ships.
            </div>
          </div>
        )}
      </aside>

      <Panel>
        <Progress step={step} />

        {step === 0 && (
          <>
            <Eyebrow>Step 1 of 4</Eyebrow>
            <h2 className="font-display text-xl font-bold mb-5">What are you building?</h2>
            <OptionGrid>
              {PILLARS.map((p) => (
                <Option
                  key={p.id}
                  title={p.title}
                  description={p.description}
                  selected={form.pillar === p.id}
                  onClick={() => setForm((f) => ({ ...f, pillar: p.id, scope: [] }))}
                />
              ))}
            </OptionGrid>
            <Nav onBack={null} onNext={() => setStep(1)} nextEnabled={!!form.pillar} />
          </>
        )}

        {step === 1 && pillar && (
          <>
            <Eyebrow>Step 2 of 4</Eyebrow>
            <h2 className="font-display text-xl font-bold mb-5">What does it include?</h2>
            <OptionGrid>
              {pillar.scope.map((s) => (
                <Option
                  key={s.id}
                  title={s.title}
                  description={s.description}
                  selected={form.scope.includes(s.id)}
                  onClick={() => toggleScope(s.id)}
                />
              ))}
            </OptionGrid>
            <Nav onBack={() => setStep(0)} onNext={() => setStep(2)} nextEnabled={form.scope.length > 0} />
          </>
        )}

        {step === 2 && (
          <>
            <Eyebrow>Step 3 of 4</Eyebrow>
            <h2 className="font-display text-xl font-bold mb-5">Scale &amp; timeline</h2>
            <OptionGrid>
              {STAGES.map((s) => (
                <Option
                  key={s.id}
                  title={s.title}
                  description={s.description}
                  selected={form.stage === s.id}
                  onClick={() => setForm((f) => ({ ...f, stage: s.id }))}
                />
              ))}
            </OptionGrid>
            <OptionGrid>
              {TIMELINES.map((t) => (
                <Option
                  key={t.id}
                  title={t.title}
                  description={t.description}
                  selected={form.timeline === t.id}
                  onClick={() => setForm((f) => ({ ...f, timeline: t.id }))}
                />
              ))}
            </OptionGrid>
            <Nav onBack={() => setStep(1)} onNext={() => setStep(3)} nextEnabled={!!(form.stage && form.timeline)} />
          </>
        )}

        {step === 3 && (
          <>
            <Eyebrow>Step 4 of 4</Eyebrow>
            <h2 className="font-display text-xl font-bold mb-5">Send it to Cynbit</h2>
            <div className="grid gap-3.5 mb-5">
              <Field label="Full name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
              <Field
                label="Email address"
                type="email"
                value={form.email}
                onChange={(v) => setForm((f) => ({ ...f, email: v }))}
              />
              <Field
                label="Company (optional)"
                value={form.company}
                onChange={(v) => setForm((f) => ({ ...f, company: v }))}
              />
            </div>
            {submitError && <p className="text-sm text-[var(--danger)] mb-3">{submitError}</p>}
            <Nav
              onBack={() => setStep(2)}
              onNext={submit}
              nextEnabled={!submitting}
              nextLabel={submitting ? "Sending…" : "Send"}
            />
          </>
        )}
      </Panel>
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-[var(--panel)] border border-[var(--line)] rounded-[10px] p-6 min-h-[400px] flex flex-col">
      {children}
    </main>
  );
}
function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="text-xs text-[var(--muted)] mb-2">{children}</div>;
}
function SheetRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-2.5 py-2 border-b border-dashed border-[var(--line)] last:border-none">
      <span className="text-[var(--muted)]">{k}</span>
      <span className="text-right max-w-[60%]">{v}</span>
    </div>
  );
}
function Progress({ step }: { step: number }) {
  return (
    <div className="flex gap-1.5 mb-5">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <i key={i} className="flex-1 h-[3px] bg-[var(--line)] rounded-sm overflow-hidden">
          <b
            className="block h-full bg-[var(--accent)] transition-all duration-200"
            style={{ width: i < step ? "100%" : i === step ? "50%" : "0%" }}
          />
        </i>
      ))}
    </div>
  );
}
function OptionGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-2.5 sm:grid-cols-2 mb-4">{children}</div>;
}
function Option({
  title,
  description,
  selected,
  onClick,
}: {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-[9px] border px-4 py-3.5 flex flex-col gap-0.5 transition-colors ${
        selected ? "border-[var(--accent)] bg-[color:var(--accent)]/10" : "border-[var(--line)] hover:border-[var(--accent)]"
      }`}
    >
      <span className="font-semibold text-sm">
        {title}
        {selected && <span className="text-[var(--accent)]"> ✓</span>}
      </span>
      <span className="text-xs text-[var(--muted)]">{description}</span>
    </button>
  );
}
function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-[var(--muted)] mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] text-[var(--text)] px-3 py-2.5 text-sm"
      />
    </div>
  );
}
function Nav({
  onBack,
  onNext,
  nextEnabled,
  nextLabel = "Continue",
}: {
  onBack: (() => void) | null;
  onNext: () => void;
  nextEnabled: boolean;
  nextLabel?: string;
}) {
  return (
    <div className="flex justify-between items-center mt-auto pt-4 gap-2.5">
      <button
        type="button"
        onClick={onBack ?? undefined}
        className={`rounded-lg border border-[var(--line)] text-[var(--muted)] px-4 py-2.5 text-sm ${onBack ? "" : "invisible"}`}
      >
        Back
      </button>
      <button
  type="button"
  disabled={!nextEnabled}
  onClick={onNext}
  className="
    group inline-flex items-center justify-center gap-2
    rounded-xl
    bg-gradient-to-r from-amber-400 to-amber-500
    text-gray-950
    px-6 py-3
    text-sm font-bold
    shadow-md shadow-amber-500/20
    transition-all duration-200
    hover:-translate-y-0.5
    hover:from-amber-300 hover:to-amber-400
    hover:shadow-lg hover:shadow-amber-500/30
    active:translate-y-0
    disabled:cursor-not-allowed
    disabled:opacity-40
    disabled:shadow-none
  "
>
  <span>{nextLabel}</span>
  {nextLabel !== "Sending..." && (
  <span className="transition-transform duration-200 group-hover:translate-x-1">
    →
  </span>
)}
</button>
    </div>
  );
}
