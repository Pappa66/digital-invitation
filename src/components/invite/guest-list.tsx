'use client';

import { useEffect, useState } from 'react';
import { Users, Plus, Trash2, Copy, Check, Send } from 'lucide-react';
import { listGuests, addGuests, deleteGuest, type Guest } from '@/lib/actions/guest-actions';
import { parseGuestLines, waLink } from '@/lib/religions';
import { getSiteOrigin } from '@/lib/site';

interface GuestListPanelProps {
  projectId: string;
  slug?: string;
  template?: string;
}

/** Daftar tamu persisten (database) + link personal ?to=Nama. */
export default function GuestListPanel({ projectId, slug, template }: GuestListPanelProps) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    listGuests(projectId)
      .then((r) => {
        if (!active) return;
        if (r.data) setGuests(r.data);
        else if (r.error) setError(r.error);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [projectId]);

  const origin = getSiteOrigin();
  const linkFor = (name: string) => `${origin}/${slug ?? ''}?to=${encodeURIComponent(name)}`;
  const msgFor = (name: string) =>
    (template ?? 'Assalamualaikum {nama}, kami mengundang Anda ke acara pernikahan kami: {link}')
      .split('{nama}')
      .join(name)
      .split('{link}')
      .join(linkFor(name));

  async function reload() {
    const r = await listGuests(projectId);
    if (r.data) setGuests(r.data);
  }

  async function handleAdd() {
    const rows = parseGuestLines(text).map((r) => ({ name: r.name, phone: r.phone }));
    if (rows.length === 0) return;
    setBusy(true);
    setError('');
    const res = await addGuests(projectId, rows);
    if (res.error) setError(res.error);
    else {
      setText('');
      await reload();
    }
    setBusy(false);
  }

  async function copy(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <section className="rounded-2xl border border-[#e7ddcc] bg-white/85 p-5 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#8a6d2f]">
        <Users className="h-3.5 w-3.5" /> Daftar Tamu (Tersimpan)
      </div>
      <p className="mt-1.5 text-[11px] text-[#b3a69a]">Tersimpan permanen di akun Anda. Link personal otomatis dari nama tamu.</p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder={'Tambah tamu, satu per baris.\nNama | 0812xxxx'}
        className="mt-3 w-full rounded-xl border border-[#e0d6c2] bg-white px-3 py-2 font-mono text-xs outline-none focus:border-[#c9a45c]"
      />
      <button
        type="button"
        onClick={handleAdd}
        disabled={busy || text.trim().length === 0}
        className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
      >
        <Plus className="h-3.5 w-3.5" /> {busy ? 'Menyimpan…' : 'Simpan ke Daftar'}
      </button>
      {error ? <p className="mt-2 text-[11px] text-red-500">{error}</p> : null}

      <p className="mt-3 text-[11px] text-[#8a6d2f]">
        Total <b>{guests.length}</b> tamu tersimpan.
      </p>
      <div className="mt-2 max-h-80 overflow-y-auto rounded-xl border border-[#e7ddcc]">
        {guests.length === 0 ? (
          <p className="px-3 py-3 text-[11px] text-[#b3a69a]">Belum ada tamu tersimpan.</p>
        ) : (
          guests.map((g) => (
            <div key={g.id} className="flex items-center gap-2 border-b border-[#e7ddcc]/70 px-3 py-2 last:border-0">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#2b2620]">{g.name}</p>
                <p className="truncate text-[10px] text-[#b3a69a]">{g.phone ? g.phone : 'tanpa nomor'}</p>
              </div>
              <button
                type="button"
                onClick={() => copy(`g-${g.id}`, linkFor(g.name))}
                title="Salin link personal"
                className="flex shrink-0 items-center gap-1 rounded-lg border border-[#e0d6c2] px-2 py-1.5 text-[11px] text-[#4a443c] hover:border-[#c9a45c]"
              >
                {copied === `g-${g.id}` ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                Link
              </button>
              <a
                href={waLink(g.phone ?? '', msgFor(g.name))}
                target="_blank"
                rel="noreferrer"
                title="Kirim WhatsApp"
                className="flex shrink-0 items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-medium text-white hover:bg-emerald-500"
              >
                <Send className="h-3 w-3" /> WA
              </a>
              <button
                type="button"
                onClick={async () => {
                  await deleteGuest(projectId, g.id);
                  setGuests((list) => list.filter((x) => x.id !== g.id));
                }}
                title="Hapus"
                className="shrink-0 rounded-lg border border-[#e0d6c2] p-1.5 text-red-500 hover:border-red-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
