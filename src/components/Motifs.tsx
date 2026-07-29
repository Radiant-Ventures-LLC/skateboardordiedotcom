import type { SVGProps } from 'react';

export type MotifProps = SVGProps<SVGSVGElement> & {
  /** Pixel size (width & height). Defaults to 1em so it flows with text. */
  size?: number | string;
};

function base(size: MotifProps['size']) {
  return {
    width: size ?? '1em',
    height: size ?? '1em',
    fill: 'currentColor',
    'aria-hidden': true as const,
    focusable: false as const,
  };
}

/** Five-point red star — the mark of skateAF. */
export function Star({ size, ...props }: MotifProps) {
  return (
    <svg viewBox="0 0 24 24" {...base(size)} {...props}>
      <path d="M12 1.6l3.09 6.26 6.91 1-5 4.87 1.18 6.88L12 17.34 5.82 20.6 7 13.73l-5-4.87 6.91-1L12 1.6z" />
    </svg>
  );
}

/** Raised fist — solidarity, joy, drop-in energy. */
export function Fist({ size, ...props }: MotifProps) {
  return (
    <svg viewBox="0 0 24 24" {...base(size)} {...props}>
      <path d="M7 10V4.6a1.4 1.4 0 0 1 2.8 0V9h.6V3.4a1.4 1.4 0 0 1 2.8 0V9h.6V4.2a1.4 1.4 0 0 1 2.8 0V9h.6V6.6a1.4 1.4 0 0 1 2.8 0V13a8 8 0 0 1-8 8 8 8 0 0 1-8-8v-1.6a1.4 1.4 0 0 1 2.4-1l1.2 1.2V10z" />
    </svg>
  );
}

/** Skate wheel — motion, freedom, rolling forever. */
export function Wheel({ size, ...props }: MotifProps) {
  return (
    <svg viewBox="0 0 24 24" {...base(size)} {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"
      />
    </svg>
  );
}
