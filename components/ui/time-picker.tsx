"use client";

import React, { useEffect, useRef, useState } from "react";

// ─── constants ────────────────────────────────────────────────────────────────

const ITEM_H = 48; // px – height of one drum slot
const VISIBLE = 5; // number of slots shown in the drum window

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

// ─── Drum component ───────────────────────────────────────────────────────────

interface DrumProps {
  items: string[];
  index: number;
  active: boolean;
  onSelect: (i: number) => void;
  onActivate: () => void;
}

function Drum({ items, index, active, onSelect, onActivate }: DrumProps) {
  const clamp = (i: number) => Math.max(0, Math.min(items.length - 1, i));

  // ── touch / mouse drag ──────────────────────────────────────────────────────
  const dragRef = useRef<{ startY: number; startIndex: number } | null>(null);

  const startDrag = (y: number) => {
    dragRef.current = { startY: y, startIndex: index };
  };

  const moveDrag = (y: number) => {
    if (!dragRef.current) return;
    const delta = Math.round((dragRef.current.startY - y) / (ITEM_H * 0.6));
    onSelect(clamp(dragRef.current.startIndex + delta));
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  // ── wheel (non-passive so we can prevent page scroll) ───────────────────────
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = divRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      onSelect(clamp(index + (e.deltaY > 0 ? 1 : -1)));
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  });

  const slotOffsets = [-2, -1, 0, 1, 2];

  return (
    <div
      ref={divRef}
      className={`relative select-none overflow-hidden rounded-xl border-2 transition-all cursor-grab active:cursor-grabbing ${
        active
          ? "border-blue-500 shadow-md shadow-blue-200"
          : "border-slate-200 hover:border-slate-300"
      }`}
      style={{ width: 88, height: ITEM_H * VISIBLE }}
      onClick={onActivate}
      onTouchStart={(e) => { onActivate(); startDrag(e.touches[0].clientY); }}
      onTouchMove={(e) => moveDrag(e.touches[0].clientY)}
      onTouchEnd={endDrag}
      onMouseDown={(e) => {
        startDrag(e.clientY);
        const onMove = (ev: MouseEvent) => moveDrag(ev.clientY);
        const onUp = () => {
          endDrag();
          window.removeEventListener("mousemove", onMove);
          window.removeEventListener("mouseup", onUp);
        };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
      }}
    >
      {/* Selection highlight band */}
      <div
        className={`pointer-events-none absolute inset-x-0 border-t-2 border-b-2 transition-colors ${
          active ? "bg-blue-100 border-blue-400" : "bg-slate-100 border-slate-300"
        }`}
        style={{ top: ITEM_H * 2, height: ITEM_H }}
      />

      {/* Slots */}
      {slotOffsets.map((offset, slot) => {
        const itemIdx = index + offset;
        const inRange = itemIdx >= 0 && itemIdx < items.length;
        const isCenter = offset === 0;
        const dist = Math.abs(offset);
        return (
          <div
            key={slot}
            className="absolute inset-x-0 flex items-center justify-center font-mono font-bold pointer-events-none transition-all"
            style={{
              top: ITEM_H * slot,
              height: ITEM_H,
              fontSize: isCenter ? 30 : dist === 1 ? 20 : 13,
              opacity: inRange ? (isCenter ? 1 : dist === 1 ? 0.45 : 0.2) : 0,
              color: isCenter ? (active ? "#1d4ed8" : "#0f172a") : "#64748b",
            }}
          >
            {inRange ? items[itemIdx] : ""}
          </div>
        );
      })}

      {/* Gradient fade top */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white to-transparent" />
      {/* Gradient fade bottom */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
    </div>
  );
}

// ─── TimePicker ───────────────────────────────────────────────────────────────

interface TimePickerProps {
  value: string; // "HH:MM" or ""
  onChange: (value: string) => void;
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const [hourIdx, setHourIdx] = useState(0);
  const [minIdx, setMinIdx] = useState(0);
  const [activeField, setActiveField] = useState<"hour" | "min">("hour");
  const [buffer, setBuffer] = useState("");

  // ── open ─────────────────────────────────────────────────────────────────────
  const openPicker = () => {
    const valid = /^\d{2}:\d{2}$/.test(value);
    setHourIdx(valid ? Math.min(23, parseInt(value.slice(0, 2), 10)) : 0);
    setMinIdx(valid ? Math.min(59, parseInt(value.slice(3, 5), 10)) : 0);
    setActiveField("hour");
    setBuffer("");
    setOpen(true);
  };

  // ── confirm ──────────────────────────────────────────────────────────────────
  const handleOK = () => {
    onChange(`${HOURS[hourIdx]}:${MINUTES[minIdx]}`);
    setOpen(false);
  };

  // ── now ───────────────────────────────────────────────────────────────────────
  const handleNow = () => {
    const now = new Date();
    setHourIdx(now.getHours());
    setMinIdx(now.getMinutes());
    setActiveField("hour");
    setBuffer("");
  };

  // ── drum change (clear buffer) ────────────────────────────────────────────────
  const handleHourDrum = (i: number) => { setHourIdx(i); setBuffer(""); };
  const handleMinDrum = (i: number) => { setMinIdx(i); setBuffer(""); };

  // ── keypad ────────────────────────────────────────────────────────────────────
  const handleDigit = (digit: string) => {
    const nb = buffer + digit;
    if (activeField === "hour") {
      const d = parseInt(digit, 10);
      if (nb.length === 1) {
        // If first digit ≥ 3 it can't be a valid tens digit (hours 00-23)
        if (d >= 3) {
          setHourIdx(d); // treat as single-digit hour (03-09)
          setBuffer("");
          setActiveField("min");
        } else {
          setHourIdx(d);
          setBuffer(nb);
        }
      } else {
        const h = parseInt(nb, 10);
        setHourIdx(h <= 23 ? h : d); // fallback to latest digit if invalid
        setBuffer("");
        setActiveField("min");
      }
    } else {
      const d = parseInt(digit, 10);
      if (nb.length === 1) {
        if (d >= 6) {
          // First digit ≥ 6 can't be valid tens (minutes 00-59)
          setMinIdx(d);
          setBuffer("");
        } else {
          setMinIdx(d * 10); // tentative (e.g., "3" → 30)
          setBuffer(nb);
        }
      } else {
        const m = parseInt(nb, 10);
        setMinIdx(m <= 59 ? m : d);
        setBuffer("");
      }
    }
  };

  const handleBackspace = () => {
    if (buffer.length > 0) {
      setBuffer(buffer.slice(0, -1));
    } else if (activeField === "min") {
      setActiveField("hour");
    }
  };

  // ── display ───────────────────────────────────────────────────────────────────
  const display = /^\d{2}:\d{2}$/.test(value) ? value : "--:--";

  // ── render ────────────────────────────────────────────────────────────────────
  return (
    <>
      <button
        type="button"
        onClick={openPicker}
        className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-left text-sm font-mono font-bold tracking-widest text-slate-800 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {display}
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 sm:items-center"
          onClick={handleOK}
        >
          <div
            className="w-full max-w-sm rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-2xl flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title */}
            <p className="text-center text-base font-semibold text-slate-700">Set Time</p>

            {/* Drums */}
            <div className="flex items-center justify-center gap-3">
              <div className="flex flex-col items-center gap-1">
                <button
                  type="button"
                  className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                  onClick={() => handleHourDrum(Math.max(0, hourIdx - 1))}
                  aria-label="Hour up"
                >
                  ▲
                </button>
                <Drum
                  items={HOURS}
                  index={hourIdx}
                  active={activeField === "hour"}
                  onSelect={handleHourDrum}
                  onActivate={() => { setActiveField("hour"); setBuffer(""); }}
                />
                <button
                  type="button"
                  className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                  onClick={() => handleHourDrum(Math.min(23, hourIdx + 1))}
                  aria-label="Hour down"
                >
                  ▼
                </button>
                <span className="text-xs text-slate-400">HH</span>
              </div>

              <span className="text-4xl font-black text-slate-600 pb-6">:</span>

              <div className="flex flex-col items-center gap-1">
                <button
                  type="button"
                  className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                  onClick={() => handleMinDrum(Math.max(0, minIdx - 1))}
                  aria-label="Minute up"
                >
                  ▲
                </button>
                <Drum
                  items={MINUTES}
                  index={minIdx}
                  active={activeField === "min"}
                  onSelect={handleMinDrum}
                  onActivate={() => { setActiveField("min"); setBuffer(""); }}
                />
                <button
                  type="button"
                  className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                  onClick={() => handleMinDrum(Math.min(59, minIdx + 1))}
                  aria-label="Minute down"
                >
                  ▼
                </button>
                <span className="text-xs text-slate-400">MM</span>
              </div>
            </div>

            {/* Field indicator */}
            <div className="flex justify-center gap-6 text-xs font-semibold">
              <span
                className={`px-3 py-1 rounded-full cursor-pointer transition-colors ${
                  activeField === "hour"
                    ? "bg-blue-100 text-blue-700"
                    : "text-slate-400 hover:text-slate-600"
                }`}
                onClick={() => { setActiveField("hour"); setBuffer(""); }}
              >
                Hours{activeField === "hour" && buffer ? ` [${buffer}_]` : ""}
              </span>
              <span
                className={`px-3 py-1 rounded-full cursor-pointer transition-colors ${
                  activeField === "min"
                    ? "bg-blue-100 text-blue-700"
                    : "text-slate-400 hover:text-slate-600"
                }`}
                onClick={() => { setActiveField("min"); setBuffer(""); }}
              >
                Minutes{activeField === "min" && buffer ? ` [${buffer}_]` : ""}
              </span>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDigit(d)}
                  className="h-14 rounded-2xl bg-slate-100 text-2xl font-bold text-slate-800 hover:bg-slate-200 active:scale-95 transition-all"
                >
                  {d}
                </button>
              ))}
              {/* Now */}
              <button
                type="button"
                onClick={handleNow}
                className="h-14 rounded-2xl bg-blue-50 text-sm font-bold text-blue-700 hover:bg-blue-100 active:scale-95 transition-all flex flex-col items-center justify-center leading-tight"
              >
                <span className="text-base">🕐</span>
                <span className="text-xs">Now</span>
              </button>
              {/* 0 */}
              <button
                type="button"
                onClick={() => handleDigit("0")}
                className="h-14 rounded-2xl bg-slate-100 text-2xl font-bold text-slate-800 hover:bg-slate-200 active:scale-95 transition-all"
              >
                0
              </button>
              {/* Backspace */}
              <button
                type="button"
                onClick={handleBackspace}
                className="h-14 rounded-2xl bg-rose-50 text-xl font-bold text-rose-500 hover:bg-rose-100 active:scale-95 transition-all"
              >
                ⌫
              </button>
            </div>

            {/* OK / Cancel */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 h-12 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleOK}
                className="flex-1 h-12 rounded-xl bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
