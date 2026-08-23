'use client';

import Image from 'next/image';
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
  WatermarkBlock,
  PopupBlock,
  CopyTextBlock
} from '@/components/guest/blocks';
import RSVPForm from '@/components/guest/rsvp';
import EnvelopeBlock from '@/components/guest/envelope';
import GiftListBlock from '@/components/guest/gift-list';
import { BuilderEditableContext } from '@/components/builder/inline-edit';
import { usePreview } from '@/components/guest/preview-context';
import { InnerProvider } from '@/components/guest/inner-context';
import { DecorLayer } from '@/components/guest/blocks';
import { useTheme } from '@/components/guest/theme-context';

interface BlockViewProps {
  block: Block;
  projectId?: string;
  editable?: boolean;
  greetingName?: string;
  cardStyle?: boolean;
  demo?: boolean;
  showCoverButton?: boolean;
}

export default function BlockView({ block, projectId, editable = false, greetingName, cardStyle, demo, showCoverButton = true }: BlockViewProps) {
  const preview = usePreview();
  const theme = useTheme();
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
    case 'Popup':
      view = <PopupBlock props={block.props} />;
      break;
    case 'CopyText':
      view = <CopyTextBlock props={block.props} />;
      break;
    default:
      return null;
  }

  const isHero = block.type === 'Hero';
  const renderCard = cardStyle && !isHero;
  const cardVariant = theme?.card_variant ?? 'shadow';
  
  const cardVariants: Record<string, string> = {
    shadow: 'overflow-hidden rounded-2xl bg-[var(--color-background)] shadow-[0_12px_40px_rgba(0,0,0,0.12)] ring-1 ring-black/5',
    outline: 'overflow-hidden rounded-2xl bg-[var(--color-background)] ring-2 ring-[var(--color-primary)]/25',
    glass: 'overflow-hidden rounded-2xl bg-white/15 backdrop-blur-xl ring-1 ring-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.15)]',
    minimal: 'overflow-hidden rounded-xl bg-[var(--color-background)]',
    elevated: 'overflow-hidden rounded-3xl bg-[var(--color-background)] shadow-[0_20px_50px_rgba(0,0,0,0.16)]',
    flat: 'overflow-hidden rounded-none bg-current/[0.03] border border-current/10',
    arch: 'overflow-hidden rounded-t-[999px] bg-[var(--color-background)] shadow-[0_12px_40px_rgba(0,0,0,0.12)] ring-1 ring-black/5',
    tilt: 'overflow-hidden rounded-2xl rotate-1 bg-[var(--color-background)] shadow-[0_14px_38px_rgba(0,0,0,0.13)] ring-1 ring-black/5',
    double: 'overflow-hidden rounded-2xl bg-[var(--color-background)] shadow-[0_10px_30px_rgba(0,0,0,0.10)] outline outline-1 outline-offset-[-8px] outline-[var(--color-secondary)]/40',
    gold: 'overflow-hidden rounded-2xl bg-gradient-to-b from-[var(--color-background)] to-[color-mix(in srgb,var(--color-primary) 6%,var(--color-background))] shadow-[0_14px_40px_rgba(0,0,0,0.14)] ring-1 ring-[var(--color-primary)]/25',
  };
  const cardCls = cardVariants[cardVariant] || cardVariants.shadow;
  const cardWrapCls = `${cardCls} mx-0 mb-1.5 mt-1.5 w-full max-w-full min-w-0 box-border`;
  
  const hideOn = block.style?.hideOn ?? [];
  const hideClasses = [
    hideOn.includes('mobile') ? ' max-sm:hidden' : '',
    hideOn.includes('tablet') ? ' sm:hidden md:block' : '',
    hideOn.includes('desktop') ? ' md:hidden' : ''
  ].join('');
  const body = (
    <StyledSection style={block.style}>{view}</StyledSection>
  );

  const revealClass = '';

  return (
    <InnerProvider value={block.inner ?? undefined}>
      <BuilderEditableContext.Provider value={editable ? { blockId: block.id } : null}>
        <div
          ref={undefined}
          data-block-type={block.type}
          className={`relative w-full min-w-0 max-w-full overflow-hidden box-border transition-[background-color,background-image,opacity] duration-500 ease-out${hideClasses ? ' ' + hideClasses : ''}${revealClass ? ' ' + revealClass : ''}`}
        >
          {renderCard ? <div className={cardWrapCls}>{body}</div> : body}
          <DecorLayer blockId={block.id} decor={block.decor} />
        </div>
      </BuilderEditableContext.Provider>
    </InnerProvider>
  );
}

function StyledSection({ style, children }: { style?: BlockStyle; children: React.ReactNode }) {
  if (!style || (!style.textColor && !style.headingColor && !style.subtitleColor && !style.accentColor && !style.bgColor && !style.bgGradient && !style.bgImage && !style.borderRadius && !style.border && !style.boxShadow && !style.padding && style.opacity === undefined && !style.textAlign)) {
    return <>{children}</>;
  }

  const css: Record<string, string | number> = {};
  if (style.textColor) {
    css.color = style.textColor;
    css['--section-text-color'] = style.textColor;
  }
  if (style.headingColor) css['--section-heading-color'] = style.headingColor;
  if (style.subtitleColor) css['--section-subtitle-color'] = style.subtitleColor;
  if (style.accentColor) css['--section-accent-color'] = style.accentColor;
  if (style.bgGradient) css.backgroundImage = style.bgGradient;
  else if (style.bgColor) css.backgroundColor = style.bgColor;
  if (style.borderRadius) css.borderRadius = style.borderRadius;
  if (style.border) css.border = style.border;
  if (style.boxShadow) css.boxShadow = style.boxShadow;
  if (style.padding) css.padding = style.padding;
  if (style.opacity !== undefined) css.opacity = Math.min(1, Math.max(0, style.opacity));
  if (style.textAlign) css.textAlign = style.textAlign;

  const hasColorOverride = style.textColor || style.headingColor || style.subtitleColor || style.accentColor;
  const textOverride = hasColorOverride ? ' data-text-override' : '';

  if (style.bgImage) {
    const mono = style.bgMonochrome !== false;
    const isVideoBg = /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(style.bgImage);
    return (
      <div className={`relative overflow-hidden transition-[background-color,background-image] duration-500 ease-out${textOverride}`} style={css}>
        <div className="absolute inset-0 z-0">
          {isVideoBg ? (
            <video
              src={style.bgImage}
              autoPlay
              loop
              muted
              playsInline
              className={`absolute inset-0 h-full w-full object-cover ${mono ? 'opacity-30 saturate-0' : 'opacity-40'}`}
              style={{ objectPosition: style.bgPosition || 'center' }}
            />
          ) : (
            <Image
              src={style.bgImage}
              alt=""
              fill
              sizes="100vw"
              quality={75}
              loading="lazy"
              className={`${style.bgFit === 'contain' ? 'object-contain' : 'object-cover'} ${mono ? 'opacity-30 saturate-0' : 'opacity-40'}`}
              style={{ objectPosition: style.bgPosition || 'center' }}
            />
          )}
          {mono && <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/30" />}
        </div>
        <div className="relative z-10 rounded-2xl mx-3 my-4 bg-[var(--color-background)]/80 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.12)] ring-1 ring-black/5 px-4 py-2">{children}</div>
      </div>
    );
  }

  return <div className={`transition-[background-color,background-image] duration-500 ease-out${textOverride || ''}`} style={css}>{children}</div>;
}