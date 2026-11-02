import { useState } from 'react';
import { createBusiness, fetchBusinesses } from '@/lib/api';
import { SECTORS, STAGES } from '@/lib/constants';
import { Logo } from '@/components/Logo';
import { Loader2, Building2 } from 'lucide-react';
import type { Business } from '@/lib/types';

export function CreateBusiness({ onCreated }: { onCreated: (business: Business) => void }) {
  const [name, setName] = useState('');
  const [sector, setSector] = useState('');
  const [description, setDescription] = useState('');
  const [stage, setStage] = useState<'idea' | 'selling' | 'earning'>('idea');
  const [startDate, setStartDate] = useState('');
  const [cacRegistered, setCacRegistered] = useState(false);
  const [cacNumber, setCacNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your business name.');
      return;
    }
    if (!sector) {
      setError('Please select a sector.');
      return;
    }
    if (!description.trim()) {
      setError('Please write a one-sentence description.');
      return;
    }
    if (!startDate) {
      setError('Please select a start date.');
      return;
    }

    setLoading(true);
    const business = await createBusiness({
      name: name.trim(),
      sector,
      description: description.trim(),
      stage,
      start_date: startDate,
      cac_registered: cacRegistered,
      cac_number: cacRegistered && cacNumber.trim() ? cacNumber.trim() : undefined,
      country: 'Nigeria',
    });

    if (!business) {
      setError('Could not create your business. Please try again.');
      setLoading(false);
      return;
    }

    onCreated(business);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-neutral-50">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-8">
        <div className="mb-6 flex justify-center">
          <Logo size="md" />
        </div>

        <div className="mb-6 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100">
            <Building2 className="h-6 w-6 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Tell us about your business</h1>
          <p className="mt-1.5 text-sm text-neutral-500">
            This sets up your dashboard. You can change details later.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text" htmlFor="bizName">Business name</label>
            <input
              id="bizName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="e.g. Ada's Tailoring"
            />
          </div>

          <div>
            <label className="label-text" htmlFor="sector">Sector</label>
            <select id="sector" value={sector} onChange={(e) => setSector(e.target.value)} className="input-field">
              <option value="">Select a sector...</option>
              {SECTORS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-text" htmlFor="description">One-sentence description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field min-h-[80px] resize-none"
              placeholder="e.g. We make and sell affordable traditional clothing for women in Kano."
              maxLength={200}
            />
            <p className="mt-1 text-xs text-neutral-400">{description.length}/200</p>
          </div>

          <div>
            <label className="label-text">Current stage</label>
            <div className="space-y-2">
              {STAGES.map((s) => (
                <label
                  key={s.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
                    stage === s.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="stage"
                    value={s.value}
                    checked={stage === s.value}
                    onChange={() => setStage(s.value)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-700">{s.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="label-text" htmlFor="startDate">Start date</label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={cacRegistered}
                onChange={(e) => setCacRegistered(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-neutral-700">My business is CAC-registered</span>
            </label>
          </div>

          {cacRegistered && (
            <div className="animate-fade-in">
              <label className="label-text" htmlFor="cacNumber">CAC number (optional)</label>
              <input
                id="cacNumber"
                type="text"
                value={cacNumber}
                onChange={(e) => setCacNumber(e.target.value)}
                className="input-field"
                placeholder="e.g. BN-1234567"
              />
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? 'Creating...' : 'Create my business'}
          </button>
        </form>
      </div>
    </div>
  );
}

export async function checkExistingBusiness(): Promise<Business | null> {
  const businesses = await fetchBusinesses();
  return businesses[0] ?? null;
}
