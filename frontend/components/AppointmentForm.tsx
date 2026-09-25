'use client';

import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { api, type AppointmentInput } from '@/lib/api';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const SLOTS = [
  { value: 'morning',   label: 'Morning (9AM – 12PM)' },
  { value: 'afternoon', label: 'Afternoon (12PM – 5PM)' },
  { value: 'evening',   label: 'Evening (5PM – 9PM)' },
  { value: 'night',     label: 'Night (9PM onwards)' },
];

export function AppointmentForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Minimum date = today
  const today = new Date().toISOString().split('T')[0];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    const formData = new FormData(e.currentTarget);
    const input: AppointmentInput = {
      patient_name:    String(formData.get('patient_name') || ''),
      phone:           String(formData.get('phone') || ''),
      email:           (formData.get('email') as string) || undefined,
      age:             formData.get('age') ? Number(formData.get('age')) : undefined,
      gender:          (formData.get('gender') as 'male' | 'female' | 'other') || undefined,
      problem_summary: String(formData.get('problem_summary') || ''),
      preferred_date:  String(formData.get('preferred_date') || ''),
      preferred_slot:  String(formData.get('preferred_slot') || ''),
    };

    try {
      await api.createAppointment(input);
      setStatus('success');
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Failed to submit. Please try again.');
    }
  }

  if (status === 'success') {
    return (
      <div className="border border-clinical/30 bg-clinical-tint/40 p-10 text-center">
        <CheckCircle2 className="w-12 h-12 text-clinical mx-auto mb-5" />
        <h3 className="font-display text-3xl text-ink mb-4">Request received</h3>
        <p className="text-ink-muted max-w-md mx-auto leading-relaxed mb-6">
          Thank you. Our team will call you shortly to confirm your appointment.
          For urgent matters, please call the chamber directly.
        </p>
        <button onClick={() => setStatus('idle')} className="btn-secondary text-sm">
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="field-label" htmlFor="patient_name">Full name *</label>
          <input
            id="patient_name"
            name="patient_name"
            type="text"
            required
            minLength={2}
            maxLength={120}
            className="field-input"
            placeholder="e.g. Mohammad Rahman"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="phone">Phone number *</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            pattern="[0-9+\-\s()]{7,20}"
            className="field-input"
            placeholder="+880 1XXX XXXXXX"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <label className="field-label" htmlFor="email">Email (optional)</label>
          <input
            id="email"
            name="email"
            type="email"
            className="field-input"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="age">Age</label>
          <input
            id="age"
            name="age"
            type="number"
            min={1}
            max={130}
            className="field-input"
            placeholder="—"
          />
        </div>
      </div>

      <div>
        <label className="field-label">Gender</label>
        <div className="flex flex-wrap gap-3">
          {['male', 'female', 'other'].map((g) => (
            <label
              key={g}
              className="flex items-center gap-2 px-4 py-2.5 border border-ink/15 rounded-lg cursor-pointer hover:bg-paper-warm has-[:checked]:bg-clinical has-[:checked]:text-paper has-[:checked]:border-clinical transition-colors"
            >
              <input type="radio" name="gender" value={g} className="sr-only" />
              <span className="capitalize text-sm">{g}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="field-label" htmlFor="preferred_date">Preferred date *</label>
          <input
            id="preferred_date"
            name="preferred_date"
            type="date"
            required
            min={today}
            className="field-input"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="preferred_slot">Preferred slot *</label>
          <select
            id="preferred_slot"
            name="preferred_slot"
            required
            defaultValue=""
            className="field-input"
          >
            <option value="" disabled>Select a slot</option>
            {SLOTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="problem_summary">
          Describe your problem *
        </label>
        <textarea
          id="problem_summary"
          name="problem_summary"
          required
          minLength={5}
          maxLength={2000}
          rows={5}
          className="field-input"
          placeholder="Symptoms, how long you've had them, previous treatments, current medications..."
        />
        <p className="text-xs text-ink-muted mt-2">
          Your information is kept confidential and shared only with the medical team.
        </p>
      </div>

      {status === 'error' && (
        <div className="flex items-start gap-3 p-4 border border-coral/30 bg-coral/5 text-coral text-sm rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{errorMsg}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="btn-primary w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'submitting' ? 'Submitting...' : (
          <>
            Submit Request
            <Send className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
