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
  QuoteBlock,
  LiveStreamingBlock,
  EmptyBlock,
  WatermarkBlock
} from '@/components/guest/blocks';
import RSVPForm from '@/components/guest/rsvp';
import EnvelopeBlock from '@/components/guest/envelope';
import GiftListBlock from '@/components/guest/gift-list';
import { BuilderEditableContext } from '@/components/builder/inline-edit';
import { usePreview } from '@/components/guest/preview-context';
import { InnerProvider } from '@/components/guest/inner-context';
import { DecorLayer } from '@/components/guest/blocks';
import { useTheme } from '@/components/guest/theme-context';
import type { Theme } from '@/lib/types';

interface BlockViewProps {
  block: Block;
  projectId?: string;
  editable?: boolean;
  greetingName?: string;
  cardStyle?: boolean;
  demo?: boolean;
  /** Show "Buka Undangan" button in Hero (false when cover is enabled). */
  showCoverButton?: boolean;
}

export default function BlockView({ block, projectId, editable = false, greetingName, cardStyle, demo, showCoverButton = true }: BlockViewProps) {
  const preview = usePreview();
  const theme = useTheme();
  const animateEntrance = (!preview || demo) && !editable;
  let view: React.ReactNode;
  switch (block.type) {
    case 'Hero':
      view = <HeroBlock props={block.props} greetingName={greetingName} showButton={showCoverButton} />;
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
    case 'LiveStreaming':
      view = <LiveStreamingBlock props={block.props} />;
      break;
    case 'Empty':
      view = <EmptyBlock />;
      break;
    case 'Watermark':
      view = <WatermarkBlock props={block.props} />;
      break;
    default:
      return null;
  }

  const isHero = block.type === 'Hero';
  const renderCard = cardStyle && !isHero;
  const cardVariant = theme?.card_variant ?? 'shadow';
  
  const cardVariants: Record<string, string> = {
    shadow: 'overflow-hidden rounded-2xl bg-[var(--color-background)] shadow-[0_8px_26px_rgba(0,0,0,0.12)] ring-1 ring-black/5',
    outline: 'overflow-hidden rounded-2xl bg-[var(--color-background)] ring-1 ring-current/10',
    glass: 'overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/15',
    minimal: 'overflow-hidden rounded-xl bg-[var(--color-background)]',
    elevated: 'overflow-hidden rounded-2xl bg-[var(--color-background)] shadow-[0_12px_40px_rgba(0,0,0,0.18)]',
    flat: 'overflow-hidden rounded-2xl bg-current/[0.03]',
  };
  const cardCls = cardVariants[cardVariant] || cardVariants.shadow;
  const cardWrapCls = `${cardCls} mx-0 mb-6 mt-6 w-full`;
  
  const entranceVariants = {
    fade: { opacity: 0, y: 44, filter: 'blur(6px)' },
    slide: { opacity: 0, x: -30 },
    zoom: { opacity: 0, scale: 0.92 },
    blur: { opacity: 0, filter: 'blur(12px)' },
    rise: { opacity: 0, y: 60 },
  } as const;
  type EntranceKey = keyof typeof entranceVariants;
  const entranceAnim = entranceVariants[(theme?.card_entrance as EntranceKey) ?? 'fade'] ?? entranceVariants.fade;
  const body = (
    <StyledSection style={block.style}>{view}</StyledSection>
  );

  return (
    <InnerProvider value={block.inner ?? undefined}>
      <BuilderEditableContext.Provider value={editable ? { blockId: block.id } : null}>
        <div data-block-type={block.type} className="relative">
          {animateEntrance ? (
            <motion.div
              initial={entranceAnim}
              whileInView={{ opacity: 1, y: 0, x: 0, scale: 1, filter: 'blur(0px)' }}
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