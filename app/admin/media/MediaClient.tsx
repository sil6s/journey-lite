"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check, Copy, Grid2x2, Images, Loader2, LayoutList,
  Trash2, Upload, X, Search, AlertTriangle,
} from "lucide-react";
import { uploadContentImage } from "@/app/admin/content/actions";
import { deleteMediaAsset } from "./actions";

type Asset = {
  _id: string;
  url: string;
  originalFilename: string;
  size: number;
  mimeType: string;
  metadata?: { dimensions?: { width: number; height: number } };
  _createdAt: string;
};

function fmtBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function MediaClient({ initialAssets }: { initialAssets: Asset[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [assets, setAssets] = useState(initialAssets);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Asset | null>(null);
  const [, startT] = useTransition();

  const filtered = query.trim()
    ? assets.filter((a) => a.originalFilename?.toLowerCase().includes(query.toLowerCase()))
    : assets;

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadErr("");
    const newAssets: Asset[] = [];
    for (const file of Array.from(files)) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        const { url } = await uploadContentImage(fd);
        newAssets.push({
          _id: `tmp_${Date.now()}_${file.name}`,
          url,
          originalFilename: file.name,
          size: file.size,
          mimeType: file.type,
          _createdAt: new Date().toISOString(),
        });
      } catch {
        setUploadErr(`Failed to upload ${file.name}`);
      }
    }
    setAssets((prev) => [...newAssets, ...prev]);
    setUploading(false);
    router.refresh();
  }

  function copyUrl(asset: Asset) {
    navigator.clipboard.writeText(asset.url).then(() => {
      setCopiedId(asset._id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  function handleDelete(asset: Asset) {
    if (!window.confirm(`Delete "${asset.originalFilename}"? This cannot be undone.`)) return;
    setDeletingId(asset._id);
    startT(async () => {
      try {
        await deleteMediaAsset(asset._id);
        setAssets((prev) => prev.filter((a) => a._id !== asset._id));
        if (selected?._id === asset._id) setSelected(null);
      } catch {
        alert("Delete failed — this asset may still be referenced in content.");
      } finally {
        setDeletingId(null);
      }
    });
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1f2c25]">Media Library</h1>
          <p className="mt-0.5 text-sm text-[#5f6f66]">{assets.length} asset{assets.length !== 1 ? "s" : ""} · Upload images and copy URLs for use in content</p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 rounded-xl bg-[#0D3D24] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#145c42] disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => handleUpload(e.target.files)} />
      </div>

      {uploadErr && (
        <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {uploadErr}
          <button onClick={() => setUploadErr("")} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#9aafa5]" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by filename…"
            className="w-full rounded-xl border border-[#dce4df] bg-white pl-9 pr-3 py-2 text-sm outline-none focus:border-[#145c42]" />
        </div>
        <div className="flex rounded-lg border border-[#dce4df] bg-white p-0.5">
          <button onClick={() => setView("grid")}
            className={`rounded-md p-1.5 transition-colors ${view === "grid" ? "bg-[#0D3D24] text-white" : "text-[#9aafa5] hover:text-[#1f2c25]"}`}>
            <Grid2x2 className="h-4 w-4" />
          </button>
          <button onClick={() => setView("list")}
            className={`rounded-md p-1.5 transition-colors ${view === "list" ? "bg-[#0D3D24] text-white" : "text-[#9aafa5] hover:text-[#1f2c25]"}`}>
            <LayoutList className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Drag-drop upload zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleUpload(e.dataTransfer.files); }}
        className="rounded-xl border-2 border-dashed border-[#dce4df] bg-zinc-50 py-4 text-center text-xs text-[#9aafa5] hover:border-[#145c42] hover:bg-white transition-colors cursor-pointer"
        onClick={() => fileRef.current?.click()}
      >
        Drop images here or click to upload
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#dce4df] bg-zinc-50 py-16 text-center">
          <Images className="mx-auto mb-3 h-12 w-12 text-[#dce4df]" />
          <p className="font-semibold text-[#5f6f66]">No images yet</p>
          <p className="mt-1 text-sm text-[#9aafa5]">Upload your first image above</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((asset) => (
            <div key={asset._id}
              className={`group relative cursor-pointer overflow-hidden rounded-xl border transition-all ${selected?._id === asset._id ? "border-[#0D3D24] ring-2 ring-[#0D3D24]/20" : "border-[#dce4df] hover:border-[#9aafa5]"}`}
              onClick={() => setSelected(selected?._id === asset._id ? null : asset)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${asset.url}?w=300&fit=clip`} alt={asset.originalFilename} className="aspect-square w-full object-cover bg-zinc-100" />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex w-full items-center justify-between gap-1 p-2">
                  <button onClick={(e) => { e.stopPropagation(); copyUrl(asset); }}
                    className="flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-[10px] font-bold text-[#0D3D24]">
                    {copiedId === asset._id ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> URL</>}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(asset); }}
                    disabled={deletingId === asset._id}
                    className="rounded-md bg-white/90 p-1 text-red-500 hover:bg-red-50">
                    {deletingId === asset._id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-[#dce4df] bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#dce4df] bg-zinc-50 text-left text-[11px] font-bold uppercase tracking-wide text-[#9aafa5]">
                <th className="px-4 py-2.5">Preview</th>
                <th className="px-4 py-2.5">Filename</th>
                <th className="px-4 py-2.5 hidden sm:table-cell">Size</th>
                <th className="px-4 py-2.5 hidden md:table-cell">Dimensions</th>
                <th className="px-4 py-2.5 hidden lg:table-cell">Uploaded</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dce4df]">
              {filtered.map((asset) => (
                <tr key={asset._id} className="hover:bg-zinc-50">
                  <td className="px-4 py-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`${asset.url}?w=80&fit=clip`} alt={asset.originalFilename} className="h-10 w-10 rounded-lg object-cover border border-[#dce4df] bg-zinc-100" />
                  </td>
                  <td className="px-4 py-2 font-medium text-[#1f2c25] max-w-[200px] truncate">{asset.originalFilename || "—"}</td>
                  <td className="px-4 py-2 text-[#9aafa5] hidden sm:table-cell">{fmtBytes(asset.size)}</td>
                  <td className="px-4 py-2 text-[#9aafa5] hidden md:table-cell">
                    {asset.metadata?.dimensions ? `${asset.metadata.dimensions.width}×${asset.metadata.dimensions.height}` : "—"}
                  </td>
                  <td className="px-4 py-2 text-[#9aafa5] hidden lg:table-cell">{fmtDate(asset._createdAt)}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => copyUrl(asset)}
                        className="flex items-center gap-1 rounded-lg border border-[#dce4df] px-2.5 py-1 text-xs font-semibold text-[#1f2c25] hover:bg-zinc-50">
                        {copiedId === asset._id ? <><Check className="h-3 w-3 text-emerald-600" /> Copied</> : <><Copy className="h-3 w-3" /> Copy URL</>}
                      </button>
                      <button onClick={() => handleDelete(asset)} disabled={deletingId === asset._id}
                        className="rounded-lg border border-red-100 px-2 py-1 text-xs font-semibold text-red-500 hover:bg-red-50 disabled:opacity-40">
                        {deletingId === asset._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail panel for selected */}
      {selected && (
        <div className="fixed bottom-6 right-6 z-40 w-72 rounded-2xl border border-[#dce4df] bg-white shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#dce4df] px-4 py-2.5">
            <p className="text-xs font-bold text-[#1f2c25] truncate">{selected.originalFilename}</p>
            <button onClick={() => setSelected(null)} className="text-[#9aafa5] hover:text-[#1f2c25]"><X className="h-4 w-4" /></button>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${selected.url}?w=400&fit=clip`} alt={selected.originalFilename} className="w-full object-cover max-h-40 bg-zinc-100" />
          <div className="px-4 py-3 space-y-2">
            <div className="text-[11px] text-[#9aafa5] space-y-1">
              <p><span className="font-semibold">Size:</span> {fmtBytes(selected.size)}</p>
              {selected.metadata?.dimensions && <p><span className="font-semibold">Dimensions:</span> {selected.metadata.dimensions.width}×{selected.metadata.dimensions.height}</p>}
              <p><span className="font-semibold">Type:</span> {selected.mimeType}</p>
              <p><span className="font-semibold">Uploaded:</span> {fmtDate(selected._createdAt)}</p>
            </div>
            <input readOnly value={selected.url} className="w-full rounded-lg border border-[#dce4df] bg-zinc-50 px-2.5 py-1.5 font-mono text-[10px] text-[#5f6f66] outline-none" />
            <button onClick={() => copyUrl(selected)}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#0D3D24] py-2 text-xs font-semibold text-white hover:bg-[#145c42]">
              {copiedId === selected._id ? <><Check className="h-3.5 w-3.5" /> Copied!</> : <><Copy className="h-3.5 w-3.5" /> Copy URL</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
