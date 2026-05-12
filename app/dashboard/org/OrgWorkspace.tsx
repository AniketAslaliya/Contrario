"use client";

import { useState } from "react";
import Link from "next/link";
import type { OrgRow } from "@/lib/org-store";
import type { PersonaId } from "@/lib/personas";
import { PERSONA_IDS } from "@/lib/personas";
import {
  createOrgAction,
  joinOrgAction,
  saveOrgWeightsAction,
} from "@/app/dashboard/org/org-actions";

type Props = {
  org: OrgRow | null;
  isAdmin: boolean;
};

const PRESETS: Record<string, Record<PersonaId, number>> = {
  seed: {
    "scale-chaser": 0.25,
    "conviction-buyer": 0.35,
    "reality-check": 0.4,
  },
  deeptech: {
    "scale-chaser": 0.45,
    "conviction-buyer": 0.3,
    "reality-check": 0.25,
  },
  india: {
    "scale-chaser": 0.33,
    "conviction-buyer": 0.34,
    "reality-check": 0.33,
  },
};

export function OrgWorkspace({ org, isAdmin }: Props) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [weights, setWeights] = useState<Record<PersonaId, number>>(
    org?.persona_weights ?? PRESETS.seed
  );

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const r = await createOrgAction(name);
    setMsg(r.ok ? `Created — invite code ${r.inviteCode}` : r.message);
    if (r.ok) window.location.reload();
  }

  async function onJoin(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const r = await joinOrgAction(code);
    setMsg(r.ok ? "Joined organization." : r.message);
    if (r.ok) window.location.reload();
  }

  async function saveWeights(e: React.FormEvent) {
    e.preventDefault();
    if (!org) return;
    setMsg(null);
    const r = await saveOrgWeightsAction(org.id, weights);
    setMsg(r.ok ? "Weights saved." : r.message);
  }

  function setPreset(key: keyof typeof PRESETS) {
    setWeights({ ...PRESETS[key] });
  }

  return (
    <div className="space-y-10">
      {!org ? (
        <>
          <form onSubmit={onCreate} className="rounded-2xl border border-cream-400 bg-cream-100/70 p-5 space-y-3">
            <p className="text-xs uppercase tracking-[0.12em] text-ink-400">
              Create org
            </p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-cream-400 bg-cream-100 px-3 py-2 text-sm"
              placeholder="Accelerator name"
            />
            <button type="submit" className="btn-primary w-full">
              Create workspace
            </button>
          </form>
          <form onSubmit={onJoin} className="rounded-2xl border border-cream-400 bg-cream-100/70 p-5 space-y-3">
            <p className="text-xs uppercase tracking-[0.12em] text-ink-400">
              Join with code
            </p>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full rounded-xl border border-cream-400 bg-cream-100 px-3 py-2 text-sm font-mono"
              placeholder="Invite code"
            />
            <button type="submit" className="btn-secondary w-full">
              Join
            </button>
          </form>
        </>
      ) : (
        <div className="rounded-2xl border border-cream-400 bg-cream-100/70 p-5 space-y-2">
          <p className="text-sm text-ink font-medium">{org.name}</p>
          <p className="text-xs text-ink-400">Invite code</p>
          <p className="font-mono text-lg text-ink">{org.invite_code}</p>
          <div className="flex flex-wrap gap-3 pt-4">
            <Link href="/dashboard/shortlist" className="btn-primary !py-2 !text-sm text-center">
              Shortlist
            </Link>
            <Link href="/dashboard/batch" className="btn-secondary !py-2 !text-sm text-center">
              Batch upload
            </Link>
          </div>
        </div>
      )}

      {org && isAdmin ? (
        <form onSubmit={saveWeights} className="rounded-2xl border border-cream-400 bg-cream-100/70 p-5 space-y-4">
          <p className="text-xs uppercase tracking-[0.12em] text-ink-400">
            Persona weights
          </p>
          <p className="text-xs text-ink-500">
            Used for custom composite ranking — sliders should reflect your fund thesis.
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setPreset("seed")} className="text-xs px-2 py-1 rounded-lg border border-cream-400">
              Seed
            </button>
            <button type="button" onClick={() => setPreset("deeptech")} className="text-xs px-2 py-1 rounded-lg border border-cream-400">
              Deep tech
            </button>
            <button type="button" onClick={() => setPreset("india")} className="text-xs px-2 py-1 rounded-lg border border-cream-400">
              Consumer India
            </button>
          </div>
          {PERSONA_IDS.map((id) => (
            <label key={id} className="block text-sm">
              <span className="text-ink-400 text-xs capitalize">{id.replace(/-/g, " ")}</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round((weights[id] ?? 0) * 100)}
                onChange={(e) => {
                  const v = Number(e.target.value) / 100;
                  setWeights((w) => ({ ...w, [id]: v }));
                }}
                className="w-full"
              />
            </label>
          ))}
          <button type="submit" className="btn-secondary w-full">
            Save weights
          </button>
        </form>
      ) : null}

      {msg ? <p className="text-sm text-ink-600">{msg}</p> : null}
    </div>
  );
}
