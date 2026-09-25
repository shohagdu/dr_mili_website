'use client';

import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { api, type ContactInput } from '@/lib/api';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    const formData = new FormData(e.currentTarget);
    const input: ContactInput = {
      name:    String(formData.get('name') || ''),
      email:   (formData.get('email') as string) || undefined,
      phone:   (formData.get('phone') as string) || undefined,
      subject: (formData.get('subject') as string) || undefined,
      message: String(formData.get('message') || ''),
    };

    try {
      await api.createContact(input);
      setStatus('success');
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Failed to send. Please try again.');
    }
  }

  if (status === 'success') {
    return (
      <div className="border border-clinical/30 bg-clinical-tint/40 p-10 text-center">
        <CheckCircle2 className="w-12 h-12 text-clinical mx-auto mb-5" />
        <h3 className="font-display text-3xl text-ink mb-4">Message sent</h3>
        <p className="text-ink-muted max-w-md mx-auto leading-relaxed mb-6">
          Thank you for reaching out. We'll get back to you within 1–2 business days.
        </p>
        <button onClick={() => setStatus('idle')} className="btn-secondary text-sm">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="field-label" htmlFor="name">Name *</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={120}
            className="field-input"
            placeholder="Your full name"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="phone">Phone</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="field-input"
            placeholder="+880 1XXX XXXXXX"
          />
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          className="field-input"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="field-label" htmlFor="subject">Subject</label>
        <input
          id="subject"
          name="subject"
          type="text"
          maxLength={200}
          className="field-input"
          placeholder="What is this about?"
        />
      </div>

      <div>
        <label className="field-label" htmlFor="message">Message *</label>
        <textarea
          id="message"
          name="message"
          required
          minLength={5}
          maxLength={4000}
          rows={6}
          className="field-input"
          placeholder="Type your message..."
        />
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
        {status === 'submitting' ? 'Sending...' : (
          <>
            Send Message
            <Send className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
