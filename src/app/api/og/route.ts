import React from 'react';
import { ImageResponse } from 'next/og';
import { createServerSupabase } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const h = React.createElement;

/** OG image undangan: nama pasangan + warna tema (fallback brand). */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') ?? '';

  let title = 'Undangan Digital';
  let names = '';
  let primary = '#d4af37';
  let secondary = '#8a6d2f';
  let background = '#111827';

  if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true' && slug) {
    try {
      const supabase = await createServerSupabase();
      const { data } = await supabase.rpc('get_published_design', { p_slug: slug });
      const row = Array.isArray(data) ? data[0] : null;
      if (row) {
        const canvas = row.canvas_data as {
          theme?: { primary?: string; secondary?: string; background?: string };
          blocks?: { type: string; props?: Record<string, unknown> }[];
        };
        title = row.title ?? title;
        primary = canvas?.theme?.primary ?? primary;
        secondary = canvas?.theme?.secondary ?? secondary;
        background = canvas?.theme?.background ?? background;
        const hero = (canvas?.blocks ?? []).find((b) => b.type === 'Hero')?.props;
        const groom = typeof hero?.groom === 'string' ? hero.groom : '';
        const bride = typeof hero?.bride === 'string' ? hero.bride : '';
        if (groom || bride) names = `${groom} & ${bride}`;
      }
    } catch (e) {
      console.error('[OG] Failed to fetch design for slug:', slug, e);
      /* fallback ke brand */
    }
  }

  return new ImageResponse(
    h(
      'div',
      {
        style: {
          display: 'flex',
          height: '100%',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${primary}, ${secondary})`,
          fontFamily: 'serif'
        }
      },
      h(
        'div',
        {
          style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: 64,
            gap: 20,
            color: background
          }
        },
        h(
          'div',
          {
            style: {
              display: 'flex',
              fontSize: 30,
              letterSpacing: 12,
              textTransform: 'uppercase',
              opacity: 0.9
            }
          },
          'Undangan Digital'
        ),
        h(
          'div',
          {
            style: {
              display: 'flex',
              fontSize: 72,
              fontWeight: 700,
              maxWidth: 900,
              lineHeight: 1.15
            }
          },
          names || title
        ),
        names
          ? h('div', { style: { display: 'flex', fontSize: 26, opacity: 0.8 } }, title)
          : null
      )
    ),
    { width: 1200, height: 630 }
  );
}