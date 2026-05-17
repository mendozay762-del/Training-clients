"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileText, Image as ImageIcon, X, Upload, FileX } from "lucide-react";
import { cn } from "@/lib/utils";

type FileKind = "pdf" | "image" | "docx" | "unsupported";

function detectKind(file: File): FileKind {
  const t = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  if (t === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (t.startsWith("image/")) return "image";
  if (
    t === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".docx")
  )
    return "docx";
  return "unsupported";
}

interface QuestionnaireViewerProps {
  className?: string;
  onClear?: () => void;
}

export function QuestionnaireViewer({
  className,
  onClear,
}: QuestionnaireViewerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [kind, setKind] = useState<FileKind>("unsupported");
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [docxHtml, setDocxHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const loadFile = useCallback(async (f: File) => {
    setError(null);
    setDocxHtml(null);
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      setObjectUrl(null);
    }
    const k = detectKind(f);
    if (k === "unsupported") {
      setError("Unsupported file type. Use PDF, image, or .docx.");
      return;
    }
    setFile(f);
    setKind(k);

    if (k === "pdf" || k === "image") {
      const url = URL.createObjectURL(f);
      setObjectUrl(url);
      return;
    }

    if (k === "docx") {
      setIsConverting(true);
      try {
        const { default: mammoth } = await import("mammoth/mammoth.browser");
        const arrayBuffer = await f.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setDocxHtml(result.value);
      } catch (e) {
        console.error(e);
        setError("Couldn't read this .docx. Try converting to PDF.");
        setFile(null);
        setKind("unsupported");
      } finally {
        setIsConverting(false);
      }
    }
  }, [objectUrl]);

  function clear() {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setFile(null);
    setKind("unsupported");
    setObjectUrl(null);
    setDocxHtml(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
    onClear?.();
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) loadFile(f);
  }

  if (!file) {
    return (
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed p-6 text-center transition-colors",
          isDragOver
            ? "border-accent-blue/60 bg-accent-blue/5"
            : "border-border-subtle/40 bg-card/40",
          className,
        )}
      >
        <Upload className="h-6 w-6 text-text-tertiary" />
        <div>
          <p className="text-sm font-medium text-text-primary">
            Drop the questionnaire here
          </p>
          <p className="mt-0.5 text-xs text-text-tertiary">
            PDF, image, or .docx — stays in your browser only
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-button bg-card-hover px-4 py-2 text-sm font-medium hover:bg-card"
        >
          Choose file
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,image/*,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) loadFile(f);
          }}
        />
        {error && (
          <p className="flex items-center gap-1.5 text-xs text-accent-red">
            <FileX className="h-3.5 w-3.5" />
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex h-full flex-col rounded-card bg-card", className)}>
      <header className="flex items-center justify-between gap-2 border-b border-border-subtle/40 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2 text-sm">
          {kind === "image" ? (
            <ImageIcon className="h-4 w-4 shrink-0 text-text-tertiary" />
          ) : (
            <FileText className="h-4 w-4 shrink-0 text-text-tertiary" />
          )}
          <span className="truncate font-medium">{file.name}</span>
        </div>
        <button
          type="button"
          onClick={clear}
          aria-label="Remove file"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-button hover:bg-card-hover"
        >
          <X className="h-4 w-4" />
        </button>
      </header>
      <div className="relative flex-1 overflow-auto">
        {isConverting && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-text-tertiary">
            Converting…
          </div>
        )}
        {kind === "pdf" && objectUrl && (
          <iframe
            src={objectUrl}
            title={file.name}
            className="h-full w-full"
          />
        )}
        {kind === "image" && objectUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={objectUrl}
            alt={file.name}
            className="h-full w-full object-contain"
          />
        )}
        {kind === "docx" && docxHtml && (
          <div
            className="prose-docx p-4 text-sm leading-relaxed text-text-primary"
            dangerouslySetInnerHTML={{ __html: docxHtml }}
          />
        )}
      </div>
    </div>
  );
}
