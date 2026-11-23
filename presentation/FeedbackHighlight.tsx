import { useEffect, useId, useRef, useSyncExternalStore } from 'react';
import { feedbackNotes } from './feedback-notes.js';
import './feedback-highlight.css';

function subscribeToFeedback(callback: () => void) {
  document.addEventListener('peer-feedback-change', callback);
  return () => document.removeEventListener('peer-feedback-change', callback);
}

function isFeedbackVisible() {
  return document.documentElement.hasAttribute('data-show-peer-feedback');
}

type FeedbackProps = { topic: keyof typeof feedbackNotes; locale: 'ko' | 'en' };

export function FeedbackHighlight(props: FeedbackProps) {
  const visible = useSyncExternalStore(subscribeToFeedback, isFeedbackVisible);
  return visible ? <FeedbackMarker {...props} /> : null;
}

function FeedbackMarker({ topic, locale }: FeedbackProps) {
  const id = useId();
  const markerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number>(undefined);
  const note = feedbackNotes[topic];
  const [title, feedback, change] = note[locale];

  function cancelClose() {
    window.clearTimeout(closeTimer.current);
  }

  function scheduleClose() {
    cancelClose();
    closeTimer.current = window.setTimeout(() => tooltipRef.current?.hidePopover(), 200);
  }

  function open(x: number, y: number) {
    cancelClose();
    const tooltip = tooltipRef.current!;
    const previous = document.querySelector<HTMLElement>('.peer-feedback-tooltip:popover-open');
    if (previous !== tooltip) previous?.hidePopover();
    tooltip.showPopover();
    const { width, height } = tooltip.getBoundingClientRect();
    const gap = 12;
    const bottom = y + gap + height;
    const top = bottom > window.innerHeight - gap ? y - gap - height : y + gap;
    tooltip.style.left = `${Math.max(gap, Math.min(x + gap, window.innerWidth - width - gap))}px`;
    tooltip.style.top = `${Math.max(gap, top)}px`;
  }

  function openByMarker(marker: HTMLButtonElement) {
    const rect = marker.getBoundingClientRect();
    open(rect.left + 12, Math.max(0, rect.top));
  }

  useEffect(() => {
    const tooltip = tooltipRef.current!;
    const marker = markerRef.current!;
    const close = () => tooltip.hidePopover();
    const dismissOutside = (event: PointerEvent) => {
      if (!event.composedPath().includes(marker) && !event.composedPath().includes(tooltip)) close();
    };
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('scroll', close);
    window.addEventListener('resize', close);
    document.addEventListener('pointerdown', dismissOutside);
    document.addEventListener('keydown', dismissOnEscape);
    return () => {
      window.clearTimeout(closeTimer.current);
      window.removeEventListener('scroll', close);
      window.removeEventListener('resize', close);
      document.removeEventListener('pointerdown', dismissOutside);
      document.removeEventListener('keydown', dismissOnEscape);
    };
  }, []);

  return (
    <>
      <button
        ref={markerRef}
        type="button"
        className="peer-feedback-outline"
        data-feedback-topic={topic}
        aria-label={title}
        aria-describedby={id}
        onPointerEnter={event => {
          if (event.pointerType !== 'touch') open(event.clientX, event.clientY);
        }}
        onPointerLeave={event => {
          if (!event.currentTarget.matches(':focus-visible')) scheduleClose();
        }}
        onFocus={event => {
          if (event.currentTarget.matches(':focus-visible')) openByMarker(event.currentTarget);
        }}
        onBlur={scheduleClose}
        onClick={event => {
          if (!tooltipRef.current?.matches(':popover-open')) openByMarker(event.currentTarget);
        }}
      >
        <span className="peer-feedback-number" aria-hidden="true">{note.number}</span>
        {['top', 'right', 'bottom', 'left'].map(edge => (
          <span key={edge} className={`peer-feedback-edge peer-feedback-edge-${edge}`} aria-hidden="true" />
        ))}
      </button>
      <div
        ref={tooltipRef}
        id={id}
        popover="manual"
        role="tooltip"
        className="peer-feedback-tooltip"
        onPointerEnter={cancelClose}
        onPointerLeave={scheduleClose}
      >
        <strong>{title}</strong>
        <p><b>{locale === 'ko' ? '받은 피드백' : 'Peer feedback'}</b>{feedback}</p>
        <p><b>{locale === 'ko' ? '최신 버전에서 바뀐 점' : 'What changed'}</b>{change}</p>
      </div>
    </>
  );
}
