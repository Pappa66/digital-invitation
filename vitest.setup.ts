import '@testing-library/jest-dom/vitest';

// jsdom tidak punya IntersectionObserver (dibutuhkan Framer Motion useInView).
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '0px';
  readonly thresholds: ReadonlyArray<number> = [0];
  private cb: IntersectionObserverCallback;

  constructor(cb: IntersectionObserverCallback) {
    this.cb = cb;
  }

  observe(_target: Element): void {
    this.cb(
      [{ isIntersecting: true, target: _target } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver
    );
  }

  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
