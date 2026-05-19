"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

type PdfDoc = {
  numPages: number;
  getPage(n: number): Promise<PdfPageProxy>;
  destroy(): Promise<void>;
};
type PdfRenderTask = { promise: Promise<void>; cancel(): void };
type PdfPageProxy = {
  getViewport(opts: { scale: number; rotation?: number }): PdfViewport;
  render(opts: {
    canvasContext: CanvasRenderingContext2D;
    viewport: PdfViewport;
  }): PdfRenderTask;
  getTextContent(): Promise<{ items: TextItem[]; styles: Record<string, unknown> }>;
  cleanup(): void;
};
type PdfViewport = {
  width: number;
  height: number;
  scale: number;
  rotation: number;
};
type TextItem = {
  str: string;
  transform: number[];
  width: number;
  height: number;
  dir: string;
  fontName: string;
};

interface PdfRendererProps {
  file: File;
  zoomEnabled: boolean;
  rotation: number;
  onError: (msg: string) => void;
  onPageChange: (current: number, total: number) => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 3;

export function PdfRenderer({
  file,
  zoomEnabled,
  rotation,
  onError,
  onPageChange,
}: PdfRendererProps) {
  const [doc, setDoc] = useState<PdfDoc | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let task: { promise: Promise<PdfDoc>; destroy?: () => void } | null = null;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        (pdfjs as unknown as { GlobalWorkerOptions: { workerSrc: string } })
          .GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const buf = await file.arrayBuffer();
        task = (pdfjs as unknown as {
          getDocument: (o: { data: ArrayBuffer }) => {
            promise: Promise<PdfDoc>;
            destroy: () => void;
          };
        }).getDocument({ data: buf });

        const pdfDoc = await task!.promise;
        if (cancelled) return;
        setDoc(pdfDoc);
        setNumPages(pdfDoc.numPages);
        onPageChange(1, pdfDoc.numPages);
      } catch (e) {
        if (!cancelled) {
          onError(e instanceof Error ? e.message : "Could not render PDF");
        }
      }
    })();
    return () => {
      cancelled = true;
      task?.destroy?.();
    };
  }, [file, onError, onPageChange]);

  useEffect(() => {
    if (!zoomEnabled) setScale(1);
  }, [zoomEnabled]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        setContainerWidth(e.contentRect.width);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !zoomEnabled) return;
    const pointers = new Map<number, { x: number; y: number }>();
    let initialDist = 0;
    let initialScale = scale;

    const dist = () => {
      const pts = Array.from(pointers.values());
      if (pts.length < 2) return 0;
      const dx = pts[0].x - pts[1].x;
      const dy = pts[0].y - pts[1].y;
      return Math.hypot(dx, dy);
    };

    const onDown = (e: PointerEvent) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        initialDist = dist();
        initialScale = scale;
      }
    };
    const onMove = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2 && initialDist > 0) {
        const newDist = dist();
        const next = Math.max(
          MIN_SCALE,
          Math.min(MAX_SCALE, initialScale * (newDist / initialDist)),
        );
        setScale(next);
      }
    };
    const onUp = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) initialDist = 0;
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, [zoomEnabled, scale]);

  const handlePageVisible = useCallback(
    (n: number) => onPageChange(n, numPages),
    [onPageChange, numPages],
  );

  if (!doc) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-text-tertiary">
        Loading PDF…
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-full overflow-auto"
      style={{
        touchAction: zoomEnabled ? "pan-y pinch-zoom" : "pan-y",
      }}
    >
      <div className="flex flex-col gap-3 p-3">
        {Array.from({ length: numPages }).map((_, i) => (
          <PdfPage
            key={i}
            doc={doc}
            pageNumber={i + 1}
            rotation={rotation}
            userScale={scale}
            containerWidth={containerWidth}
            onVisible={handlePageVisible}
          />
        ))}
      </div>
    </div>
  );
}

interface PdfPageProps {
  doc: PdfDoc;
  pageNumber: number;
  rotation: number;
  userScale: number;
  containerWidth: number;
  onVisible: (pageNumber: number) => void;
}

function PdfPage({
  doc,
  pageNumber,
  rotation,
  userScale,
  containerWidth,
  onVisible,
}: PdfPageProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const [estimatedHeight, setEstimatedHeight] = useState(800);
  const [isInView, setIsInView] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const page = await doc.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: 1, rotation });
      if (cancelled) return;
      const fitScale = containerWidth > 0
        ? (containerWidth - 24) / baseViewport.width
        : 1;
      const finalScale = fitScale * userScale;
      const viewport = page.getViewport({ scale: finalScale, rotation });
      if (!cancelled) setEstimatedHeight(viewport.height);
    })();
    return () => {
      cancelled = true;
    };
  }, [doc, pageNumber, rotation, userScale, containerWidth]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setIsInView(true);
            onVisible(pageNumber);
          }
        }
      },
      { root: el.closest(".overflow-auto"), rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [pageNumber, onVisible]);

  useEffect(() => {
    if (!isInView || containerWidth === 0) return;
    let cancelled = false;
    let renderTask: PdfRenderTask | null = null;

    (async () => {
      try {
        const page = await doc.getPage(pageNumber);
        const baseViewport = page.getViewport({ scale: 1, rotation });
        const fitScale = (containerWidth - 24) / baseViewport.width;
        const finalScale = fitScale * userScale;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const viewport = page.getViewport({ scale: finalScale * dpr, rotation });

        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width / dpr}px`;
        canvas.style.height = `${viewport.height / dpr}px`;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        renderTask = page.render({ canvasContext: ctx, viewport });
        await renderTask.promise;

        const textLayer = textLayerRef.current;
        if (!textLayer || cancelled) return;
        textLayer.innerHTML = "";
        textLayer.style.width = `${viewport.width / dpr}px`;
        textLayer.style.height = `${viewport.height / dpr}px`;

        const textContent = await page.getTextContent();
        const textViewport = page.getViewport({ scale: finalScale, rotation });
        for (const item of textContent.items) {
          const span = document.createElement("span");
          span.textContent = item.str;
          const fontSize = Math.hypot(item.transform[0], item.transform[1]);
          const m = item.transform;
          const x = m[4];
          const y = textViewport.height - m[5];
          span.style.position = "absolute";
          span.style.left = `${x}px`;
          span.style.top = `${y - fontSize}px`;
          span.style.fontSize = `${fontSize}px`;
          span.style.transformOrigin = "0% 0%";
          span.style.whiteSpace = "pre";
          textLayer.appendChild(span);
        }
        if (!cancelled) setIsRendered(true);
      } catch (e) {
        if (e instanceof Error && e.name === "RenderingCancelledException") return;
        console.warn("PDF page render failed", pageNumber, e);
      }
    })();

    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [isInView, doc, pageNumber, rotation, userScale, containerWidth]);

  return (
    <div
      ref={wrapperRef}
      data-page-number={pageNumber}
      className={cn(
        "relative mx-auto bg-white shadow-sm",
        pageNumber > 1 && "mt-1 border-t border-border-subtle/30",
      )}
      style={{ minHeight: estimatedHeight }}
    >
      <canvas ref={canvasRef} className="block" />
      <div
        ref={textLayerRef}
        className="pdf-text-layer absolute inset-0 select-text text-transparent"
        style={{
          opacity: isRendered ? 1 : 0,
          pointerEvents: isRendered ? "auto" : "none",
        }}
      />
    </div>
  );
}
