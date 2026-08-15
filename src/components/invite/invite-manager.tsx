'use client';

import { useEffect, useState } from 'react';
import { Copy, Check, Send, Users, ListChecks, Link2, ExternalLink, ShieldCheck, Radio, Download, UserCheck, QrCode, CalendarClock } from 'lucide-react';
import { demoIsDemoMode } from '@/lib/env';
import {
  RELIGIONS,
  getReligion,
  waLink,
  parseGuestLines,
  type ReligionKey,
  type MessagePreset
} from '@/lib/religions';
import { demoGetProject, demoGetDesign, demoListRsvps, demoListCheckins } from '@/lib/demo/demo-store';
import { supabase } from '@/lib/supabase/client';
import type { Rsvp, Checkin } from '@/lib/types';

interface InviteManagerProps {
  projectId: string;
  slug?: string;
  title?: string;
  religion?: string;
  /** Token akses (milik owner) agar link "Kelola Tamu" bisa dibagikan. */
  accessToken?: string;
}

const STORAGE_BULK = (id: string) => `gb_bulk_${id}`;
const STORAGE_SENT = (id: string) => `gb_sent_${id}`;

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

function Ornament({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden>
      <span className="h-px w-14 bg-gradient-to-r from-transparent to-[#c9a45c]" />
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <rect x="0.5" y="0.5" width="9" height="9" transform="rotate(45 5 5)" stroke="#c9a45c" />
      </svg>
      <span className="h-px w-14 bg-gradient-to-l from-transparent to-[#c9a45c]" />
    </div>
  );
}

function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-[#e7ddcc] bg-white/85 p-5 shadow-sm backdrop-blur ${className}`}>
      {children}
    </section>
  );
}

function PanelTitle({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-1.5 font-heading text-sm font-medium uppercase tracking-wide text-[#8a6d2f]">
      {icon}
      {children}
    </h3>
  );
}

const INPUT_CLS =
  'w-full rounded-lg border border-[#e0d6c2] bg-[#faf7f2]/70 px-3 py-2 text-sm text-[#4a443c] outline-none transition-colors placeholder:text-[#b3a69a] focus:border-[#c9a45c] focus:ring-2 focus:ring-[#c9a45c]/30';

const BTN_OUTLINE =
  'flex items-center gap-1.5 rounded-lg border border-[#e0d6c2] px-3 py-1.5 text-xs font-medium text-[#4a443c] transition-colors hover:border-[#c9a45c] hover:bg-[#faf7f2] disabled:cursor-not-allowed disabled:opacity-40';

const BTN_GOLD =
  'flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]';

function SegBtn({
  active,
  onClick,
  children,
  className = ''
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-2 py-1.5 text-xs transition-colors ${
        active
          ? 'border-[#c9a45c] bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] text-white'
          : 'border-[#e0d6c2] text-[#8a7a66] hover:border-[#c9a45c] hover:bg-[#faf7f2]'
      } ${className}`}
    >
      {children}
    </button>
  );
}

export default function InviteManager({ projectId, slug: slugProp, title: titleProp, religion: religionProp, accessToken }: InviteManagerProps) {
  const [slug, setSlug] = useState<string | undefined>(slugProp);
  const [title, setTitle] = useState<string | undefined>(titleProp);
  const [religion, setReligion] = useState<ReligionKey>('islam');
  const [presetId, setPresetId] = useState<string>('');
  const [template, setTemplate] = useState<string>('');
  const [bulkText, setBulkText] = useState<string>(() => loadRaw(STORAGE_BULK(projectId)));
  const [sentIndexes, setSentIndexes] = useState<Set<number>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_SENT(projectId));
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [copied, setCopied] = useState<string | null>(null);
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);

  // Persist sentIndexes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SENT(projectId), JSON.stringify([...sentIndexes]));
    } catch { /* ignore */ }
  }, [sentIndexes, projectId]);

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
      setCheckins(demoListCheckins(projectId));
      return;
    }
    supabase
      .from('rsvps')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setRsvps((data ?? []) as Rsvp[]));
    supabase
      .from('checkins')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setCheckins((data ?? []) as Checkin[]));
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

  function exportCheckins() {
    download(
      `absen-hari-h-${slug || 'undangan'}.csv`,
      toCsv(
        ['Nama', 'Jumlah Tamu', 'Waktu Check-in'],
        checkins.map((c) => [c.name, c.guest_count, new Date(c.created_at).toLocaleString('id-ID')])
      )
    );
  }

  const manageLink = accessToken
    ? `${base}/invite/${projectId}?t=${accessToken}`
    : undefined;

  return (
    <div className="relative min-h-screen bg-[#faf7f2] text-[#2b2620]">
      {/* Ornamen latar */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,164,92,0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(200,155,138,0.08),transparent_50%)]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'radial-gradient(circle, #2b2620 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
      </div>

      <header className="sticky top-0 z-10 border-b border-[#e7ddcc]/80 bg-[#faf7f2]/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black ring-1 ring-[#3a332b]">
              <ShieldCheck className="h-4 w-4 text-[#d4af37]" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-heading text-sm font-medium text-[#2b2620]">{title ?? 'Undangan'}</p>
              <p className="text-[10px] text-[#b3a69a]">Kelola daftar tamu &amp; ucapan saja</p>
            </div>
          </div>
          {slug && (
            <a
              href={`/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#e0d6c2] bg-white px-3 py-1.5 text-xs font-medium text-[#4a443c] transition-colors hover:border-[#c9a45c]"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Lihat Undangan
            </a>
          )}
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-2xl space-y-6 px-4 py-8">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-medium text-[#2b2620]">Kelola Tamu &amp; Ucapan</h1>
          <Ornament className="mt-3" />
        </div>

        <p className="flex items-center gap-2 rounded-xl border border-[#e7ddcc] bg-white/70 px-3 py-2 text-xs text-[#8a7a66]">
          <Radio className="h-3.5 w-3.5 shrink-0 text-[#c9a45c]" />
          Anda hanya mengelola daftar nama tamu dan membagikan ucapan undangan — desain tidak bisa diubah di sini.
        </p>

        {manageLink && (
          <Panel>
            <PanelTitle icon={<Link2 className="h-3.5 w-3.5" />}>Link Kelola Tamu (tanpa login)</PanelTitle>
            <p className="mt-1.5 text-[11px] leading-relaxed text-[#8a7a66]">
              Bagikan ke pihak lain yang terikat undangan — mereka bisa membuka halaman ini tanpa login dashboard, lewat token rahasia di tautan.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-lg border border-[#e7ddcc] bg-[#faf7f2] px-2 py-1.5 font-mono text-[11px] text-[#4a443c]">
                {manageLink}
              </code>
              <button onClick={() => copy('manage-link', manageLink)} className={BTN_OUTLINE}>
                {copied === 'manage-link' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                Salin
              </button>
            </div>
          </Panel>
        )}

        <details className="rounded-2xl border border-[#e7ddcc] bg-white/70 p-4 shadow-sm" open={false}>
          <summary className="cursor-pointer font-heading text-sm font-medium text-[#2b2620]">Cara pakai halaman ini</summary>
          <ol className="mt-3 space-y-2 text-xs leading-relaxed text-[#8a7a66]">
            <li>
              <b className="text-[#4a443c]">1. Pilih agama</b> — ucapan otomatis menyesuaikan (Islam, Kristen, dan lainnya).
            </li>
            <li>
              <b className="text-[#4a443c]">2. Pilih kalimat</b> — preset siap pakai atau tulis sendiri. Gunakan {'{nama}'} untuk nama tamu
              dan {'{link}'} untuk tautan undangan.
            </li>
            <li>
              <b className="text-[#4a443c]">3. Tempel daftar tamu</b> — satu nama per baris; bisa tambah nomor, misal{' '}
              <code>Nama | 0812xxxx</code>. Daftar tersimpan otomatis di browser.
            </li>
            <li>
              <b className="text-[#4a443c]">4. Kirim via WA</b> — klik tombol WA di samping nama, atau &quot;Salin Semua
              Pesan/Link&quot;. Centang kotak untuk menandai tamu yang sudah menerima.
            </li>
          </ol>
        </details>

        <Panel>
          <PanelTitle>Agama &amp; Ucapan</PanelTitle>
          <div className="mt-3 grid grid-cols-3 gap-1.5">
            {RELIGIONS.map((r) => (
              <SegBtn key={r.key} active={religion === r.key} onClick={() => applyReligion(r.key)}>
                {r.label}
              </SegBtn>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-[#b3a69a]">Ucapan otomatis menyesuaikan agama yang dipilih.</p>

          <label className="mt-4 block text-xs font-medium text-[#4a443c]">Pilih Kalimat</label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {cfg.messages.map((p) => (
              <SegBtn key={p.id} active={presetId === p.id} onClick={() => selectPreset(p)} className="flex-1 min-w-[64px]">
                {p.label}
              </SegBtn>
            ))}
            <SegBtn active={presetId === 'custom'} onClick={() => editTemplate(template)} className="flex-1 min-w-[64px]">
              Custom
            </SegBtn>
          </div>
          <textarea value={template} onChange={(e) => editTemplate(e.target.value)} rows={6} className={`${INPUT_CLS} mt-2`} />
        </Panel>

        <Panel>
          <PanelTitle icon={<Users className="h-3.5 w-3.5" />}>Daftar Nama Tamu</PanelTitle>
          <textarea
            value={bulkText}
            onChange={(e) => updateBulk(e.target.value)}
            rows={8}
            placeholder={'Ketik nama tamu satu per baris.\n\nBisa tambah nomor HP:\nNama | 0812xxxx\natau\nNama, 0812xxxx'}
            className={`${INPUT_CLS} mt-3 font-mono text-xs`}
          />
          <p className="mt-1.5 text-[11px] text-[#b3a69a]">
            Terdeteksi <b className="text-[#8a6d2f]">{rows.length}</b> tamu. Tersimpan otomatis — bisa dilanjutkan kapan saja.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => copy('all-messages', allMessages)} disabled={rows.length === 0} className={BTN_OUTLINE}>
              {copied === 'all-messages' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <ListChecks className="h-3.5 w-3.5" />}
              Salin Semua Pesan
            </button>
            <button onClick={() => copy('all-links', links.join('\n'))} disabled={rows.length === 0} className={BTN_OUTLINE}>
              {copied === 'all-links' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Link2 className="h-3.5 w-3.5" />}
              Salin Semua Link
            </button>
            <button onClick={exportGuests} disabled={rows.length === 0} className={BTN_OUTLINE}>
              <Download className="h-3.5 w-3.5" />
              Unduh Daftar Tamu (CSV)
            </button>
          </div>

          {rows.length > 0 && (
            <div className="mt-4 max-h-96 overflow-y-auto rounded-xl border border-[#e7ddcc]">
              {rows.map((row, i) => {
                const done = sentIndexes.has(i);
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-2 border-b border-[#e7ddcc]/70 px-3 py-2 last:border-0 ${done ? 'bg-emerald-50/60' : ''}`}
                  >
                    <button
                      onClick={() => toggleSent(i)}
                      title="Tandai sudah dikirim"
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                        done ? 'border-emerald-600 bg-emerald-600' : 'border-[#d9c795]'
                      }`}
                    >
                      {done && <Check className="h-3 w-3 text-white" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#2b2620]">{row.name}</p>
                      <p className="truncate text-[10px] text-[#b3a69a]">
                        {row.phone ? `+${row.phone.replace(/[^0-9+]/g, '')}` : 'tanpa nomor'}
                      </p>
                    </div>
                    <button
                      onClick={() => copy(`row-msg-${i}`, fill(template, row.name, links[i]))}
                      title="Salin pesan"
                      className="flex shrink-0 items-center gap-1 rounded-lg border border-[#e0d6c2] px-2 py-1.5 text-[11px] text-[#4a443c] transition-colors hover:border-[#c9a45c]"
                    >
                      {copied === `row-msg-${i}` ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      Salin
                    </button>
                    <button
                      onClick={() => openWa(row, i)}
                      className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-colors ${
                        done ? 'bg-[#d9c795]' : 'bg-emerald-600 hover:bg-emerald-500'
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
        </Panel>

        <Panel>
          <div className="flex items-center justify-between gap-2">
            <PanelTitle icon={<UserCheck className="h-3.5 w-3.5" />}>Konfirmasi Masuk (RSVP)</PanelTitle>
            <button onClick={exportRsvps} disabled={rsvps.length === 0} className={BTN_OUTLINE}>
              <Download className="h-3.5 w-3.5" />
              Unduh CSV
            </button>
          </div>
          {rsvps.length === 0 ? (
            <p className="mt-3 text-[11px] text-[#b3a69a]">Belum ada konfirmasi kehadiran dari tamu.</p>
          ) : (
            <div className="mt-3 max-h-80 overflow-y-auto rounded-xl border border-[#e7ddcc]">
              {rsvps.map((r) => (
                <div key={r.id} className="flex items-start gap-2 border-b border-[#e7ddcc]/70 px-3 py-2 last:border-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-[#2b2620]">{r.name}</p>
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
                    {r.message ? <p className="mt-0.5 text-xs leading-relaxed text-[#8a7a66]">{r.message}</p> : null}
                    <p className="mt-0.5 text-[10px] text-[#b3a69a]">
                      {r.guest_count} tamu · {new Date(r.created_at).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel>
          <div className="flex items-center justify-between gap-2">
            <PanelTitle icon={<QrCode className="h-3.5 w-3.5" />}>Absensi Hari-H (Check-in QR)</PanelTitle>
            <button onClick={exportCheckins} disabled={checkins.length === 0} className={BTN_OUTLINE}>
              <Download className="h-3.5 w-3.5" />
              Unduh CSV
            </button>
          </div>
          {slug ? (
            <p className="mt-1.5 text-[11px] leading-relaxed text-[#8a7a66]">
              Tamu memindai QR ini saat tiba di venue (lihat bagian &quot;Absensi Kehadiran&quot; pada undangan). Catatan
              check-in masuk ke daftar di bawah sesuai urutan waktu.
            </p>
          ) : null}
          {checkins.length === 0 ? (
            <p className="mt-3 text-[11px] text-[#b3a69a]">Belum ada tamu yang check-in.</p>
          ) : (
            <div className="mt-3 max-h-80 overflow-y-auto rounded-xl border border-[#e7ddcc]">
              {checkins.map((c) => (
                <div key={c.id} className="flex items-center gap-2 border-b border-[#e7ddcc]/70 px-3 py-2 last:border-0">
                  <CalendarClock className="h-3.5 w-3.5 shrink-0 text-[#c9a45c]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#2b2620]">{c.name}</p>
                    <p className="mt-0.5 text-[10px] text-[#b3a69a]">
                      {c.guest_count} tamu · {new Date(c.created_at).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <p className="pb-4 text-center text-xs text-[#b3a69a]">
          Undangan digital mewah &amp; personal &middot; {new Date().getFullYear()} Prasha Digital Indonesia
        </p>
      </main>
    </div>
  );
}