'use client';

import { createContext, useContext, useEffect, useRef } from 'react';
import { useBuilderStore } from '@/store/builder-store';

interface EditableCtx {
  blockId: string;
}

/** Context hanya ada saat mode builder (di dalam BuilderCanvas). */
export const BuilderEditableContext = createContext<EditableCtx | null>(null);

interface EditableProps {
  /** Nama prop pada blok (string atau string[]). */
  prop: string;
  /** Indeks untuk prop bertipe string[]. */
  index?: number;
  multiline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

function humanize(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Teks yang bisa diedit langsung di kanvas (mode builder).
 * Saat bukan mode builder (halaman guest), hanya merender teks biasa.
 * Menulis hanya pada blur untuk menjaga posisi kursor tetap stabil.
 */
export function Editable({ prop, index, multiline, className, children }: EditableProps) {
  const ctx = useContext(BuilderEditableContext);
  const ref = useRef<HTMLSpanElement>(null);

  const blockId = ctx?.blockId ?? '';
  const block = useBuilderStore((s) => (blockId ? s.canvas.blocks.find((x) => x.id === blockId) : undefined));
  const setBlockProps = useBuilderStore((s) => s.setBlockProps);
  const setSelectedText = useBuilderStore((s) => s.setSelectedText);

  const key = index === undefined ? prop : `${prop}.${index}`;
  const fontOverride = block?.style?.textSizes?.[key];

  const raw = block?.props[prop];
  const value =
    index === undefined
      ? typeof raw === 'string'
        ? raw
        : ''
      : Array.isArray(raw)
        ? (raw[index] as string) ?? ''
        : '';

  useEffect(() => {
    if (!ctx) return;
    const el = ref.current;
    if (!el) return;
    if (document.activeElement === el) return;
    if (el.textContent !== value) el.textContent = value;
  });

  if (!ctx) {
    return <span className={className} style={fontOverride ? { fontSize: fontOverride } : undefined}>{children}</span>;
  }

  function commit() {
    const el = ref.current;
    if (!el) return;
    const text = el.textContent ?? '';
    if (index === undefined) {
      setBlockProps(blockId, { [prop]: text });
    } else {
      const arr = Array.isArray(block?.props[prop]) ? [...(block.props[prop] as string[])] : [];
      while (arr.length <= index) arr.push('');
      arr[index] = text;
      setBlockProps(blockId, { [prop]: arr });
    }
  }

  return (
    <span
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      data-ph={humanize(prop)}
      style={fontOverride ? { fontSize: fontOverride } : undefined}
      className={`inline-block cursor-text rounded-sm outline-dashed outline-1 outline-offset-2 outline-transparent transition-colors hover:outline-blue-300 focus:outline-blue-500 empty:before:content-[attr(data-ph)] empty:before:text-gray-400 empty:before:italic ${
        className ?? ''
      }`}
      onFocus={() => setSelectedText(key)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (!multiline && e.key === 'Enter') {
          e.preventDefault();
          e.currentTarget.blur();
        }
        if (e.key === 'Escape') {
          const el = e.currentTarget;
          const arr =
            index === undefined
              ? block?.props[prop]
              : Array.isArray(block?.props[prop])
                ? (block.props[prop] as string[])
                : undefined;
          if (index === undefined) el.textContent = typeof arr === 'string' ? arr : '';
          else if (Array.isArray(arr)) el.textContent = (arr[index] as string) ?? '';
          el.blur();
        }
      }}
      onPaste={(e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        const el = e.currentTarget;
        const sel = window.getSelection();
        if (sel && el.contains(sel.anchorNode)) {
          document.execCommand('insertText', false, text);
        } else {
          el.textContent = text;
        }
      }}
    >
      {value}
    </span>
  );
}
