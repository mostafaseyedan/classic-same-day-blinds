import { defineRouteConfig } from "@medusajs/admin-sdk";
import { useEffect, useRef, useState } from "react";
import { Button, Container, Heading, StatusBadge, Text } from "@medusajs/ui";

const OPS_API = "http://localhost:4000";

const OUR_PRODUCTS = [
  { handle: "faux-wood-blinds-2-inch", label: '2" Faux Wood Blinds' },
  { handle: "vertical-blinds-made-to-fit", label: "Vertical Blinds" },
  { handle: "aluminum-business-class-blinds-1-inch", label: '1" Aluminum Blinds' },
];

interface ScraperUrl {
  id: string;
  sourceId: string;
  url: string;
  productHandle: string | null;
  label: string | null;
  enabled: boolean;
}

interface ScraperJob {
  id: string;
  type: "scrape" | "import" | "pipeline" | "upload-images" | "clear";
  status: "running" | "completed" | "failed";
  startedAt: string;
  completedAt: string | null;
  rowsScraped: number | null;
  error: string | null;
  log: string | null;
}

interface ScraperSource {
  id: string;
  name: string;
  slug: string;
  enabled: boolean;
  urls: ScraperUrl[];
  lastJob: ScraperJob | null;
}

const RECOMMENDED_SOURCES = [
  {
    name: "Lowe's",
    slug: "lowes",
    urls: [
      {
        url: "https://www.lowes.com/pd/allen-roth-Trim-at-Home-2-in-Cordless-White-Faux-Wood-Room-Darkening-Plantation-Blinds-Common-35-in-Actual-34-5-in-x-64-in/1001428530",
        productHandle: "faux-wood-blinds-2-inch",
        label: `allen + roth 35" x 64" Faux Wood Blind`,
      },
    ],
  },
  {
    name: "HD Supply",
    slug: "hd-supply",
    urls: [
      {
        url: "https://hdsupplysolutions.com/c/window-coverings-00-10/blinds-accessories-00-10-5/blinds-00-10-5-10/horizontal-blinds-00-10-5-10-5/faux-wood-blinds-00-10-5-10-5-10",
        productHandle: "faux-wood-blinds-2-inch",
        label: "Faux Wood Blinds — category page",
      },
    ],
  },
];

function jobLabel(type: ScraperJob["type"]) {
  return { scrape: "Scrape", import: "Import", pipeline: "Full Pipeline", "upload-images": "Upload Images", clear: "Clear" }[type] ?? type;
}

function durationLabel(job: ScraperJob) {
  if (!job.completedAt) return null;
  const ms = new Date(job.completedAt).getTime() - new Date(job.startedAt).getTime();
  const s = Math.round(ms / 1000);
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
}

function timeSince(iso: string) {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function fullJobLog(job: ScraperJob) {
  return `${job.log || "(no output yet)"}${job.error ? `\n\nERROR: ${job.error}` : ""}`;
}

// ── URL row editor ────────────────────────────────────────────────────────────

function UrlRow({ u, onSave, onDelete, onRun, onUploadImages, running }: {
  u: ScraperUrl;
  onSave: (patch: Partial<ScraperUrl>) => void;
  onDelete: () => void;
  onRun: () => void;
  onUploadImages: () => void;
  running: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [url, setUrl] = useState(u.url);
  const [handle, setHandle] = useState(u.productHandle ?? "");
  const [label, setLabel] = useState(u.label ?? "");

  function save() {
    onSave({ url, productHandle: handle || null, label: label || null });
    setEditing(false);
  }

  if (!editing) {
    return (
      <div className={`flex items-center gap-3 py-2 px-3 rounded-md ${u.enabled ? "" : "opacity-50"}`}>
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: u.enabled ? "#10b981" : "#6b7280" }} />
        <div className="flex-1 min-w-0">
          <a href={u.url} target="_blank" rel="noreferrer" className="text-xs font-mono text-ui-fg-interactive hover:underline block truncate">{u.url}</a>
          <div className="flex items-center gap-2 mt-0.5">
            {u.label && <span className="text-xs text-ui-fg-muted">{u.label}</span>}
            {u.productHandle && (
              <span className="text-xs bg-ui-bg-subtle text-ui-fg-subtle px-1.5 py-0.5 rounded">
                → {OUR_PRODUCTS.find(p => p.handle === u.productHandle)?.label ?? u.productHandle}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onRun}
            disabled={running}
            className="text-xs text-ui-fg-interactive hover:text-ui-fg-base px-2 py-1 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Scrape + import + upload images"
          >
            ▶
          </button>
          <button
            onClick={onUploadImages}
            disabled={running}
            className="text-xs text-ui-fg-muted hover:text-ui-fg-base px-2 py-1 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Upload images only"
          >
            ↑ Img
          </button>
          <button onClick={() => onSave({ enabled: !u.enabled })} className="text-xs text-ui-fg-muted hover:text-ui-fg-base px-2 py-1">
            {u.enabled ? "Disable" : "Enable"}
          </button>
          <button onClick={() => setEditing(true)} className="text-xs text-ui-fg-muted hover:text-ui-fg-base px-2 py-1">Edit</button>
          <button onClick={onDelete} className="text-xs text-ui-tag-red-text hover:underline px-2 py-1">Delete</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 py-2 px-3 bg-ui-bg-subtle rounded-md">
      <input value={url} onChange={e => setUrl(e.target.value)} placeholder="URL" className="text-xs border border-ui-border-base rounded px-2 py-1.5 bg-ui-bg-base w-full font-mono" />
      <div className="flex gap-2">
        <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Label (optional)" className="text-xs border border-ui-border-base rounded px-2 py-1.5 bg-ui-bg-base flex-1" />
        <select value={handle} onChange={e => setHandle(e.target.value)} className="text-xs border border-ui-border-base rounded px-2 py-1.5 bg-ui-bg-base flex-1">
          <option value="">— No product mapping —</option>
          {OUR_PRODUCTS.map(p => <option key={p.handle} value={p.handle}>{p.label}</option>)}
        </select>
      </div>
      <div className="flex gap-2">
        <Button size="small" variant="primary" onClick={save}>Save</Button>
        <Button size="small" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
      </div>
    </div>
  );
}

// ── Add URL form ─────────────────────────────────────────────────────────────

function AddUrlForm({ onAdd }: { onAdd: (url: string, handle: string | null, label: string | null) => void }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [handle, setHandle] = useState("");
  const [label, setLabel] = useState("");

  function submit() {
    if (!url.trim()) return;
    onAdd(url.trim(), handle || null, label.trim() || null);
    setUrl(""); setHandle(""); setLabel("");
    setOpen(false);
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs text-ui-fg-interactive hover:underline mt-1">
        + Add URL
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 mt-2 p-3 bg-ui-bg-subtle rounded-md border border-ui-border-base">
      <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className="text-xs border border-ui-border-base rounded px-2 py-1.5 bg-ui-bg-base w-full font-mono" />
      <div className="flex gap-2">
        <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Label (optional)" className="text-xs border border-ui-border-base rounded px-2 py-1.5 bg-ui-bg-base flex-1" />
        <select value={handle} onChange={e => setHandle(e.target.value)} className="text-xs border border-ui-border-base rounded px-2 py-1.5 bg-ui-bg-base flex-1">
          <option value="">— No product mapping —</option>
          {OUR_PRODUCTS.map(p => <option key={p.handle} value={p.handle}>{p.label}</option>)}
        </select>
      </div>
      <div className="flex gap-2">
        <Button size="small" variant="primary" onClick={submit}>Add</Button>
        <Button size="small" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </div>
  );
}

// ── Job log panel ────────────────────────────────────────────────────────────

function JobLog({ job }: { job: ScraperJob }) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [job.log]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copyLogs() {
    try {
      await navigator.clipboard.writeText(fullJobLog(job));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-3 border border-ui-border-base rounded-md overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-ui-bg-subtle border-b border-ui-border-base">
        <span className="text-xs font-medium text-ui-fg-muted">
          {jobLabel(job.type)} log — {job.status === "running" ? "⏳ running..." : job.status === "failed" ? "✗ failed" : "✓ completed"}
          {job.completedAt && ` in ${durationLabel(job)}`}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={copyLogs}
            className="inline-flex h-7 w-7 items-center justify-center rounded text-ui-fg-muted hover:bg-ui-bg-base-hover hover:text-ui-fg-base"
            title={copied ? "Copied" : "Copy logs"}
            aria-label={copied ? "Logs copied" : "Copy logs"}
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="5" y="3" width="8" height="10" rx="1.5" />
              <path d="M3.5 10.5h-1A1.5 1.5 0 0 1 1 9V3.5A1.5 1.5 0 0 1 2.5 2H8a1.5 1.5 0 0 1 1.5 1v1" />
            </svg>
          </button>
        </div>
      </div>
      <pre
        ref={ref}
        className="text-xs font-mono p-3 bg-[#0d0d0d] text-[#d4d4d4] max-h-64 overflow-y-auto whitespace-pre-wrap leading-5"
      >
        {fullJobLog(job)}
      </pre>
    </div>
  );
}

// ── Source card ───────────────────────────────────────────────────────────────

function SourceCard({ source, onRefresh }: { source: ScraperSource; onRefresh: () => void }) {
  const [activeJob, setActiveJob] = useState<ScraperJob | null>(null);
  const [acting, setActing] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isRunning = activeJob?.status === "running" || source.lastJob?.status === "running";
  const displayJob = activeJob ?? source.lastJob;

  useEffect(() => {
    if (activeJob?.status === "running") {
      pollRef.current = setInterval(async () => {
        const res = await fetch(`${OPS_API}/api/v1/scrapers/jobs/${activeJob.id}`);
        if (!res.ok) return;
        const { job } = await res.json() as { job: ScraperJob };
        setActiveJob(job);
        if (job.status !== "running") {
          clearInterval(pollRef.current!);
          onRefresh();
        }
      }, 2000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeJob?.id, activeJob?.status]);

  async function trigger(endpoint: string) {
    setActing(true);
    try {
      const res = await fetch(`${OPS_API}/api/v1/scrapers/${source.id}/${endpoint}`, { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      const { jobId } = await res.json() as { jobId: string };
      const jobRes = await fetch(`${OPS_API}/api/v1/scrapers/jobs/${jobId}`);
      const { job } = await jobRes.json() as { job: ScraperJob };
      setActiveJob(job);
    } catch (err) {
      alert(`Failed: ${err}`);
    } finally {
      setActing(false);
    }
  }

  async function cancelJob() {
    if (!activeJob) return;
    try {
      await fetch(`${OPS_API}/api/v1/scrapers/jobs/${activeJob.id}/cancel`, { method: "POST" });
      onRefresh();
    } catch (err) {
      alert(`Failed to cancel: ${err}`);
    }
  }

  async function toggleEnabled() {
    await fetch(`${OPS_API}/api/v1/scrapers/${source.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ enabled: !source.enabled }),
    });
    onRefresh();
  }

  async function saveUrl(urlId: string, patch: Partial<ScraperUrl>) {
    await fetch(`${OPS_API}/api/v1/scrapers/${source.id}/urls/${urlId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
    onRefresh();
  }

  async function removeUrl(urlId: string) {
    if (!confirm("Delete this URL?")) return;
    await fetch(`${OPS_API}/api/v1/scrapers/${source.id}/urls/${urlId}`, { method: "DELETE" });
    onRefresh();
  }

  async function addUrl(url: string, handle: string | null, label: string | null) {
    await fetch(`${OPS_API}/api/v1/scrapers/${source.id}/urls`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url, productHandle: handle, label }),
    });
    onRefresh();
  }

  return (
    <Container className="flex flex-col gap-4 p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${source.enabled ? "bg-green-500" : "bg-gray-400"}`} />
          <div>
            <Heading level="h2">{source.name}</Heading>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleEnabled}
            className="text-sm border border-ui-border-base rounded px-3 py-1.5 hover:bg-ui-bg-base-hover text-ui-fg-base"
          >
            {source.enabled ? "Disable" : "Enable"}
          </button>
        </div>
      </div>

      {/* Last job status */}
      {displayJob && (
        <div className="flex items-center gap-3 text-sm text-ui-fg-muted">
          <StatusBadge color={displayJob.status === "completed" ? "green" : displayJob.status === "failed" ? "red" : "orange"}>
            {displayJob.status === "running" ? "Running" : displayJob.status === "completed" ? "Completed" : "Failed"}
          </StatusBadge>
          <span>{jobLabel(displayJob.type)}</span>
          <span>·</span>
          <span>{timeSince(displayJob.startedAt)}</span>
          {displayJob.completedAt && <><span>·</span><span>{durationLabel(displayJob)}</span></>}
          {displayJob.rowsScraped != null && <><span>·</span><span>{displayJob.rowsScraped} rows</span></>}
          <button
            type="button"
            onClick={() => setLogOpen((current) => !current)}
            className="ml-auto text-xs font-medium text-ui-fg-interactive hover:underline"
          >
            {logOpen ? "Hide Logs" : "Logs"}
          </button>
        </div>
      )}

      {/* URLs */}
      <div className="flex flex-col gap-1">
        <Text size="small" weight="plus" className="text-ui-fg-muted uppercase tracking-wider mb-1">URLs</Text>
        {source.urls.length === 0 && (
          <Text size="small" className="text-ui-fg-subtle">No URLs configured.</Text>
        )}
        {source.urls.map(u => (
          <UrlRow
            key={u.id}
            u={u}
            onSave={patch => saveUrl(u.id, patch)}
            onDelete={() => removeUrl(u.id)}
            onRun={() => trigger(`urls/${u.id}/run`)}
            onUploadImages={() => trigger(`urls/${u.id}/upload-images`)}
            running={isRunning}
          />
        ))}
        <AddUrlForm onAdd={addUrl} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-ui-border-base">
        {isRunning ? (
          <Button size="small" variant="danger" onClick={cancelJob}>
            ■ Stop
          </Button>
        ) : (
          <>
            <Button
              size="small"
              variant="secondary"
              disabled={acting || !source.enabled}
              onClick={() => trigger("run")}
            >
              ▶ Scrape All
            </Button>
            <Button
              size="small"
              variant="secondary"
              disabled={acting}
              onClick={() => trigger("upload-images")}
            >
              ↑ Upload Images
            </Button>
            <Button
              size="small"
              variant="danger"
              disabled={acting}
              onClick={() => trigger("clear")}
            >
              Clear Stale Data
            </Button>
          </>
        )}
      </div>

      {/* Job log */}
      {displayJob && logOpen && <JobLog job={displayJob} />}
    </Container>
  );
}

// ── Add source form ──────────────────────────────────────────────────────────

function AddSourceForm({
  sources,
  onAdd,
}: {
  sources: ScraperSource[];
  onAdd: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const existingSlugs = new Set(sources.map((source) => source.slug));

  async function submit() {
    if (!name.trim() || !slug.trim()) return;
    await fetch(`${OPS_API}/api/v1/scrapers`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: name.trim(), slug: slug.trim() }),
    });
    setName(""); setSlug(""); setOpen(false);
    onAdd();
  }

  async function addPresetSource(preset: typeof RECOMMENDED_SOURCES[number]) {
    const createRes = await fetch(`${OPS_API}/api/v1/scrapers`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: preset.name, slug: preset.slug }),
    });
    if (!createRes.ok) throw new Error(await createRes.text());
    const { source } = await createRes.json() as { source: ScraperSource };

    for (const presetUrl of preset.urls) {
      await fetch(`${OPS_API}/api/v1/scrapers/${source.id}/urls`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(presetUrl),
      });
    }
    onAdd();
  }

  if (!open) {
    return (
      <div className="flex items-center gap-2">
        {RECOMMENDED_SOURCES.filter((source) => !existingSlugs.has(source.slug)).map((source) => (
          <Button
            key={source.slug}
            variant="secondary"
            size="small"
            onClick={() => addPresetSource(source)}
          >
            + {source.name}
          </Button>
        ))}
        <Button variant="secondary" size="small" onClick={() => setOpen(true)}>
          + Add Source
        </Button>
      </div>
    );
  }

  return (
    <Container className="p-4 flex flex-col gap-3">
      <Text weight="plus">New Competitor Source</Text>
      <div className="flex gap-3">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name (e.g. Lowe's)" className="flex-1 text-sm border border-ui-border-base rounded px-3 py-2 bg-ui-bg-base" />
        <input value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} placeholder="slug (e.g. lowes)" className="flex-1 text-sm border border-ui-border-base rounded px-3 py-2 bg-ui-bg-base font-mono" />
      </div>
      <div className="flex gap-2">
        <Button size="small" variant="primary" onClick={submit}>Create</Button>
        <Button size="small" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </Container>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ScrapersPage() {
  const [sources, setSources] = useState<ScraperSource[]>([]);
  const [loading, setLoading] = useState(true);

  async function ensurePresetSources(existingSources: ScraperSource[]) {
    let changed = false;

    for (const preset of RECOMMENDED_SOURCES) {
      let source = existingSources.find((existing) => existing.slug === preset.slug);

      if (!source) {
        const createRes = await fetch(`${OPS_API}/api/v1/scrapers`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name: preset.name, slug: preset.slug }),
        });
        if (!createRes.ok) continue;
        const created = await createRes.json() as { source: ScraperSource };
        source = created.source;
        changed = true;
      }

      const existingUrls = new Set(
        existingSources
          .find((existing) => existing.slug === preset.slug)
          ?.urls.map((url) => url.url) ?? [],
      );

      for (const presetUrl of preset.urls) {
        if (existingUrls.has(presetUrl.url)) continue;
        const addUrlRes = await fetch(`${OPS_API}/api/v1/scrapers/${source.id}/urls`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(presetUrl),
        });
        if (addUrlRes.ok) changed = true;
      }
    }

    return changed;
  }

  async function load() {
    try {
      const res = await fetch(`${OPS_API}/api/v1/scrapers`);
      const initial = await res.json() as { sources: ScraperSource[] };
      const changed = await ensurePresetSources(initial.sources);
      if (changed) {
        const refreshedRes = await fetch(`${OPS_API}/api/v1/scrapers`);
        const refreshed = await refreshedRes.json() as { sources: ScraperSource[] };
        setSources(refreshed.sources);
      } else {
        setSources(initial.sources);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <Text size="small" weight="plus" className="uppercase tracking-wider text-ui-fg-muted">Ops</Text>
          <Heading level="h1">Scraper Sources</Heading>
        </div>
        <AddSourceForm sources={sources} onAdd={load} />
      </div>

      {loading && <Text className="text-ui-fg-muted">Loading...</Text>}

      {!loading && sources.length === 0 && (
        <Text className="text-ui-fg-subtle">No scraper sources configured yet.</Text>
      )}

      <div className="flex flex-col gap-4">
        {sources.map(s => (
          <SourceCard key={s.id} source={s} onRefresh={load} />
        ))}
      </div>
    </div>
  );
}

export const config = defineRouteConfig({
  label: "Scrapers",
});
