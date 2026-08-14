'use client';

import { useState } from 'react';
import { BookmarkPlus } from 'lucide-react';
import type { CanvasData } from '@/lib/types';
import { userTemplateSave } from '@/lib/demo/user-templates';

interface SaveTemplateDialogProps {
  open: boolean;
  canvas: CanvasData;
  defaultName: string;
  onClose: () => void;
}

export default function SaveTemplateDialog({ open, canvas, defaultName, onClose }: SaveTemplateDialogProps) {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  async function handleSave() {
    setSaving(true);
    const trimmed = name.trim() || defaultName.trim() || 'Undangan Saya';
    userTemplateSave({
      name: trimmed,
      category: 'Template Saya',
      description: note.trim() || 'Desain yang disimpan dari Builder.',
      primary: canvas.theme.primary,
      secondary: canvas.theme.secondary,
      canvas
    });
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <div className="flex items-center gap-2">
          <BookmarkPlus className="h-5 w-5 text-gray-900" />
          <h3 className="text-base font-semibold text-gray-900">Simpan sebagai Template</h3>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Desain ini akan tersimpan sebagai template di halaman Templates, lengkap dengan tema warna & blok.
        </p>
        <label className="mt-4 block text-xs font-medium text-gray-700">Nama template</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={defaultName || 'cth: Elegant Navy'}
          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900"
        />
        <label className="mt-3 block text-xs font-medium text-gray-700">Catatan (opsional)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="cth: dipakai untuk bulan November"
          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900"
        />
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}