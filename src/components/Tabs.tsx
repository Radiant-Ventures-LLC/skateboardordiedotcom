'use client';

import { useState, useId, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface TabItem {
  /** Stable key for the tab. */
  value: string;
  label: ReactNode;
  content: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  /** Controlled active value. */
  value?: string;
  /** Uncontrolled initial value. Defaults to the first item. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

/**
 * Tabs — blocky selector tabs. The active tab is a pasted red placard that
 * connects to the panel below it. Keyboard-navigable.
 */
export function Tabs({ items, value, defaultValue, onValueChange, className }: TabsProps) {
  const baseId = useId();
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.value);
  const active = value ?? internal;

  const select = (v: string) => {
    if (value === undefined) setInternal(v);
    onValueChange?.(v);
  };

  const activeItem = items.find((i) => i.value === active) ?? items[0];

  return (
    <div className={cn('flex flex-col', className)}>
      <div role="tablist" className="flex flex-wrap gap-[3px]">
        {items.map((item) => {
          const selected = item.value === active;
          return (
            <button
              key={item.value}
              role="tab"
              type="button"
              id={`${baseId}-tab-${item.value}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${item.value}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(item.value)}
              className={cn(
                'border-3 border-void px-md py-sm font-display font-600 uppercase tracking-slogan text-body transition-colors',
                selected
                  ? 'bg-flag text-paper -mb-[3px] border-b-paper'
                  : 'bg-paper text-ink hover:bg-concrete-50'
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`${baseId}-panel-${activeItem?.value}`}
        aria-labelledby={`${baseId}-tab-${activeItem?.value}`}
        className="border-3 border-void bg-paper p-lg"
      >
        {activeItem?.content}
      </div>
    </div>
  );
}
