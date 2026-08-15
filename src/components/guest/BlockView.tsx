'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import type { Block, BlockStyle } from '@/lib/types';
import {
  HeroBlock,
  CoupleBlock,
  CountdownBlock,
  EventDetailBlock,
  StoryBlock,
  GalleryBlock,
  MapsBlock,
  ThanksBlock,
  DividerBlock,
  TextBlock,
  PhotoBlock,
  QuoteBlock
} from '@/components/guest/blocks';
import RSVPForm from '@/components/guest/rsvp';
import EnvelopeBlock from '@/components/guest/envelope';
import GiftListBlock from '@/components/guest/gift-list';
import { BuilderEditableContext } from '@/components/builder/inline-edit';
import { usePreview } from '@/components/guest/preview-context';
import { InnerProvider } from '@/components/guest/inner-context';
import { DecorLayer } from '@/components/guest/blocks';

interface BlockViewProps {
  block: Block;
  /** projectId untuk RSVP DB insert. Kosong = readonly preview. */
  projectId?: string;
  /** Aktifkan edit-inline (hanya di builder). */
  editable?: boolean;
  /** Nama tamu (dari ?to=) untuk sapaan di Hero. */
  greetingName?: string;
  /** Mode card-template: bungkus section (kecuali Hero) sebagai kartu. */
  cardStyle?: boolean;
  /** Mode demo interaktif: tetap jalankan animasi entrance walau preview. */
  demo?: boolean;
}

export default function BlockView({ block, projectId, editable = false, greetingName, cardStyle, demo }: BlockViewProps) {
  const preview = usePreview();
  const animateEntrance = (!preview || demo) && !editable;
  let view: React.ReactNode;
  switch (block.type) {
    case 'Hero':
      view = <HeroBlock props={block.props} greetingName={greetingName} />;
      break;
    case 'Couple':
      view = <CoupleBlock props={block.props} />;
      break;
    case 'Countdown':
      view = <CountdownBlock props={block.props} />;
      break;
    case 'EventDetail':
      view = <EventDetailBlock props={block.props} />;
      break;
    case 'Story':
      view = <StoryBlock props={block.props} />;
      break;
    case 'Gallery':
      view = <GalleryBlock props={block.props} />;
      break;
    case 'RSVP':
      view = <RSVPForm projectId={projectId ?? ''} blockProps={block.props} readonly={!projectId} />;
      break;
    case 'Envelope':
      view = <EnvelopeBlock props={block.props} />;
      break;
    case 'GiftList':
      view = <GiftListBlock props={block.props} />;
      break;
    case 'Maps':
      view = <MapsBlock props={block.props} />;
      break;
    case 'Thanks':
      view = <ThanksBlock props={block.props} />;
      break;
    case 'Divider':
      view = <DividerBlock props={block.props} />;
      break;
    case 'Text':
      view = <TextBlock props={block.props} />;
      break;
    case 'Photo':
      view = <PhotoBlock props={block.props} />;
      break;
    case 'Quote':
      view = <QuoteBlock props={block.props} />;
      break;
    default:
      return null;
  }

  const isHero = block.type === 'Hero';
  const renderCard = cardStyle && !isHero;
  const cardCls =
    'card-mask overflow-hidden rounded-2xl bg-[var(--color-background)] shadow-[0_8px_26px_rgba(0,0,0,0.12)] ring-1 ring-black/5';
  const cardWrapCls = `${cardCls} mx-0 mb-6 mt-6 w-full`;
  const body = (
    <StyledSection style={block.style}>{view}</StyledSection>
  );

  return (
    <InnerProvider value={block.inner ?? undefined}>
      <BuilderEditableContext.Provider value={editable ? { blockId: block.id } : null}>
        <div data-block-type={block.type} className="relative">
          {animateEntrance ? (
            <motion.div
              initial={{ opacity: 0, y: 44, scale: 0.985, filter: 'blur(6px)' }}
              whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              viewport={{ once: true, amount: 0.12 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {renderCard ? <div className={cardWrapCls}>{body}</div> : body}
            </motion.div>
          ) : (
            renderCard ? <div className={cardWrapCls}>{body}</div> : body
          )}
          <DecorLayer blockId={block.id} decor={block.decor} />
        </div>
      </BuilderEditableContext.Provider>
    </InnerProvider>
  );
}

function StyledSection({ style, children }: { style?: BlockStyle; children: React.ReactNode }) {
  if (!style || (!style.textColor && !style.bgColor && !style.bgGradient && !style.bgImage)) {
    return <>{children}</>;
  }

  const css: React.CSSProperties = {};
  if (style.textColor) {
    css.color = style.textColor;
    (css as Record<string, string>)['--section-text-color'] = style.textColor;
  }
  if (style.bgGradient) css.backgroundImage = style.bgGradient;
  else if (style.bgColor) css.backgroundColor = style.bgColor;

  const textOverride = style.textColor ? ' data-text-override' : '';

  if (style.bgImage) {
    return (
      <div className={`relative${textOverride}`} style={css}>
        <div className="absolute inset-0 z-0">
          <Image
            src={style.bgImage}
            alt=""
            fill
            sizes="(min-width: 768px) 420px, 100vw"
            quality={75}
            loading="lazy"
            className={`${style.bgFit === 'contain' ? 'object-contain' : 'object-cover'}`}
            style={{ objectPosition: style.bgPosition || 'center' }}
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10">{children}</div>
      </div>
    );
  }

  return <div className={textOverride || undefined} style={css}>{children}</div>;
}