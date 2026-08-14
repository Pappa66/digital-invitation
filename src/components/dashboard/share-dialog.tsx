'use client';

import { useState } from 'react';
import {
  Copy,
  Check,
  User,
  Link2,
  Pencil,
  Eye,
  MessageSquare,
  Users,
  Send,
  ListChecks
} from 'lucide-react';
import { RELIGIONS, getReligion, waLink, parseGuestLines, type ReligionKey } from '@/lib/religions';

interface ShareDialogProps {
  open: boolean;
  projectId: string;
  slug: string;
  title: string;
  onClose: () => void;
  /** Agama aktif dari builder (opsional). Bila dikosongkan, dipakai state lokal. */
  religion?: string;
  onChangeReligion?: (religion: ReligionKey) => void;
}

const STORAGE_RELIGION = (id: string) => `gb_religion_${id}`;
const STORAGE_BULK = (id: string) => `gb_bulk_${id}`;

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function fill(template: string, name: string, link: string): string {
  return template.split('{nama}').join(name).split('{link}').join(link);
}

function loadState<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

type Tab = 'single' | 'bulk' | 'team';

export default function ShareDialog({ open, projectId, slug, title, onClose, religion: initialReligion, onChangeReligion }: ShareDialogProps) {
  const [tab, setTab] = useState<Tab>('single');
  const [name, setName] = useState('');
  const [religion, setReligion] = useState<ReligionKey>(() => {
    const stored = loadState<string | null>(STORAGE_RELIGION(projectId), null);
    if (stored && RELIGIONS.some((r) => r.key === stored)) return stored as ReligionKey;
    const initial = (initialReligion ?? 'islam') as ReligionKey;
    return RELIGIONS.some((r) => r.key === initial) ? initial : 'islam';
  });
  const [presetId, setPresetId] = useState<string>('islam-formal');
  const [template, setTemplate] = useState<string>(() => RELIGIONS[0].messages[0].text);
  const [copied, setCopied] = useState<string | null>(null);
  const [bulkText, setBulkText] = useState<string>(() => loadState(STORAGE_BULK(projectId), ''));
  const [sentIndexes, setSentIndexes] = useState<Set<number>>(new Set());

  if (!open) return null;

  const base = typeof window !== 'undefined' ? window.location.origin : '';
  const cleanName = name.trim();
  const link = `${base}/${slug}${cleanName ? `?to=${encodeURIComponent(cleanName)}` : ''}`;
  const manageLink = `${base}/invite/${projectId}`;
  const message = fill(template, cleanName, link);

  const rows = parseGuestLines(bulkText);
  const cfg = getReligion(religion);

  function changeReligion(key: ReligionKey) {
    setReligion(key);
    if (onChangeReligion) onChangeReligion(key);
    try {
      localStorage.setItem(STORAGE_RELIGION(projectId), key);
    } catch {
      /* ignore */
    }
    const next = getReligion(key);
    const first = next.messages[0];
    setPresetId(first.id);
    setTemplate(first.text);
  }

  function selectPreset(id: string) {
    const preset = cfg.messages.find((m) => m.id === id);
    if (!preset) return;
    setPresetId(id);
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
    const ok = await copyText(text);
    setCopied(ok ? kind : null);
    setTimeout(() => setCopied(null), 1500);
  }

  function openWa(row: { name: string; phone: string }, index: number) {
    const rowLink = `${base}/${slug}?to=${encodeURIComponent(row.name)}`;
    const msg = fill(template, row.name, rowLink);
    window.open(waLink(row.phone, msg), '_blank', 'noopener,noreferrer');
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

  const bulkLinks = rows.map((r) => `${base}/${slug}?to=${encodeURIComponent(r.name)}`);
  const allMessages = rows.map((r, i) => `${r.name}\n${bulkLinks[i]}\n\n${fill(template, r.name, bulkLinks[i])}`).join('\n\n' + '-'.repeat(24) + '\n\n');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <h3 className="text-base font-semibold text-gray-900">Bagikan &ldquo;{title}&rdquo;</h3>
          <button onClick={onClose} className="rounded-md p-1 text-gray-400 hover:bg-gray-100" aria-label="Tutup">
            ✕
          </button>
        </div>

        <div className="flex gap-1 border-b border-gray-100 px-5 pt-3">
          {(
            [
              { key: 'single', label: 'Satu Tamu', icon: User },
              { key: 'bulk', label: 'Bulk', icon: Users },
              { key: 'team', label: 'Akses Tim', icon: Link2 }
            ] as { key: Tab; label: string; icon: typeof User }[]
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 border-b-2 px-3 pb-2 text-xs font-medium ${
                tab === t.key ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
              {t.key === 'bulk' && rows.length > 0 && (
                <span className="rounded-full bg-gray-900 px-1.5 text-[10px] text-white">{rows.length}</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'single' && (
            <Section icon={<User className="h-4 w-4 text-gray-400" />} title="Undangan untuk Satu Tamu">
              <ReligionSelector religion={religion} onChange={changeReligion} />

              <label className="mb-1 mt-3 block text-xs font-medium text-gray-700">Nama Tamu</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="cth. Bapak/Ibu Surya"
                maxLength={80}
                className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900"
              />
              <p className="mt-1 text-[11px] text-gray-400">
                Nama otomatis muncul di undangan (sapaan) dan di pesan ({'{nama}'}).
              </p>

              <label className="mt-3 mb-1 block text-xs font-medium text-gray-700">Template Ucapan</label>
              <PresetRow presets={cfg.messages} activeId={presetId} onSelect={selectPreset} />
              <textarea
                value={template}
                onChange={(e) => editTemplate(e.target.value)}
                rows={6}
                className="mt-2 w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900"
              />

              <p className="mt-3 mb-1 flex items-center gap-1 text-xs font-medium text-gray-700">
                <MessageSquare className="h-3.5 w-3.5 text-gray-400" /> Pratinjau Pesan
              </p>
              <div className="whitespace-pre-wrap rounded-md bg-gray-50 px-3 py-2 text-xs leading-relaxed text-gray-700">
                {message}
              </div>

              <div className="mt-3 flex items-center gap-2">
                <input
                  readOnly
                  value={link}
                  onFocus={(e) => e.currentTarget.select()}
                  className="w-full truncate rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600 outline-none"
                />
                <button
                  onClick={() => copy('link', link)}
                  className="flex shrink-0 items-center gap-1 rounded-md border border-gray-300 px-2.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  {copied === 'link' ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Link2 className="h-3.5 w-3.5" />}
                  {copied === 'link' ? 'Disalin' : 'Link'}
                </button>
                <button
                  onClick={() => copy('message', message)}
                  className="flex shrink-0 items-center gap-1 rounded-md bg-gray-900 px-2.5 py-2 text-xs font-medium text-white hover:bg-gray-700"
                >
                  {copied === 'message' ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied === 'message' ? 'Disalin' : 'Salin'}
                </button>
              </div>
            </Section>
          )}

          {tab === 'bulk' && (
            <Section icon={<Users className="h-4 w-4 text-gray-400" />} title="Kirim Massal ke Banyak Tamu">
              <ReligionSelector religion={religion} onChange={changeReligion} />

              <label className="mt-3 mb-1 block text-xs font-medium text-gray-700">Daftar Tamu</label>
              <textarea
                value={bulkText}
                onChange={(e) => updateBulk(e.target.value)}
                rows={6}
                placeholder={'Ketik nama satu per baris.\n\nBisa tambah nomor HP:  Nama | 0812xxxx\natau:  Nama, 0812xxxx'}
                className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 font-mono text-xs outline-none focus:ring-2 focus:ring-gray-900"
              />
              <p className="mt-1 text-[11px] text-gray-400">
                Terdeteksi <b>{rows.length}</b> tamu. Tanpa nomor HP, tombol WhatsApp akan minta pilih kontak.
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => copy('all-messages', allMessages)}
                  disabled={rows.length === 0}
                  className="flex items-center gap-1.5 rounded-md border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                >
                  {copied === 'all-messages' ? <Check className="h-3.5 w-3.5 text-green-600" /> : <ListChecks className="h-3.5 w-3.5" />}
                  Salin Semua Pesan
                </button>
                <button
                  onClick={() => copy('all-links', bulkLinks.join('\n'))}
                  disabled={rows.length === 0}
                  className="flex items-center gap-1.5 rounded-md border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                >
                  {copied === 'all-links' ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Link2 className="h-3.5 w-3.5" />}
                  Salin Semua Link
                </button>
              </div>

              {rows.length > 0 && (
                <div className="mt-3 max-h-64 overflow-y-auto rounded-md border border-gray-200">
                  {rows.map((row, i) => {
                    const done = sentIndexes.has(i);
                    const rowLink = bulkLinks[i];
                    return (
                      <div key={i} className={`flex items-center gap-2 border-b border-gray-100 px-2 py-1.5 last:border-0 ${done ? 'bg-green-50' : ''}`}>
                        <button
                          onClick={() => toggleSent(i)}
                          title="Tandai sudah dikirim"
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${done ? 'border-green-600 bg-green-600' : 'border-gray-300'}`}
                        >
                          {done && <Check className="h-3 w-3 text-white" />}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-gray-800">{row.name}</p>
                          <p className="truncate text-[10px] text-gray-400">{row.phone ? `+${normalizePhone(row.phone)}` : 'tanpa nomor'}</p>
                        </div>
                        <button
                          onClick={() => copy(`row-msg-${i}`, fill(template, row.name, rowLink))}
                          title="Salin pesan"
                          className="flex shrink-0 items-center gap-1 rounded-md border border-gray-300 px-1.5 py-1 text-[11px] text-gray-600 hover:bg-gray-50"
                        >
                          {copied === `row-msg-${i}` ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                        </button>
                        <button
                          onClick={() => openWa(row, i)}
                          className="flex shrink-0 items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-emerald-500"
                        >
                          <Send className="h-3 w-3" />
                          WA
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </Section>
          )}

          {tab === 'team' && (
            <Section icon={<Link2 className="h-4 w-4 text-gray-400" />} title="Akses untuk Tim (khusus desain ini)">
              <AccessRow
                label="Tautan Lihat"
                desc="Halaman publik undangan"
                value={`${base}/${slug}`}
                onCopy={() => copy('team-link', `${base}/${slug}`)}
                copied={copied === 'team-link'}
              />
              <AccessRow
                label="Tautan Kelola Tamu"
                desc="Buka daftar nama tamu & pilih ucapan per agama (tanpa akses desain/dashboard)"
                icon={<Users className="h-3.5 w-3.5 shrink-0 text-gray-400" />}
                value={manageLink}
                onCopy={() => copy('team-link', manageLink)}
                copied={copied === 'team-link'}
              />
            </Section>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
          <p className="text-[11px] text-gray-400">Daftar bulk tersimpan otomatis.</p>
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

function normalizePhone(raw: string): string {
  const p = raw.replace(/[^0-9+]/g, '').replace(/^\+/, '');
  return p;
}

function ReligionSelector({ religion, onChange }: { religion: ReligionKey; onChange: (r: ReligionKey) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700">Agama &amp; Ucapan</label>
      <div className="mt-1 grid grid-cols-3 gap-1.5">
        {RELIGIONS.map((r) => (
          <button
            key={r.key}
            onClick={() => onChange(r.key)}
            className={`rounded-md border px-2 py-1.5 text-xs ${
              religion === r.key ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function PresetRow({ presets, activeId, onSelect }: { presets: { id: string; label: string }[]; activeId: string; onSelect: (id: string) => void }) {
  return (
    <div className="flex gap-1.5">
      {presets.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(p.id)}
          className={`flex-1 rounded-md border px-2 py-1 text-xs ${
            activeId === p.id ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {p.label}
        </button>
      ))}
      <button
        onClick={() => onSelect('custom')}
        className={`flex-1 rounded-md border px-2 py-1 text-xs ${
          activeId === 'custom' ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
        }`}
      >
        Custom
      </button>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        {icon}
        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</h4>
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function AccessRow({
  label,
  desc,
  value,
  onCopy,
  copied,
  icon
}: {
  label: string;
  desc: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="mb-2 rounded-md border border-gray-200 p-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          {icon ?? (label === 'Tautan Edit' ? <Pencil className="h-3.5 w-3.5 shrink-0 text-gray-400" /> : <Eye className="h-3.5 w-3.5 shrink-0 text-gray-400" />)}
          <span className="text-xs font-medium text-gray-800">{label}</span>
        </div>
        <button
          onClick={onCopy}
          className="flex shrink-0 items-center gap-1 rounded-md border border-gray-300 px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
        >
          {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Disalin' : 'Salin'}
        </button>
      </div>
      <p className="mt-1 truncate text-[11px] text-gray-500">{value}</p>
      <p className="mt-0.5 text-[10px] text-gray-400">{desc}</p>
    </div>
  );
}
