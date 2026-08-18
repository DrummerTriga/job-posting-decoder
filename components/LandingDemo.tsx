"use client";

import { useEffect, useRef, useState } from "react";

type Decoded = {
  technologies_required: string[];
  seniority_advertised: string;
  seniority_estimated_real: string;
  red_flags: string[];
  buzzwords_detected: string[];
};

type Sample = {
  label: string;
  posting: string;
  decoded: Decoded;
};

// Pre-written examples so the landing page can show the output shape without
// spending an API call. The real analysis lives in /analyze.
const SAMPLES: Sample[] = [
  {
    label: "The “rockstar” startup",
    posting: `We're looking for a Junior Full-Stack Ninja to join our fast-paced, high-energy family!

You'll own the entire product end to end: React front end, Node/Express APIs, Postgres, plus AWS infrastructure and CI/CD. Some React Native would be a big plus.

Must be comfortable wearing many hats and working under pressure. We work hard and play hard — evenings and the occasional weekend come with the territory when we're shipping. Competitive salary DOE.`,
    decoded: {
      technologies_required: [
        "React",
        "Node.js",
        "Express",
        "PostgreSQL",
        "AWS",
        "CI/CD",
        "React Native",
      ],
      seniority_advertised: "Junior",
      seniority_estimated_real: "Mid to Senior — owning infra plus web and mobile is not a junior scope",
      red_flags: [
        "“Work hard, play hard” + evenings and weekends — unpaid overtime treated as normal",
        "“We're a family” — often used to justify blurred boundaries",
        "“Wearing many hats” at junior level — likely one person doing three jobs",
        "“Salary DOE” with no range — no pay transparency",
      ],
      buzzwords_detected: ["Ninja", "fast-paced", "high-energy", "work hard play hard", "own it end to end"],
    },
  },
  {
    label: "The vague enterprise role",
    posting: `Senior Software Engineer — Digital Transformation

The successful candidate will leverage synergies across cross-functional stakeholders to deliver best-in-class solutions in a dynamic, ever-changing environment.

Requirements: 10+ years of Java, Spring Boot, Kubernetes, Kafka, and Terraform. Experience with agile methodologies essential. Must thrive under ambiguity and be a self-starter who can hit the ground running with minimal supervision.`,
    decoded: {
      technologies_required: [
        "Java",
        "Spring Boot",
        "Kubernetes",
        "Kafka",
        "Terraform",
      ],
      seniority_advertised: "Senior",
      seniority_estimated_real: "Senior / Staff — 10+ years plus platform ownership is above a standard senior brief",
      red_flags: [
        "“Thrive under ambiguity” with “minimal supervision” — expect little onboarding or direction",
        "“Ever-changing environment” — shifting priorities and unclear ownership",
        "The description says nothing concrete about what you would actually build",
      ],
      buzzwords_detected: [
        "leverage synergies",
        "cross-functional stakeholders",
        "best-in-class",
        "dynamic",
        "self-starter",
        "hit the ground running",
      ],
    },
  },
];

const STEP_DELAY = 320;

export default function LandingDemo() {
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [decoding, setDecoding] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => clearTimers, []);

  const sample = SAMPLES[index];

  const handleDecode = () => {
    clearTimers();
    setStep(0);
    setDecoding(true);

    for (let i = 1; i <= 4; i++) {
      timers.current.push(
        setTimeout(() => {
          setStep(i);
          if (i === 4) setDecoding(false);
        }, STEP_DELAY * i)
      );
    }
  };

  const selectSample = (i: number) => {
    clearTimers();
    setIndex(i);
    setStep(0);
    setDecoding(false);
  };

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 sm:p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {SAMPLES.map((s, i) => (
            <button
              key={s.label}
              onClick={() => selectSample(i)}
              aria-pressed={i === index}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                i === index
                  ? "bg-neutral-100 text-neutral-900 font-medium"
                  : "bg-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-neutral-600">Example output</span>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500 mb-2">
            What they wrote
          </p>
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-neutral-400 rounded-xl bg-neutral-950 border border-neutral-800 p-4 max-h-72 overflow-y-auto">
            {sample.posting}
          </pre>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              What it means
            </p>
            <button
              onClick={handleDecode}
              disabled={decoding}
              className="px-3 py-1.5 rounded-lg text-xs bg-neutral-100 text-neutral-900 font-medium hover:bg-white disabled:opacity-50"
            >
              {decoding ? "Decoding…" : step === 4 ? "Replay" : "Decode it"}
            </button>
          </div>

          {step === 0 && !decoding && (
            <div className="rounded-xl border border-dashed border-neutral-800 p-6 text-center text-sm text-neutral-500 h-full flex items-center justify-center">
              Hit “Decode it” to see the breakdown.
            </div>
          )}

          <div className="space-y-3">
            {step >= 1 && (
              <Panel title="Required technologies">
                <div className="flex flex-wrap gap-2">
                  {sample.decoded.technologies_required.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </Panel>
            )}

            {step >= 2 && (
              <Panel title="Seniority">
                <p className="text-sm text-neutral-400">
                  Advertised:{" "}
                  <span className="text-neutral-200">
                    {sample.decoded.seniority_advertised}
                  </span>
                </p>
                <p className="text-sm text-neutral-400 mt-1">
                  Real estimate:{" "}
                  <span className="text-neutral-200">
                    {sample.decoded.seniority_estimated_real}
                  </span>
                </p>
              </Panel>
            )}

            {step >= 3 && (
              <Panel title="Red flags" tone="red">
                <ul className="space-y-1 text-sm text-neutral-300 list-disc list-inside">
                  {sample.decoded.red_flags.map((flag) => (
                    <li key={flag}>{flag}</li>
                  ))}
                </ul>
              </Panel>
            )}

            {step >= 4 && (
              <Panel title="Buzzwords">
                <div className="flex flex-wrap gap-2">
                  {sample.decoded.buzzwords_detected.map((word) => (
                    <span
                      key={word}
                      className="px-2 py-0.5 rounded bg-yellow-900/30 text-yellow-300 text-xs"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </Panel>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Panel({
  title,
  tone,
  children,
}: {
  title: string;
  tone?: "red";
  children: React.ReactNode;
}) {
  return (
    <div
      className={`p-4 rounded-xl bg-neutral-900 border animate-in ${
        tone === "red" ? "border-red-900/50" : "border-neutral-800"
      }`}
    >
      <h3
        className={`font-semibold text-sm mb-2 ${
          tone === "red" ? "text-red-400" : "text-neutral-200"
        }`}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}
