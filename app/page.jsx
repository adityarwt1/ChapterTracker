'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Trash2, AlertTriangle, Check } from 'lucide-react';

/**
 * ChapterProgressTracker
 * A Notion-style study tracker for the JEE Mains + Advanced syllabus.
 * Single self-contained client component — drop it into a Next.js app
 * (app/ or pages/ router) and render <ChapterProgressTracker />.
 *
 * Props:
 *  - initialChapters?: Chapter[]  overrides the seeded schedule below
 *  - onOpenChapter?: (chapter) => void  fired when "Open" is clicked,
 *      e.g. to route into that chapter's content editor
 */

const SUBJECTS = ['Physics', 'Chemistry', 'Maths'];

const SUBJECT_STYLES = {
  Physics: { dot: 'bg-sky-400' },
  Chemistry: { dot: 'bg-fuchsia-400' },
  Maths: { dot: 'bg-amber-400' },
};

const STATUS_META = {
  'not-started': { label: 'Not started', className: 'bg-zinc-800 text-zinc-400 border-zinc-700' },
  'in-progress': { label: 'In progress', className: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  done: { label: 'Done', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
};

const STATUS_ORDER = ['not-started', 'in-progress', 'done'];
const STORAGE_KEY = 'chapter-progress-tracker-v1';

let uid = 0;
function nextId() {
  uid += 1;
  return `ch-${uid}`;
}

function syncNextId(chapters) {
  const ids = chapters
    .map((chapter) => chapter?.id)
    .filter((id) => typeof id === 'string')
    .map((id) => {
      const match = id.match(/^ch-(\d+)$/);
      return match ? Number(match[1]) : null;
    })
    .filter((value) => Number.isFinite(value));

  if (ids.length) {
    uid = Math.max(...ids);
  }
}

function loadStoredChapters(initialChapters) {
  if (typeof window === 'undefined') {
    return initialChapters || SEED_CHAPTERS;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return initialChapters || SEED_CHAPTERS;
    }

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return initialChapters || SEED_CHAPTERS;
    }

    syncNextId(parsed);
    return parsed;
  } catch (error) {
    console.error('Unable to load chapters from localStorage:', error);
    return initialChapters || SEED_CHAPTERS;
  }
}

function makeChapter(date, subject, name, needsReview) {
  return {
    id: nextId(),
    name,
    date,
    subject,
    progress: 'not-started',
    shortnotes: false,
    pyq: false,
    test: false,
    needsReview: Boolean(needsReview),
  };
}

// Seeded from the handwritten study plan (29 Jul – 9 Nov 2026). A handful of
// entries were genuinely hard to make out from the handwriting, especially
// further down the page — those are flagged with needsReview (small amber
// warning icon in the table) so they're easy to spot and fix inline.
const SEED_CHAPTERS = [
  makeChapter('2026-07-29', 'Maths', 'Inverse Trigonometric Functions'),
  makeChapter('2026-07-30', 'Maths', 'Limits and Continuity'),
  makeChapter('2026-07-31', 'Physics', 'Moving Charges and Magnetism'),
  makeChapter('2026-08-01', 'Physics', 'Magnetism and Matter'),
  makeChapter('2026-08-02', 'Chemistry', 'Hydrocarbons'),
  makeChapter('2026-08-03', 'Chemistry', 'Haloalkanes and Haloarenes'),
  makeChapter('2026-08-04', 'Maths', 'Differentiability', true),
  makeChapter('2026-08-05', 'Maths', 'Application of Derivatives'),
  makeChapter('2026-08-06', 'Maths', 'Indefinite Integration'),
  makeChapter('2026-08-07', 'Physics', 'Electromagnetic Induction'),
  makeChapter('2026-08-08', 'Physics', 'Alternating Current'),
  makeChapter('2026-08-09', 'Chemistry', 'Alcohols, Phenols and Ethers'),
  makeChapter('2026-08-10', 'Chemistry', 'Aldehydes, Ketones and Carboxylic Acids'),
  makeChapter('2026-08-11', 'Chemistry', 'Nitrogen-containing Compounds', true),
  makeChapter('2026-08-12', 'Maths', 'Application of Integrals'),
  makeChapter('2026-08-13', 'Physics', 'Electromagnetic Waves'),
  makeChapter('2026-08-14', 'Physics', 'Ray Optics'),
  makeChapter('2026-08-15', 'Chemistry', 'Amines'),
  makeChapter('2026-08-16', 'Chemistry', 'Biomolecules'),
  makeChapter('2026-08-17', 'Maths', 'Differential Equations'),
  makeChapter('2026-08-18', 'Maths', 'Vectors'),
  makeChapter('2026-08-19', 'Physics', 'Wave Optics'),
  makeChapter('2026-08-20', 'Physics', 'Nuclear Physics'),
  makeChapter('2026-08-21', 'Chemistry', 'Polymers'),
  makeChapter('2026-08-22', 'Chemistry', 'Chemistry in Everyday Life'),
  makeChapter('2026-08-23', 'Maths', 'Probability'),
  makeChapter('2026-08-24', 'Maths', 'Linear Programming'),
  makeChapter('2026-08-25', 'Physics', 'Semiconductor Electronics'),
  makeChapter('2026-08-26', 'Physics', 'Vectors (Physics)', true),
  makeChapter('2026-08-27', 'Chemistry', 'Environmental Chemistry'),
  makeChapter('2026-08-28', 'Chemistry', 'Coordination Compounds'),
  makeChapter('2026-08-29', 'Maths', '3D Geometry'),
  makeChapter('2026-08-30', 'Maths', 'Basic Maths'),
  makeChapter('2026-08-31', 'Physics', 'Kinematics (1D)'),
  makeChapter('2026-09-01', 'Physics', 'Units and Measurement', true),
  makeChapter('2026-09-02', 'Chemistry', 'The p-Block Elements'),
  makeChapter('2026-09-03', 'Chemistry', 'The f-Block Elements', true),
  makeChapter('2026-09-04', 'Maths', 'Sets'),
  makeChapter('2026-09-05', 'Maths', 'Trigonometric Identities'),
  makeChapter('2026-09-06', 'Physics', 'Motion in a Plane (2D)'),
  makeChapter('2026-09-07', 'Physics', 'Laws of Motion'),
  makeChapter('2026-09-08', 'Chemistry', 'Salt Analysis'),
  makeChapter('2026-09-09', 'Chemistry', 'General Principles of Isolation of Elements'),
  makeChapter('2026-09-10', 'Maths', 'Trigonometric Equations'),
  makeChapter('2026-09-11', 'Maths', 'Quadratic Equations'),
  makeChapter('2026-09-12', 'Physics', 'Circular Motion'),
  makeChapter('2026-09-13', 'Physics', 'Work, Power and Energy'),
  makeChapter('2026-09-14', 'Chemistry', 'Mole Concept'),
  makeChapter('2026-09-15', 'Chemistry', 'Structure of Atom'),
  makeChapter('2026-09-16', 'Maths', 'Complex Numbers'),
  makeChapter('2026-09-17', 'Maths', 'Sequences and Series'),
  makeChapter('2026-09-18', 'Physics', 'Center of Mass'),
  makeChapter('2026-09-19', 'Physics', 'Thermal Expansion of Matter', true),
  makeChapter('2026-09-20', 'Chemistry', 'States of Matter'),
  makeChapter('2026-09-21', 'Chemistry', 'Thermodynamics'),
  makeChapter('2026-09-22', 'Maths', 'Permutations and Combinations'),
  makeChapter('2026-09-23', 'Chemistry', 'Biomolecules (recap)', true),
  makeChapter('2026-09-24', 'Physics', 'Mechanical Properties of Solids'),
  makeChapter('2026-09-25', 'Physics', 'Rotational Motion'),
  makeChapter('2026-09-26', 'Chemistry', 'Redox Reactions'),
  makeChapter('2026-09-27', 'Chemistry', 'Chemical Equilibrium'),
  makeChapter('2026-09-28', 'Maths', 'Straight Lines'),
  makeChapter('2026-09-29', 'Maths', 'Circles'),
  makeChapter('2026-09-30', 'Physics', 'Kinetic Theory of Gases'),
  makeChapter('2026-10-01', 'Physics', 'Oscillations'),
  makeChapter('2026-10-02', 'Chemistry', 'Ionic Equilibrium'),
  makeChapter('2026-10-03', 'Chemistry', 'Periodic Table'),
  makeChapter('2026-10-04', 'Maths', 'Parabola'),
  makeChapter('2026-10-05', 'Maths', 'Ellipse'),
  makeChapter('2026-10-06', 'Physics', 'Waves'),
  makeChapter('2026-10-07', 'Physics', 'Mechanical Properties of Fluids'),
  makeChapter('2026-10-08', 'Chemistry', 'Chemical Bonding'),
  makeChapter('2026-10-09', 'Chemistry', 'p-Block Elements (recap)', true),
  makeChapter('2026-10-10', 'Maths', 'Hyperbola'),
  makeChapter('2026-10-11', 'Maths', 'Statistics'),
  makeChapter('2026-10-12', 'Physics', 'Gravitation'),
  makeChapter('2026-10-13', 'Physics', 'Electrostatics'),
  makeChapter('2026-10-14', 'Chemistry', 's-Block Elements'),
  makeChapter('2026-10-15', 'Chemistry', 'Hydrocarbons (recap)', true),
  makeChapter('2026-10-16', 'Maths', 'Probability (recap)', true),
  makeChapter('2026-10-17', 'Maths', 'Linear Inequalities'),
  makeChapter('2026-10-18', 'Chemistry', 'Electrochemical Cells and Potential'),
  makeChapter('2026-10-19', 'Physics', 'Conductors and Dielectrics', true),
  makeChapter('2026-10-20', 'Chemistry', 'IUPAC Nomenclature of Organic Compounds'),
  makeChapter('2026-10-21', 'Chemistry', 'Isomerism'),
  makeChapter('2026-10-22', 'Maths', 'Solution of Triangles'),
  makeChapter('2026-10-23', 'Maths', 'Introduction to 3D Geometry'),
  makeChapter('2026-10-24', 'Physics', 'Current Electricity'),
  makeChapter('2026-10-25', 'Physics', 'Capacitors'),
  makeChapter('2026-10-26', 'Chemistry', 'General Organic Chemistry (GOC)'),
  makeChapter('2026-10-27', 'Chemistry', 'Hydrocarbons (recap)', true),
  makeChapter('2026-10-28', 'Maths', 'Determinants'),
  makeChapter('2026-10-29', 'Maths', 'Matrices'),
  makeChapter('2026-10-30', 'Chemistry', 'Qualitative & Quantitative Analysis'),
  makeChapter('2026-10-31', 'Chemistry', 'Environmental Chemistry (recap)', true),
  makeChapter('2026-11-01', 'Maths', 'Relations and Functions'),
  makeChapter('2026-11-02', 'Maths', 'Inverse Trigonometric Functions (recap)', true),
  makeChapter('2026-11-03', 'Chemistry', 'Solutions'),
  makeChapter('2026-11-04', 'Chemistry', 'Chemical Kinetics'),
  makeChapter('2026-11-05', 'Physics', 'Optical Instruments', true),
  makeChapter('2026-11-06', 'Chemistry', 'Hydrocarbons (recap)', true),
  makeChapter('2026-11-07', 'Chemistry', 'Electrochemistry (recap)', true),
  makeChapter('2026-11-08', 'Chemistry', 'Solid State'),
  makeChapter('2026-11-09', 'Chemistry', 'Surface Chemistry'),
];

function formatDate(iso) {
  const dt = new Date(`${iso}T00:00:00`);
  return dt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function EditableText({ value, onCommit, className }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          setEditing(false);
          const trimmed = draft.trim();
          if (trimmed && trimmed !== value) onCommit(trimmed);
          else setDraft(value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
          if (e.key === 'Escape') {
            setDraft(value);
            setEditing(false);
          }
        }}
        className="w-full bg-zinc-800 text-zinc-100 rounded px-2 py-1 text-sm outline-none ring-1 ring-zinc-600 focus:ring-sky-500"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={`text-left w-full rounded px-2 py-1 hover:bg-zinc-800/60 transition-colors ${className || ''}`}
      title="Click to edit"
    >
      {value}
    </button>
  );
}

function EditableDate({ value, onCommit }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <input
        type="date"
        autoFocus
        defaultValue={value}
        onBlur={(e) => {
          setEditing(false);
          if (e.target.value && e.target.value !== value) onCommit(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
        }}
        className="bg-zinc-800 text-zinc-100 rounded px-2 py-1 text-sm outline-none ring-1 ring-zinc-600 focus:ring-sky-500"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="text-left w-full rounded px-2 py-1 hover:bg-zinc-800/60 transition-colors text-zinc-300 tabular-nums"
      title="Click to edit"
    >
      {formatDate(value)}
    </button>
  );
}

function CheckboxCell({ checked, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      className={`h-5 w-5 rounded flex items-center justify-center border transition-colors ${
        checked ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600 hover:border-zinc-400'
      }`}
    >
      {checked && <Check size={13} className="text-zinc-950" strokeWidth={3} />}
    </button>
  );
}

export default function ChapterProgressTracker({ initialChapters, onOpenChapter }) {
  const [chapters, setChapters] = useState(() => loadStoredChapters(initialChapters));
  const [query, setQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(chapters));
    } catch (error) {
      console.error('Unable to save chapters to localStorage:', error);
    }
  }, [chapters]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return chapters.filter((c) => {
      const matchesQuery = !q || c.name.toLowerCase().includes(q);
      const matchesSubject = subjectFilter === 'All' || c.subject === subjectFilter;
      return matchesQuery && matchesSubject;
    });
  }, [chapters, query, subjectFilter]);

  const stats = useMemo(() => {
    const total = chapters.length;
    const done = chapters.filter((c) => c.progress === 'done').length;
    const inProgress = chapters.filter((c) => c.progress === 'in-progress').length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    return { total, done, inProgress, pct };
  }, [chapters]);

  function patch(id, changes) {
    setChapters((prev) => prev.map((c) => (c.id === id ? { ...c, ...changes } : c)));
  }

  function toggle(id, field) {
    setChapters((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: !c[field] } : c)));
  }

  function removeChapter(id) {
    setChapters((prev) => prev.filter((c) => c.id !== id));
  }

  function addChapter() {
    const created = makeChapter(new Date().toISOString().slice(0, 10), 'Physics', 'New chapter');
    setChapters((prev) => [...prev, created]);
  }

  return (
    <div className="w-full rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-zinc-800">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">JEE Mains + Advanced</h2>
            <p className="text-sm text-zinc-500 mt-1">
              {stats.done} of {stats.total} chapters done · {stats.inProgress} in progress
            </p>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chapters"
              className="bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-zinc-600 w-48"
            />
          </div>
        </div>

        {/* overall progress bar */}
        <div className="mt-4 h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${stats.pct}%` }}
          />
        </div>

        {/* subject filter pills */}
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          {['All', ...SUBJECTS].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSubjectFilter(s)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                subjectFilter === s
                  ? 'bg-zinc-100 text-zinc-900 border-zinc-100'
                  : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="max-h-140 overflow-y-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 bg-zinc-950 z-10">
            <tr className="text-left text-zinc-500 border-b border-zinc-800">
              <th className="font-medium px-4 py-2 w-[34%]">Chapter</th>
              <th className="font-medium px-4 py-2 w-[16%]">Date</th>
              <th className="font-medium px-4 py-2 w-[14%]">Progress</th>
              <th className="font-medium px-2 py-2 text-center w-[10%]">Shortnotes</th>
              <th className="font-medium px-2 py-2 text-center w-[8%]">PYQ</th>
              <th className="font-medium px-2 py-2 text-center w-[8%]">Test</th>
              <th className="w-[4%]" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const subjectStyle = SUBJECT_STYLES[c.subject];
              return (
                <tr key={c.id} className="group border-b border-zinc-900 hover:bg-zinc-900/40">
                  <td className="px-4 py-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${subjectStyle.dot}`} title={c.subject} />
                      <EditableText
                        value={c.name}
                        onCommit={(v) => patch(c.id, { name: v })}
                        className="text-zinc-100 truncate"
                      />
                      {c.needsReview && (
                        <span title="Transcribed from handwritten notes — please double check" className="shrink-0">
                          <AlertTriangle size={13} className="text-amber-400" />
                        </span>
                      )}
                      {onOpenChapter && (
                        <button
                          type="button"
                          onClick={() => onOpenChapter(c)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] px-2 py-0.5 rounded border border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:border-zinc-500 shrink-0"
                        >
                          Open
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-1.5">
                    <EditableDate value={c.date} onCommit={(v) => patch(c.id, { date: v })} />
                  </td>
                  <td className="px-4 py-1.5">
                    <select
                      value={c.progress}
                      onChange={(e) => patch(c.id, { progress: e.target.value })}
                      className={`text-xs rounded-full px-2.5 py-1 border outline-none cursor-pointer ${STATUS_META[c.progress].className}`}
                    >
                      {STATUS_ORDER.map((s) => (
                        <option key={s} value={s} className="bg-zinc-900 text-zinc-100">
                          {STATUS_META[s].label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <div className="flex justify-center">
                      <CheckboxCell checked={c.shortnotes} onToggle={() => toggle(c.id, 'shortnotes')} />
                    </div>
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <div className="flex justify-center">
                      <CheckboxCell checked={c.pyq} onToggle={() => toggle(c.id, 'pyq')} />
                    </div>
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <div className="flex justify-center">
                      <CheckboxCell checked={c.test} onToggle={() => toggle(c.id, 'test')} />
                    </div>
                  </td>
                  <td className="px-2 py-1.5">
                    <button
                      type="button"
                      onClick={() => removeChapter(c.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-red-400"
                      title="Delete chapter"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-600 text-sm">
                  No chapters match this search.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <button
          type="button"
          onClick={addChapter}
          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/60 transition-colors"
        >
          <Plus size={14} />
          New chapter
        </button>
      </div>
    </div>
  );
}