'use client';

import { useEffect, useState } from 'react';
import { Copy, Check, Send, Users, ListChecks, Link2, ExternalLink, ShieldCheck, Radio, Download, UserCheck } from 'lucide-react';
import { demoIsDemoMode } from '@/lib/env';
import {
  RELIGIONS,
  getReligion,
  waLink,
  parseGuestLines,
  type ReligionKey,
  type MessagePreset
} from '@/lib/religions';
import { demoGetProject, demoGetDesign, demoListRsvps } from '@/lib/demo/demo-store';
import { supabase } from '@/lib/supabase/client';
import type { Rsvp } from '@/lib/types';

interface InviteManagerProps {
  projectId: string;
  slug?: string;
  title?: string;
  religion?: string;
  /** Token akses (milik owner) agar link "Kelola Tamu" bisa dibagikan. */
  accessToken?: string;
}

const STORAGE_BULK = (id: string) => `gb_bulk_${id}`;

function fill(template: string, name: string, link: string): string {
  return template.split('{nama}').join(name).split('{link}').join(link);
}

function loadRaw(key: string): string {
  try {
    return localStorage.getItem(key) ?? '';
  } catch {
    return '';
  }
}

export default function InviteManager({ projectId, slug: slugProp, title: titleProp, religion: religionProp, accessToken }: InviteManagerProps) {
  const [slug, setSlug] = useState<string | undefined>(slugProp);
  const [title, setTitle] = useState<string | undefined>(titleProp);
  const [religion, setReligion] = useState<ReligionKey>('islam');
  const [presetId, setPresetId] = useState<string>('');
  const [template, setTemplate] = useState<string>('');
  const [bulkText, setBulkText] = useState<string>(() => loadRaw(STORAGE_BULK(projectId)));
  const [sentIndexes, setSentIndexes] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);

  useEffect(() => {
    if (!demoIsDemoMode()) return;
    const proj = demoGetProject(projectId);
    if (proj) {
      setSlug(proj.slug);
      setTitle(proj.title);
    }
    const design = demoGetDesign(projectId);
    const rel = design?.settings?.religion;
    if (rel && RELIGIONS.some((r) => r.key === rel)) applyReligion(rel as ReligionKey);
    else applyReligion('islam');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (demoIsDemoMode()) {
      setRsvps(demoListRsvps(projectId));
      return;
    }
    supabase
      .from('rsvps')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setRsvps((data ?? []) as Rsvp[]));
  }, [projectId]);

  function applyReligion(key: ReligionKey) {
    setReligion(key);
    const cfg = getReligion(key);
    const first = cfg.messages[0];
    setPresetId(first.id);
    setTemplate(first.text);
  }

  function selectPreset(preset: MessagePreset) {
    setPresetId(preset.id);
    setTemplate(preset.text);
  }

  function editTemplate(text: string) {
    setTemplate(text);
    setPresetId('custom');
  }

  function updateBulk(text: string) {
    setBulkText(text);
    try {
      localStorage.setItem(STORAGE_BULK(projectId), text);
    } catch {
      /* ignore */
    }
  }

  async function copy(kind: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
    } catch {
      setCopied(null);
    }
    setTimeout(() => setCopied(null), 1500);
  }

  const base = typeof window !== 'undefined' ? window.location.origin : '';
  const rows = parseGuestLines(bulkText);
  const cfg = getReligion(religion);
  const links = rows.map((r) => `${base}/${slug}?to=${encodeURIComponent(r.name)}`);
  const allMessages = rows
    .map((r, i) => `${r.name}\n${links[i]}\n\n${fill(template, r.name, links[i])}`)
    .join('\n\n' + '-'.repeat(24) + '\n\n');

  function openWa(row: { name: string; phone: string }, index: number) {
    const rowLink = `${base}/${slug}?to=${encodeURIComponent(row.name)}`;
    window.open(waLink(row.phone, fill(template, row.name, rowLink)), '_blank', 'noopener,noreferrer');
    if (row.phone) {
      setSentIndexes((prev) => {
        const next = new Set(prev);
        next.add(index);
        return next;
      });
    }
  }

  function toggleSent(index: number) {
    setSentIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function toCsv(headers: string[], rows: (string | number | null)[][]): string {
    const esc = (v: string | number | null) => {
      const s = String(v ?? '');
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    return [headers.join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n');
  }

  function download(name: string, csv: string) {
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportRsvps() {
    download(
      `rsvp-${slug || 'undangan'}.csv`,
      toCsv(
        ['Nama', 'Kehadiran', 'Jumlah Tamu', 'Pesan', 'Waktu'],
        rsvps.map((r) => [r.name, r.attendance, r.guest_count, r.message ?? '', new Date(r.created_at).toLocaleString('id-ID')])
      )
    );
  }

  function exportGuests() {
    download(
      `daftar-tamu-${slug || 'undangan'}.csv`,
      toCsv(
        ['Nama', 'Nomor HP'],
        rows.map((r) => [r.name, r.phone ?? ''])
      )
    );
  }

  const manageLink = accessToken
    ? `${base}/invite/${projectId}?t=${accessToken}`
    : undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">{title ?? 'Undangan'}</p>
              <p className="text-[10px] text-gray-400">Kelola daftar tamu &amp; ucapan saja</p>
            </div>
          </div>
          {slug && (
            <a
              href={`/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex shrink-0 items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-gray-400"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Lihat Undangan
            </a>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        <p className="flex items-center gap-2 rounded-md bg-sky-50 px-3 py-2 text-xs text-sky-700">
          <Radio className="h-3.5 w-3.5 shrink-0" />
          Anda hanya mengelola daftar nama tamu dan membagikan ucapan undangan — desain tidak bisa diubah di sini.
        </p>

        {manageLink && (
          <section className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <Link2 className="h-3.5 w-3.5" /> Link Kelola Tamu (tanpa login)
            </h3>
            <p className="mt-1.5 text-[11px] leading-relaxed text-gray-400">
              Bagikan ke pihak lain yang terikat undangan — mereka bisa membuka halaman ini tanpa login dashboard, lewat token rahasia di tautan.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-md bg-gray-50 px-2 py-1.5 font-mono text-[11px] text-gray-600">
                {manageLink}
              </code>
              <button
                onClick={() => copy('manage-link', manageLink)}
                className="flex shrink-0 items-center gap-1 rounded-md border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                {copied === 'manage-link' ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                Salin
              </button>
            </div>
          </section>
        )}

        <details className="rounded-xl border border-gray-200 bg-white p-4" open={false}>
          <summary className="cursor-pointer text-sm font-medium text-gray-700">Cara pakai halaman ini</summary>
          <ol className="mt-3 space-y-2 text-xs leading-relaxed text-gray-600">
            <li>
              <b>1. Pilih agama</b> — ucapan otomatis menyesuaikan (Islam, Kristen, dan lainnya).
            </li>
            <li>
              <b>2. Pilih kalimat</b> — preset siap pakai atau tulis sendiri. Gunakan {'{nama}'} untuk nama tamu dan {'{link}'}
              untuk tautan undangan.
            </li>
            <li>
              <b>3. Tempel daftar tamu</b> — satu nama per baris; bisa tambah nomor, misal <code>Nama | 0812xxxx</code>.
              Daftar tersimpan otomatis di browser.
            </li>
            <li>
              <b>4. Kirim via WA</b> — klik tombol WA di samping nama, atau &quot;Salin Semua Pesan/Link&quot;. Centang kotak untuk menandai
              tamu yang sudah menerima.
            </li>
          </ol>
        </details>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Agama &amp; Ucapan</h3>
          <div className="mt-3 grid grid-cols-3 gap-1.5">
            {RELIGIONS.map((r) => (
              <button
                key={r.key}
                onClick={() => applyReligion(r.key)}
                className={`rounded-md border px-2 py-1.5 text-xs ${
                  religion === r.key ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-gray-400">Ucapan otomatis menyesuaikan agama yang dipilih.</p>

          <label className="mt-4 block text-xs font-medium text-gray-700">Pilih Kalimat</label>
          <div className="mt-1.5 flex gap-1.5">
            {cfg.messages.map((p) => (
              <button
                key={p.id}
                onClick={() => selectPreset(p)}
                className={`flex-1 rounded-md border px-2 py-1.5 text-xs ${
                  presetId === p.id ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {p.label}
              </button>
            ))}
            <button
              onClick={() => editTemplate(template)}
              className={`flex-1 rounded-md border px-2 py-1.5 text-xs ${
                presetId === 'custom' ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Custom
            </button>
          </div>
          <textarea
            value={template}
            onChange={(e) => editTemplate(e.target.value)}
            rows={6}
            className="mt-2 w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900"
          />
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <Users className="h-3.5 w-3.5" /> Daftar Nama Tamu
          </h3>
          <textarea
            value={bulkText}
            onChange={(e) => updateBulk(e.target.value)}
            rows={8}
            placeholder={'Ketik nama tamu satu per baris.\n\nBisa tambah nomor HP:\nNama | 0812xxxx\natau\nNama, 0812xxxx'}
            className="mt-3 w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 font-mono text-xs outline-none focus:ring-2 focus:ring-gray-900"
          />
          <p className="mt-1.5 text-[11px] text-gray-400">
            Terdeteksi <b>{rows.length}</b> tamu. Tersimpan otomatis — bisa dilanjutkan kapan saja.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => copy('all-messages', allMessages)}
              disabled={rows.length === 0}
              className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              {copied === 'all-messages' ? <Check className="h-3.5 w-3.5 text-green-600" /> : <ListChecks className="h-3.5 w-3.5" />}
              Salin Semua Pesan
            </button>
            <button
              onClick={() => copy('all-links', links.join('\n'))}
              disabled={rows.length === 0}
              className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              {copied === 'all-links' ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Link2 className="h-3.5 w-3.5" />}
              Salin Semua Link
            </button>
            <button
              onClick={exportGuests}
              disabled={rows.length === 0}
              className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              <Download className="h-3.5 w-3.5" />
              Unduh Daftar Tamu (CSV)
            </button>
          </div>

          {rows.length > 0 && (
            <div className="mt-4 max-h-96 overflow-y-auto rounded-md border border-gray-200">
              {rows.map((row, i) => {
                const done = sentIndexes.has(i);
                return (
                  <div key={i} className={`flex items-center gap-2 border-b border-gray-100 px-3 py-2 last:border-0 ${done ? 'bg-green-50' : ''}`}>
                    <button
                      onClick={() => toggleSent(i)}
                      title="Tandai sudah dikirim"
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${done ? 'border-green-600 bg-green-600' : 'border-gray-300'}`}
                    >
                      {done && <Check className="h-3 w-3 text-white" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-800">{row.name}</p>
                      <p className="truncate text-[10px] text-gray-400">{row.phone ? `+${row.phone.replace(/[^0-9+]/g, '')}` : 'tanpa nomor'}</p>
                    </div>
                    <button
                      onClick={() => copy(`row-msg-${i}`, fill(template, row.name, links[i]))}
                      title="Salin pesan"
                      className="flex shrink-0 items-center gap-1 rounded-md border border-gray-300 px-2 py-1.5 text-[11px] text-gray-600 hover:bg-gray-50"
                    >
                      {copied === `row-msg-${i}` ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                      Salin
                    </button>
                    <button
                      onClick={() => openWa(row, i)}
                      className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-white ${
                        done ? 'bg-gray-300' : 'bg-emerald-600 hover:bg-emerald-500'
                      }`}
                    >
                      <Send className="h-3.5 w-3.5" />
                      {done ? 'Sudah' : 'WA'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <UserCheck className="h-3.5 w-3.5" /> Konfirmasi Masuk (RSVP)
            </h3>
            <button
              onClick={exportRsvps}
              disabled={rsvps.length === 0}
              className="flex items-center gap-1.5 rounded-md border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              <Download className="h-3.5 w-3.5" />
              Unduh CSV
            </button>
          </div>
          {rsvps.length === 0 ? (
            <p className="mt-3 text-[11px] text-gray-400">Belum ada konfirmasi kehadiran dari tamu.</p>
          ) : (
            <div className="mt-3 max-h-80 overflow-y-auto rounded-md border border-gray-200">
              {rsvps.map((r) => (
                <div key={r.id} className="flex items-start gap-2 border-b border-gray-100 px-3 py-2 last:border-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-gray-800">{r.name}</p>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          r.attendance === 'hadir'
                            ? 'bg-emerald-100 text-emerald-700'
                            : r.attendance === 'ragu'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {r.attendance === 'hadir' ? 'Hadir' : r.attendance === 'ragu' ? 'Ragu' : 'Tidak Hadir'}
                      </span>
                    </div>
                    {r.message ? <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{r.message}</p> : null}
                    <p className="mt-0.5 text-[10px] text-gray-400">
                      {r.guest_count} tamu · {new Date(r.created_at).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}