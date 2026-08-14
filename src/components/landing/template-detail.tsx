'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, MessageCircle, Sparkles } from 'lucide-react';
import type { CanvasData, TemplateMeta } from '@/lib/types';
import GuestRenderer from '@/components/guest/GuestRenderer';
import OrderDialog from '@/components/landing/order-dialog';

interface TemplateDetailProps {
  meta: TemplateMeta;
  index: number;
  canvas: CanvasData;
  categoryLabel: string;
  total: number;
  prev: { id: string; name: string } | null;
  next: { id: string; name: string } | null;
}

export default function TemplateDetail({ meta, index, canvas, categoryLabel, total, prev, next }: TemplateDetailProps) {
  const [orderOpen, setOrderOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0e0e13] text-gray-100">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0e0e13]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/templates" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Semua Template
          </Link>
          <span className="hidden text-xs text-gray-500 sm:block">
            Template {String(index + 1).padStart(2, '0')} / {total}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <div className="mx-auto max-w-[430px] rounded-[1.75rem] border border-white/10 bg-white/5 p-3 shadow-2xl">
              <div className="max-h-[85vh] overflow-auto rounded-[1.25rem] bg-white">
                <GuestRenderer canvas={canvas} preview />
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300">
              <Sparkles className="h-3.5 w-3.5" /> {categoryLabel}
            </span>
            <h1 className="mt-4 text-3xl font-bold text-white">{meta.name}</h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">{meta.description}</p>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full border border-white/20" style={{ background: meta.primary }} />
                <span className="h-5 w-5 rounded-full border border-white/20" style={{ background: meta.secondary }} />
              </div>
              <p className="text-xs text-gray-500">Palet warna tema</p>
            </div>

            <button
              onClick={() => setOrderOpen(true)}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-black hover:bg-amber-300"
            >
              <MessageCircle className="h-4 w-4" />
              Pesan Template Ini
            </button>
            <p className="mt-3 text-center text-xs text-gray-500">
              Isi form pemesanan — tim kami yang akan mengerjakan desainnya untuk Anda.
            </p>

            <div className="mt-8 flex justify-between gap-3 border-t border-white/10 pt-6">
              {prev ? (
                <Link href={`/templates/${prev.id}`} className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-gray-300 hover:bg-white/5">
                  <ArrowLeft className="h-4 w-4 shrink-0" />
                  <span className="truncate">{prev.name}</span>
                </Link>
              ) : (
                <span className="flex-1" />
              )}
              {next ? (
                <Link href={`/templates/${next.id}`} className="flex flex-1 items-center justify-end gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-gray-300 hover:bg-white/5">
                  <span className="truncate">{next.name}</span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </main>

      <OrderDialog open={orderOpen} templateName={meta.name} onClose={() => setOrderOpen(false)} />
    </div>
  );
}