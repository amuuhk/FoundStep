import { Check, Circle, Lock } from 'lucide-react';
import type { Business } from '@/lib/types';
import { GATE_NAMES, GATE_ORDER } from '@/lib/constants';

const PIPELINE_STAGES = [
  { key: 'idea', label: 'Idea' },
  { key: 'selling', label: 'Selling' },
  { key: 'earning', label: 'Earning' },
  { key: 'production', label: 'Production' },
] as const;

const PRODUCTION_GATE = 2;

function getActiveStageIndex(business: Business): number {
  if (business.current_gate >= PRODUCTION_GATE) return 3;
  const index = PIPELINE_STAGES.findIndex((s) => s.key === business.stage);
  return index === -1 ? 0 : index;
}

export function StartupPipeline({ business }: { business: Business }) {
  const activeStage = getActiveStageIndex(business);

  return (
    <div className="space-y-5">
      <div className="card">
        <h2 className="text-sm font-semibold text-primary">Startup pipeline</h2>
        <p className="mt-0.5 text-xs text-muted">Where {business.name} stands today.</p>
        <ol className="mt-5 grid grid-cols-4 gap-2">
          {PIPELINE_STAGES.map((stage, i) => {
            const done = i < activeStage;
            const current = i === activeStage;
            return (
              <li key={stage.key} className="flex flex-col items-center text-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors ${
                    done
                      ? 'border-growth bg-growth text-on-solid'
                      : current
                        ? 'border-primary bg-primary text-on-solid'
                        : 'border-border bg-surface text-border'
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : <Circle className="h-3.5 w-3.5" />}
                </div>
                <p className={`mt-2 text-xs font-semibold ${current ? 'text-primary' : 'text-muted'}`}>
                  {stage.label}
                </p>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold text-primary">Production steps</h2>
        <p className="mt-0.5 text-xs text-muted">Each step is a gate you unlock by hitting its targets.</p>
        <ul className="mt-4 space-y-2">
          {GATE_ORDER.map((gate) => {
            const done = gate < business.current_gate;
            const current = gate === business.current_gate;
            return (
              <li
                key={gate}
                className={`flex items-center gap-3 rounded-xl border p-3 ${
                  current ? 'border-primary/30 bg-primary/10' : 'border-border bg-surface'
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                    done
                      ? 'bg-growth/15 text-growth'
                      : current
                        ? 'bg-primary text-on-solid'
                        : 'bg-border text-muted'
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : gate === business.current_gate ? gate : <Lock className="h-3.5 w-3.5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold ${current ? 'text-primary' : 'text-text'}`}>
                    Gate {gate}: {GATE_NAMES[gate]}
                  </p>
                  <p className="text-xs text-muted">
                    {done ? 'Completed' : current ? 'In progress' : 'Locked'}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
