"use client";

import { Children, isValidElement, useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { clsx } from "clsx";

/**
 * A styled, accessible drop-in for the native <select>. Native selects render
 * the OS picker (the iOS wheel, the Android sheet) which can't be themed, so the
 * menu here is custom markup — identical on every platform and browser.
 *
 * Keeps the declarative <option> children API. A hidden input carries the value
 * into the surrounding <form>; the menu is positioned `fixed` from the trigger
 * so it escapes `overflow-hidden`/`overflow-auto` ancestors (e.g. the members
 * table) instead of being clipped.
 */

interface Opt {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

function parseOptions(children: ReactNode): Opt[] {
  const opts: Opt[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === "option") {
      const p = child.props as { value?: string | number; children?: ReactNode; disabled?: boolean };
      opts.push({ value: String(p.value ?? ""), label: p.children, disabled: p.disabled });
    }
  });
  return opts;
}

type Placement = { left: number; width: number; top?: number; bottom?: number; dir: "down" | "up" };

export function Select({
  name,
  defaultValue,
  value: controlledValue,
  onValueChange,
  submitOnChange = false,
  required,
  disabled,
  className,
  "aria-label": ariaLabel,
  children,
}: {
  name?: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  /** Submit the enclosing form when a value is picked (role changes use this). */
  submitOnChange?: boolean;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  children: ReactNode;
}) {
  const options = parseOptions(children);
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? options[0]?.value ?? "");
  const value = controlledValue ?? uncontrolled;
  const selected = options.find((o) => o.value === value) ?? options[0];

  const [open, setOpen] = useState(false);
  const [place, setPlace] = useState<Placement | null>(null);
  const [active, setActive] = useState(0); // keyboard-focused option index

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const listId = useId();

  function measure() {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const below = window.innerHeight - r.bottom;
    const dir: "down" | "up" = below < 260 && r.top > below ? "up" : "down";
    setPlace(
      dir === "down"
        ? { left: r.left, width: r.width, top: r.bottom + 6, dir }
        : { left: r.left, width: r.width, bottom: window.innerHeight - r.top + 6, dir },
    );
  }

  function openMenu() {
    if (disabled) return;
    measure();
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  }

  // While open: focus management, outside-dismiss, Escape, and reposition-on-scroll.
  useEffect(() => {
    if (!open) return;
    optionRefs.current[active]?.focus();
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      if (document.getElementById(listId)?.contains(t)) return;
      setOpen(false);
    };
    const reposition = () => setOpen(false);
    document.addEventListener("pointerdown", onPointer, true);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      document.removeEventListener("pointerdown", onPointer, true);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [open, active, listId]);

  function choose(v: string) {
    if (controlledValue === undefined) setUncontrolled(v);
    setOpen(false);
    triggerRef.current?.focus();
    onValueChange?.(v);
    if (submitOnChange) requestAnimationFrame(() => hiddenRef.current?.form?.requestSubmit());
  }

  function onListKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(options.length - 1);
    }
  }

  function onTriggerKeyDown(e: React.KeyboardEvent) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      openMenu();
    }
  }

  return (
    <div ref={rootRef} className={clsx("relative", className)}>
      {name && <input ref={hiddenRef} type="hidden" name={name} value={value} required={required} />}

      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={clsx(
          "flex h-11 w-full items-center justify-between gap-2 rounded-lg border bg-cream px-4 text-left text-field text-ink transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue/30 disabled:cursor-not-allowed disabled:opacity-60",
          open ? "border-blue ring-2 ring-blue/30" : "border-mist hover:border-storm/30",
        )}
      >
        <span className="truncate">{selected?.label}</span>
        <svg
          viewBox="0 0 20 20"
          className={clsx("h-4 w-4 shrink-0 text-storm/60 transition-transform duration-200", open && "rotate-180")}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M6 8l4 4 4-4" />
        </svg>
      </button>

      {open && place && (
        <ul
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          onKeyDown={onListKeyDown}
          style={{
            position: "fixed",
            left: place.left,
            width: place.width,
            ...(place.dir === "down" ? { top: place.top } : { bottom: place.bottom }),
          }}
          className={clsx(
            "z-[70] max-h-60 overflow-y-auto overscroll-contain rounded-xl border border-mist bg-cream p-1",
            place.dir === "down" ? "animate-slide-down origin-top" : "animate-scale-in origin-bottom",
          )}
        >
          {options.map((o, i) => {
            const isSel = o.value === value;
            return (
              <li key={o.value} role="option" aria-selected={isSel}>
                <button
                  ref={(el) => {
                    optionRefs.current[i] = el;
                  }}
                  type="button"
                  disabled={o.disabled}
                  tabIndex={i === active ? 0 : -1}
                  onClick={() => choose(o.value)}
                  onMouseEnter={() => setActive(i)}
                  className={clsx(
                    "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-field transition-colors",
                    isSel ? "bg-ink/[0.04] text-ink" : "text-storm/90 hover:bg-ink/6 hover:text-ink",
                    i === active && !isSel && "bg-ink/6 text-ink",
                    o.disabled && "pointer-events-none opacity-40",
                  )}
                >
                  <span className="truncate">{o.label}</span>
                  {isSel && (
                    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-blue" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M4.5 10.5 8.2 14.2 15.5 5.8" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
