'use client';

import { createElement, type CSSProperties, type FocusEvent, type KeyboardEvent } from 'react';
import { createUsePuck } from '@puckeditor/core';
import type { config } from '@/puck/config';
import { setComponentProp } from '@/puck/overrides/position-utils';

const usePuckStore = createUsePuck<typeof config>();

interface EditableTextProps {
  value: string;
  /** Aktif saat editor (puck.isEditing). */
  editing?: boolean;
  componentId?: string;
  propKey?: string;
  as?: string;
  className?: string;
  style?: CSSProperties;
  placeholder?: string;
}

/** Teks statis (tamu). */
function StaticText({ value, as = 'span', className, style }: Pick<EditableTextProps, 'value' | 'as' | 'className' | 'style'>) {
  return createElement(as, { className, style }, value);
}

/** Teks bisa disunting inline (editor): klik → ubah → blur/Enter simpan. */
function EditingText({ value, componentId, propKey = 'text', as = 'span', className, style, placeholder }: EditableTextProps) {
  const dispatch = usePuckStore((s) => s.dispatch);

  function commit(e: FocusEvent<HTMLElement>) {
    const text = (e.currentTarget.textContent ?? '').trim();
    if (componentId && text !== value) {
      dispatch({ type: 'setData', data: (prev) => setComponentProp(prev, componentId, propKey, text) });
    }
  }

  return createElement(
    as,
    {
      contentEditable: true,
      suppressContentEditableWarning: true,
      spellCheck: false,
      title: 'Klik untuk ubah teks',
      onBlur: commit,
      onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.currentTarget.blur();
        }
        if (e.key === 'Escape') {
          e.currentTarget.textContent = value;
          e.currentTarget.blur();
        }
      },
      className: `outline-none transition-colors focus:bg-[#c9a45c]/10 focus:ring-1 focus:ring-[#c9a45c]/50 ${
        !value ? 'min-w-[2ch] border-b border-dashed border-current/40' : ''
      } ${className ?? ''}`,
      style
    },
    value || placeholder || ' '
  );
}

/** Teks editable: statis di tamu, inline-edit di editor. */
export default function EditableText(props: EditableTextProps) {
  return props.editing && props.componentId ? <EditingText {...props} /> : <StaticText {...props} />;
}
