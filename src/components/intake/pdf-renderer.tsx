"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { cn } from "@/lib/utils";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [scale, setScale] = useState(1);
  const scaleRef = useRef(1);

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

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
    if (!zoomEnabled) setScale(1);
  }, [zoomEnabled]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !zoomEnabled) return;
    const pointers = new Map<number, { x: number; y: number }>();
    let initialDist = 0;
    let initialScale = scaleRef.current;

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
        initialScale = scaleRef.current;
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
  }, [zoomEnabled]);

  const handleLoadSuccess = useCallback(
    ({ numPages: n }: { numPages: number }) => {
      setNumPages(n);
      onPageChange(1, n);
    },
    [onPageChange],
  );

  const handleLoadError = useCallback(
    (err: Error) => {
      onError(`${err.name}: ${err.message}`);
    },
    [onError],
  );

  const pageWidth = containerWidth > 24 ? containerWidth - 24 : 0;

  return (
    <div
      ref={containerRef}
      className="h-full overflow-auto"
      style={{
        touchAction: zoomEnabled ? "pan-y pinch-zoom" : "pan-y",
      }}
    >
      <Document
        file={file}
        onLoadSuccess={handleLoadSuccess}
        onLoadError={handleLoadError}
        loading={
          <div className="flex h-full items-center justify-center p-6 text-sm text-text-tertiary">
            Loading PDF…
          </div>
        }
        error={
          <div className="flex h-full items-center justify-center p-6 text-sm text-accent-red">
            Failed to load PDF.
          </div>
        }
      >
        {pageWidth > 0 && (
          <div className="flex flex-col gap-3 p-3">
            {Array.from({ length: numPages }).map((_, i) => (
              <PageWithObserver
                key={`${i}-${rotation}`}
                pageNumber={i + 1}
                width={pageWidth}
                rotate={rotation}
                scale={scale}
                onVisible={(n) => onPageChange(n, numPages)}
              />
            ))}
          </div>
        )}
      </Document>
    </div>
  );
}

interface PageWithObserverProps {
  pageNumber: number;
  width: number;
  rotate: number;
  scale: number;
  onVisible: (pageNumber: number) => void;
}

function PageWithObserver({
  pageNumber,
  width,
  rotate,
  scale,
  onVisible,
}: PageWithObserverProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) onVisible(pageNumber);
        }
      },
      { root: el.closest(".overflow-auto"), rootMargin: "-25% 0px -50% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [pageNumber, onVisible]);

  return (
    <div
      ref={wrapperRef}
      data-page={pageNumber}
      className={cn(
        "relative mx-auto bg-white shadow-sm",
        pageNumber > 1 && "border-t border-border-subtle/30",
      )}
    >
      <Page
        pageNumber={pageNumber}
        width={width}
        rotate={rotate}
        scale={scale}
        renderTextLayer
        renderAnnotationLayer={false}
        loading={
          <div className="flex aspect-[8.5/11] items-center justify-center text-xs text-text-tertiary">
            Rendering page {pageNumber}…
          </div>
        }
      />
    </div>
  );
}
