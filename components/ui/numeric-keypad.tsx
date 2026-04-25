"use client";

import React, { useState } from "react";

// ─── NumericKeypad ─────────────────────────────────────────────────────────────
//
// A modal keypad that lets the user enter a numeric value (or any sequence of
// digits / dots) by tapping big buttons.
//
// Props:
//   value        – current controlled value (string)
//   onChange     – called with the new value string
//   label        – title shown at the top of the modal
//   allowDecimal – show a "." key (default false)
//   placeholder  – greyed text shown when value is empty
// ─────────────────────────────────────────────────────────────────────────────

interface NumericKeypadProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  allowDecimal?: boolean;
  placeholder?: string;
  /** Extra action button rendered alongside OK (e.g. "Same WJR") */
  extraAction?: { label: string; onClick: () => void };
}

export function NumericKeypad({
  value,
  onChange,
  label,
  allowDecimal = false,
  placeholder = "Tap to enter",
  extraAction,
}: NumericKeypadProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const openPad = () => {
    setDraft(value);
    setOpen(true);
  };

  const handleDigit = (d: string) => {
    // Prevent multiple decimal points
    if (d === "." && draft.includes(".")) return;
    setDraft((prev) => prev + d);
  };

  const handleBackspace = () => setDraft((prev) => prev.slice(0, -1));

  const handleClear = () => setDraft("");

  const handleOK = () => {
    onChange(draft);
    setOpen(false);
  };

  const handleCancel = () => setOpen(false);

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={openPad}
        className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-left text-sm font-mono font-semibold tracking-wide text-slate-800 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {value || <span className="font-normal text-slate-400">{placeholder}</span>}
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 sm:items-center"
          onClick={handleOK}
        >
          <div
            className="w-full max-w-xs rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-2xl flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Label */}
            {label && (
              <p className="text-center text-base font-semibold text-slate-700">{label}</p>
            )}

            {/* Display */}
            <div className="min-h-[48px] rounded-xl border-2 border-slate-200 bg-slate-50 px-4 flex items-center">
              <span className="flex-1 text-2xl font-mono font-bold text-slate-900 tracking-widest break-all">
                {draft || <span className="text-slate-300 text-lg font-normal">{placeholder}</span>}
              </span>
              {draft && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="ml-2 text-xs text-rose-400 hover:text-rose-600 font-semibold"
                >
                  CLR
                </button>
              )}
            </div>

            {/* Keypad grid */}
            <div className="grid grid-cols-3 gap-2">
              {digits.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDigit(d)}
                  className="h-14 rounded-2xl bg-slate-100 text-2xl font-bold text-slate-800 hover:bg-slate-200 active:scale-95 transition-all"
                >
                  {d}
                </button>
              ))}

              {/* Bottom row: decimal / blank, 0, backspace */}
              {allowDecimal ? (
                <button
                  type="button"
                  onClick={() => handleDigit(".")}
                  className="h-14 rounded-2xl bg-slate-100 text-2xl font-bold text-slate-500 hover:bg-slate-200 active:scale-95 transition-all"
                >
                  .
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={() => handleDigit("0")}
                className="h-14 rounded-2xl bg-slate-100 text-2xl font-bold text-slate-800 hover:bg-slate-200 active:scale-95 transition-all"
              >
                0
              </button>

              <button
                type="button"
                onClick={handleBackspace}
                className="h-14 rounded-2xl bg-rose-50 text-xl font-bold text-rose-500 hover:bg-rose-100 active:scale-95 transition-all"
              >
                ⌫
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 h-12 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              {extraAction && (
                <button
                  type="button"
                  onClick={() => {
                    extraAction.onClick();
                    setOpen(false);
                  }}
                  className="flex-1 h-12 rounded-xl border border-slate-300 bg-slate-50 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  {extraAction.label}
                </button>
              )}
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
