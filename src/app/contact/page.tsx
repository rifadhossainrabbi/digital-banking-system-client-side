'use client';

import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  HelpCircle,
  Shield,
  MessageSquare,
} from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    category: 'General Inquiry',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: '', email: '', category: 'General Inquiry', subject: '', message: '' });
    }, 4000);
  };

  const faqs = [
    {
      q: 'How long does a customer fund transfer take to settle?',
      a: 'All transfers within Vaultly settle instantaneously (under 100 milliseconds) using atomic database consistency.',
    },
    {
      q: 'How can I apply for a loan or overdraft facility?',
      a: 'Log in to your Customer Dashboard, navigate to Loans, select your requested amount and duration, and submit. Micro-loans under $1,000 can disburse instantly upon automated approval.',
    },
    {
      q: 'Where is the primary operations branch located?',
      a: 'Vaultly Central Operations is headquartered in New York (Branch Code: VLT-NYC-01), operating 24/7 digital clearing services.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070d18]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-white px-4 py-16 dark:border-slate-800 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-xs font-bold text-teal-800 dark:border-teal-900/50 dark:bg-teal-950/50 dark:text-teal-300">
            <MessageSquare className="h-3.5 w-3.5" />
            24/7 Member & Technical Support
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            We Are Here To Assist You
          </h1>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
            Have questions regarding account provisioning, loan applications, or compliance? Get in touch with our team.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Contact Information & Channels */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Branch & Contact Channels
              </h3>

              <div className="mt-6 space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      Headquarters (Branch VLT-NYC-01)
                    </div>
                    <div className="text-slate-500">
                      100 Wall Street, Financial District, New York, NY 10005
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      Toll-Free Priority Line
                    </div>
                    <div className="text-slate-500">+1 (800) 555-VAULT (8285)</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-purple-50 p-2 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      Electronic Inquiries
                    </div>
                    <div className="text-slate-500">support@vaultly.bank</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      Operating Hours
                    </div>
                    <div className="text-slate-500">
                      Digital Core: 24/7/365 • Tellers: Mon - Fri 8AM - 6PM EST
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Security Notice */}
            <div className="rounded-3xl border border-emerald-200/60 bg-emerald-50/50 p-6 dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <Shield className="h-4 w-4 text-emerald-600" />
                <span>Security Assurance</span>
              </div>
              <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">
                Vaultly representatives will never ask for your 4-digit transaction PIN or account password over phone or email.
              </p>
            </div>
          </div>

          {/* Interactive Contact Form */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Send Us A Message
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Fill in the details below and a branch officer will respond within 2 business hours.
              </p>

              {submitted && (
                <div className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Thank you! Your inquiry has been received and routed to our banking desk.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Alexander Vance"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-slate-900 shadow-2xs focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="customer@domain.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-slate-900 shadow-2xs focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                      Inquiry Category
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 font-semibold text-slate-700 shadow-2xs focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    >
                      <option value="General Inquiry">General Banking Inquiry</option>
                      <option value="Account Provisioning">Account Provisioning & Types</option>
                      <option value="Loans & EMI">Loan Assistance & Repayment</option>
                      <option value="Compliance">Security & Transaction Verification</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                      Subject *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Brief topic..."
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-slate-900 shadow-2xs focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your inquiry in detail..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-slate-900 shadow-2xs focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[#071121] px-6 py-3.5 text-xs font-bold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:bg-[#0b1a33] hover:shadow-lg active:scale-[0.98] dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Submit Inquiry</span>
                  </button>
                </div>
              </form>

              {/* FAQ Accordion Section */}
              <div className="mt-10 border-t border-slate-100 pt-8 dark:border-slate-800">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <HelpCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Frequently Asked Questions
                </h3>
                <div className="mt-4 space-y-3">
                  {faqs.map((f) => (
                    <div
                      key={f.q}
                      className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-950/40"
                    >
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {f.q}
                      </h4>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        {f.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
