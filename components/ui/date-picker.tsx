"use client";

import React, { useEffect, useRef, useState } from "react";

// ─── constants ────────────────────────────────────────────────────────────────

const ITEM_H = 48;
const VISIBLE = 5;

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Days in a given month (1-based month, full year). */
function daysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

function buildDays(month: number, year: number): string[] {
  const count = daysInMonth(month, year);
  return Array.from({ length: count }, (_, i) => String(i + 1).padStart(2, "0"));
}

const YEAR_START = 2020;
const YEAR_END = 2035;
const YEARS = Array.from({ length: YEAR_END - YEAR_START + 1 }, (_, i) =>
  String(YEAR_START + i)
);

// ─── Drum ─────────────────────────────────────────────────────────────────────

interface DrumProps {
  items: string[];
  index: number;
  active: boolean;
  onSelect: (i: number) => void;
  onActivate: () => void;
  width?: number;
}

function Drum({ items, index, active, onSelect, onActivate, width = 72 }: DrumProps) {
  const clamp = (i: number) => Math.max(0, Math.min(items.length - 1, i));

  const dragRef = useRef<{ startY: number; startIndex: number } | null>(null);

  const startDrag = (y: number) => {
    dragRef.current = { startY: y, startIndex: index };
  };
  const moveDrag = (y: number) => {
    if (!dragRef.current) return;
    const delta = Math.round((dragRef.current.startY - y) / (ITEM_H * 0.6));
    onSelect(clamp(dragRef.current.startIndex + delta));
  };
  const endDrag = () => { dragRef.current = null; };

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
      style={{ width, height: ITEM_H * VISIBLE }}
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
      {/* Highlight band */}
      <div
        className={`pointer-events-none absolute inset-x-0 border-t-2 border-b-2 transition-colors ${
          active ? "bg-blue-100 border-blue-400" : "bg-slate-100 border-slate-300"
        }`}
        style={{ top: ITEM_H * 2, height: ITEM_H }}
      />

      {slotOffsets.map((offset, slot) => {
        const itemIdx = index + offset;
        const inRange = itemIdx >= 0 && itemIdx < items.length;
        const isCenter = offset === 0;
        const dist = Math.abs(offset);
        return (
          <div
            key={slot}
            className="absolute inset-x-0 flex items-center justify-center font-mono font-bold pointer-events-none"
            style={{
              top: ITEM_H * slot,
              height: ITEM_H,
              fontSize: isCenter ? 22 : dist === 1 ? 15 : 11,
              opacity: inRange ? (isCenter ? 1 : dist === 1 ? 0.45 : 0.2) : 0,
              color: isCenter ? (active ? "#1d4ed8" : "#0f172a") : "#64748b",
            }}
          >
            {inRange ? items[itemIdx] : ""}
          </div>
        );
      })}

      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
    </div>
  );
}

// ─── DatePicker ───────────────────────────────────────────────────────────────

interface DatePickerProps {
  /** ISO date string "YYYY-MM-DD" or "" */
  value: string;
  onChange: (value: string) => void;
}

type Field = "day" | "month" | "year";

export function DatePicker({ value, onChange }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [dayIdx, setDayIdx] = useState(0);
  const [monthIdx, setMonthIdx] = useState(0);
  const [yearIdx, setYearIdx] = useState(0);
  const [activeField, setActiveField] = useState<Field>("day");
  const [buffer, setBuffer] = useState("");

  const currentMonth = monthIdx + 1; // 1-based
  const currentYear = YEAR_START + yearIdx;
  const days = buildDays(currentMonth, currentYear);
  // Clamp day if month/year change reduces the number of days
  const safeDayIdx = Math.min(dayIdx, days.length - 1);

  const openPicker = () => {
    const valid = /^\d{4}-\d{2}-\d{2}$/.test(value);
    if (valid) {
      const y = parseInt(value.slice(0, 4), 10);
      const m = parseInt(value.slice(5, 7), 10) - 1; // 0-based
      const d = parseInt(value.slice(8, 10), 10) - 1; // 0-based
      setYearIdx(Math.max(0, Math.min(YEARS.length - 1, y - YEAR_START)));
      setMonthIdx(Math.max(0, Math.min(11, m)));
      setDayIdx(Math.max(0, d));
    } else {
      const now = new Date();
      setYearIdx(Math.max(0, Math.min(YEARS.length - 1, now.getFullYear() - YEAR_START)));
      setMonthIdx(now.getMonth());
      setDayIdx(now.getDate() - 1);
    }
    setActiveField("day");
    setBuffer("");
    setOpen(true);
  };

  const handleOK = () => {
    const d = String(safeDayIdx + 1).padStart(2, "0");
    const m = String(monthIdx + 1).padStart(2, "0");
    const y = String(currentYear);
    onChange(`${y}-${m}-${d}`);
    setOpen(false);
  };

  const handleToday = () => {
    const now = new Date();
    setYearIdx(Math.max(0, Math.min(YEARS.length - 1, now.getFullYear() - YEAR_START)));
    setMonthIdx(now.getMonth());
    setDayIdx(now.getDate() - 1);
    setBuffer("");
    setActiveField("day");
  };

  const clampDay = (i: number) => Math.max(0, Math.min(days.length - 1, i));

  // ── keypad logic ─────────────────────────────────────────────────────────────
  const handleDigit = (digit: string) => {
    const nb = buffer + digit;
    const d = parseInt(digit, 10);

    if (activeField === "day") {
      if (nb.length === 1) {
        // digit 4-9 as first digit can only be single-digit days 04-09 (≤31)
        if (d >= 4) {
          setDayIdx(clampDay(d - 1));
          setBuffer("");
          setActiveField("month");
        } else {
          setDayIdx(clampDay(d === 0 ? 0 : d - 1));
          setBuffer(nb);
        }
      } else {
        const val = parseInt(nb, 10);
        const clamped = Math.max(1, Math.min(days.length, val));
        setDayIdx(clamped - 1);
        setBuffer("");
        setActiveField("month");
      }
    } else if (activeField === "month") {
      if (nb.length === 1) {
        if (d >= 2) {
          setMonthIdx(Math.max(0, Math.min(11, d - 1)));
          setBuffer("");
          setActiveField("year");
        } else {
          setMonthIdx(d === 0 ? 0 : d - 1);
          setBuffer(nb);
        }
      } else {
        const val = parseInt(nb, 10);
        const clamped = Math.max(1, Math.min(12, val));
        setMonthIdx(clamped - 1);
        setBuffer("");
        setActiveField("year");
      }
    } else {
      // year — collect 4 digits
      const nb4 = buffer + digit;
      setBuffer(nb4);
      if (nb4.length === 4) {
        const y = parseInt(nb4, 10);
        const yi = Math.max(0, Math.min(YEARS.length - 1, y - YEAR_START));
        setYearIdx(yi);
        setBuffer("");
      }
    }
  };

  const handleBackspace = () => {
    if (buffer.length > 0) {
      setBuffer(buffer.slice(0, -1));
    } else {
      if (activeField === "year") setActiveField("month");
      else if (activeField === "month") setActiveField("day");
    }
  };

  // ── display ───────────────────────────────────────────────────────────────────
  const display = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(value + "T00:00:00").toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
      })
    : "Tap to select date";

  const fieldLabel = (f: Field) => {
    if (f === "day") return `Day${activeField === "day" && buffer ? ` [${buffer}_]` : ""}`;
    if (f === "month") return `Month${activeField === "month" && buffer ? ` [${buffer}_]` : ""}`;
    return `Year${activeField === "year" && buffer ? ` [${buffer}_]` : ""}`;
  };

  return (
    <>
      <button
        type="button"
        onClick={openPicker}
        className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-left text-sm font-semibold text-slate-800 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {display}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 sm:items-center"
          onClick={handleOK}
        >
          <div
            className="w-full max-w-sm rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-2xl flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-center text-base font-semibold text-slate-700">Set Date</p>

            {/* Drums */}
            <div className="flex items-center justify-center gap-2">
              {/* Day */}
              <div className="flex flex-col items-center gap-1">
                <button type="button" className="p-1 text-slate-400 hover:text-slate-700" onClick={() => { setDayIdx(clampDay(safeDayIdx - 1)); setBuffer(""); }}>▲</button>
                <Drum items={days} index={safeDayIdx} active={activeField === "day"} onSelect={(i) => { setDayIdx(i); setBuffer(""); }} onActivate={() => { setActiveField("day"); setBuffer(""); }} width={68} />
                <button type="button" className="p-1 text-slate-400 hover:text-slate-700" onClick={() => { setDayIdx(clampDay(safeDayIdx + 1)); setBuffer(""); }}>▼</button>
                <span className="text-xs text-slate-400">DD</span>
              </div>

              <span className="text-2xl font-black text-slate-400 pb-6">/</span>

              {/* Month */}
              <div className="flex flex-col items-center gap-1">
                <button type="button" className="p-1 text-slate-400 hover:text-slate-700" onClick={() => { setMonthIdx(Math.max(0, monthIdx - 1)); setBuffer(""); }}>▲</button>
                <Drum items={MONTHS} index={monthIdx} active={activeField === "month"} onSelect={(i) => { setMonthIdx(i); setBuffer(""); }} onActivate={() => { setActiveField("month"); setBuffer(""); }} width={72} />
                <button type="button" className="p-1 text-slate-400 hover:text-slate-700" onClick={() => { setMonthIdx(Math.min(11, monthIdx + 1)); setBuffer(""); }}>▼</button>
                <span className="text-xs text-slate-400">MM</span>
              </div>

              <span className="text-2xl font-black text-slate-400 pb-6">/</span>

              {/* Year */}
              <div className="flex flex-col items-center gap-1">
                <button type="button" className="p-1 text-slate-400 hover:text-slate-700" onClick={() => { setYearIdx(Math.max(0, yearIdx - 1)); setBuffer(""); }}>▲</button>
                <Drum items={YEARS} index={yearIdx} active={activeField === "year"} onSelect={(i) => { setYearIdx(i); setBuffer(""); }} onActivate={() => { setActiveField("year"); setBuffer(""); }} width={80} />
                <button type="button" className="p-1 text-slate-400 hover:text-slate-700" onClick={() => { setYearIdx(Math.min(YEARS.length - 1, yearIdx + 1)); setBuffer(""); }}>▼</button>
                <span className="text-xs text-slate-400">YYYY</span>
              </div>
            </div>

            {/* Field indicator */}
            <div className="flex justify-center gap-3 text-xs font-semibold">
              {(["day", "month", "year"] as Field[]).map((f) => (
                <span
                  key={f}
                  className={`px-3 py-1 rounded-full cursor-pointer transition-colors ${
                    activeField === f
                      ? "bg-blue-100 text-blue-700"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                  onClick={() => { setActiveField(f); setBuffer(""); }}
                >
                  {fieldLabel(f)}
                </span>
              ))}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2">
              {["1","2","3","4","5","6","7","8","9"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDigit(d)}
                  className="h-14 rounded-2xl bg-slate-100 text-2xl font-bold text-slate-800 hover:bg-slate-200 active:scale-95 transition-all"
                >
                  {d}
                </button>
              ))}
              {/* Today */}
              <button
                type="button"
                onClick={handleToday}
                className="h-14 rounded-2xl bg-blue-50 text-sm font-bold text-blue-700 hover:bg-blue-100 active:scale-95 transition-all flex flex-col items-center justify-center leading-tight"
              >
                <span className="text-base">📅</span>
                <span className="text-xs">Today</span>
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
