"use client";

import { useRef, useState, useEffect, useCallback, ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CardCarouselProps {
  children: ReactNode;
  className?: string;
}

export default function CardCarousel({ children, className = "" }: CardCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
  }, [checkScroll, children]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <div className="relative group/carousel">
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-7 h-7 rounded-full bg-white border border-warm-200 shadow-sm flex items-center justify-center text-warm-500 hover:text-warm-700 hover:shadow transition-all opacity-0 group-hover/carousel:opacity-100"
        >
          <ChevronLeft size={15} />
        </button>
      )}

      <div
        ref={scrollRef}
        className={`flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar ${className}`}
      >
        {children}
      </div>

      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-7 h-7 rounded-full bg-white border border-warm-200 shadow-sm flex items-center justify-center text-warm-500 hover:text-warm-700 hover:shadow transition-all opacity-0 group-hover/carousel:opacity-100"
        >
          <ChevronRight size={15} />
        </button>
      )}
    </div>
  );
}
