import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";

const TextRotator = forwardRef(
  (
    {
      groups = [],
      defaultLetterDelay = 50,
      defaultDisplayDuration = 2000,
      transitionDuration = 500,
      mobileBreakpoint = 768,
      onIndexChange,
    },
    ref
  ) => {
    const [index, setIndex] = useState(0);
    const indexRef = useRef(index);
    useEffect(() => {
      indexRef.current = index;
    }, [index]);

    const [visibleText, setVisibleText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [animClass, setAnimClass] = useState("");

    const containerRef = useRef(null);
    const extrasRef = useRef(null);

    const draggingRef = useRef(false);
    const startXRef = useRef(0);
    const lastXRef = useRef(0);
    const pointerIdRef = useRef(null);
    const [dragOffset, setDragOffset] = useState(0);

    const typingTimerRef = useRef(null);
    const displayTimerRef = useRef(null);
    const transitionTimerRef = useRef(null);

    const mountedRef = useRef(true);

    const [isMobile, setIsMobile] = useState(
      typeof window !== "undefined" ? window.innerWidth <= mobileBreakpoint : false
    );

    useImperativeHandle(
      ref,
      () => ({
        next: () => goToIndex(indexRef.current + 1, "next", true),
        prev: () => goToIndex(indexRef.current - 1, "prev", true),
        goTo: (i) => goToIndex(i, i > indexRef.current ? "next" : "prev", true),
        getIndex: () => indexRef.current,
      }),
      [groups]
    );

    useEffect(() => {
      mountedRef.current = true;
      if (groups.length > 0) startTyping(index);

      const handleResize = () => {
        setIsMobile(window.innerWidth <= mobileBreakpoint);
      };
      window.addEventListener("resize", handleResize);

      return () => {
        mountedRef.current = false;
        clearAllTimers();
        window.removeEventListener("resize", handleResize);
      };
    }, []);

    useEffect(() => {
      if (groups.length > 0 && index >= groups.length) {
        const idx = 0;
        setIndex(idx);
        startTyping(idx);
      }
    }, [groups, index]);

    useEffect(() => {
      if (typeof onIndexChange === "function") {
        try {
          onIndexChange(index);
        } catch (err) {
        }
      }
    }, [index, onIndexChange]);

    function clearAllTimers() {
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
      }
      if (displayTimerRef.current) {
        clearTimeout(displayTimerRef.current);
        displayTimerRef.current = null;
      }
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = null;
      }
    }

    function startTyping(i) {
      clearAllTimers();
      const group = groups[i] ?? { text: "" };
      const phrase = group.text ?? "";
      setVisibleText("");
      setIsTyping(true);

      setAnimClass((prev) => (prev.includes("fade-in") ? prev : "fade-in-right"));

      let pos = 0;
      const letterDelay = Number.isFinite(group.letterDelay) ? group.letterDelay : defaultLetterDelay;

      typingTimerRef.current = setInterval(() => {
        if (!mountedRef.current) return clearAllTimers();
        if (pos <= phrase.length) {
          setVisibleText(phrase.substring(0, pos));
          pos++;
        } else {
          clearInterval(typingTimerRef.current);
          typingTimerRef.current = null;
          setIsTyping(false);

          const displayDuration = Number.isFinite(group.displayDuration)
            ? group.displayDuration
            : defaultDisplayDuration;

          if (displayDuration > 0) {
            displayTimerRef.current = setTimeout(() => {
              displayTimerRef.current = null;
              goToIndex(i + 1, "next");
            }, displayDuration);
          }
        }
      }, Math.max(1, letterDelay));
    }

    function goToIndex(nextIndex, dir = "next", force = false) {
      if (!groups || groups.length === 0) return;
      if (isTyping && !force) return;

      if (isTyping && force) {
        if (typingTimerRef.current) {
          clearInterval(typingTimerRef.current);
          typingTimerRef.current = null;
        }
        setIsTyping(false);
      }

      clearAllTimers();

      if (dir === "next") {
        setAnimClass("fade-out-left");
      } else {
        setAnimClass("fade-out-right");
      }

      transitionTimerRef.current = setTimeout(() => {
        if (!mountedRef.current) return;
        const idx = ((nextIndex % groups.length) + groups.length) % groups.length;
        setIndex(idx);

        if (dir === "next") {
          setAnimClass("fade-in-right");
        } else {
          setAnimClass("fade-in-left");
        }

        startTyping(idx);
        setDragOffset(0);
      }, transitionDuration);
    }

    function onPointerDown(e) {
      if (!isMobile) return;
      if (isTyping) return;
      if (e.button && e.button !== 0) return;

      if (e.target && e.target.closest && e.target.closest('button, a, input, textarea, select, [role="button"]')) {
        return;
      }

      const target = e.currentTarget;
      try {
        target.setPointerCapture(e.pointerId);
        pointerIdRef.current = e.pointerId;
      } catch (err) {}
      draggingRef.current = true;
      startXRef.current = e.clientX;
      lastXRef.current = e.clientX;
      setDragOffset(0);
    }

    function onPointerMove(e) {
      if (!isMobile) return;
      if (!draggingRef.current) return;
      if (pointerIdRef.current !== null && e.pointerId !== pointerIdRef.current) return;
      const currentX = e.clientX;
      lastXRef.current = currentX;
      const delta = currentX - startXRef.current;
      setDragOffset(delta);
    }

    function endPointerDrag(e) {
      if (!isMobile) return;
      if (!draggingRef.current) return;
      draggingRef.current = false;
      const totalDelta = lastXRef.current - startXRef.current;
      const threshold = 60;
      if (Math.abs(totalDelta) >= threshold) {
        if (totalDelta < 0) {
          goToIndex(index + 1, "next");
        } else {
          goToIndex(index - 1, "prev");
        }
      } else {
        setDragOffset(0);
      }
      try {
        if (pointerIdRef.current !== null) e.currentTarget.releasePointerCapture(pointerIdRef.current);
      } catch (err) {}
      pointerIdRef.current = null;
    }

    function onPointerCancel(e) {
      if (!isMobile) return;
      draggingRef.current = false;
      setDragOffset(0);
      try {
        if (pointerIdRef.current !== null) e.currentTarget.releasePointerCapture(pointerIdRef.current);
      } catch (err) {}
      pointerIdRef.current = null;
    }

    const currentGroup = groups[index] ?? {};
    const extras = currentGroup.extras ?? null;

    return (
      <div
        ref={containerRef}
        className="w-full max-w-3xl mx-auto text-center text-rotator-draggable"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointerDrag}
        onPointerCancel={onPointerCancel}
      >
        <div
          className={`text-4xl font-bold font-mono text-rotator-placeholder ${animClass}`}
          style={{
            animationDuration: `${transitionDuration}ms`,
            transform: `translateX(${dragOffset}px)`,
            transition: draggingRef.current ? "none" : `transform ${transitionDuration}ms ease`,
          }}
        >
          <span>{visibleText}</span>
          <span className="ml-1 animate-blink">|</span>
        </div>

        <div
          ref={extrasRef}
          className="mt-4 flex items-center justify-center"
          aria-hidden={isTyping}
          style={{
            transform: `translateX(${dragOffset * 0.3}px)`,
            transition: draggingRef.current ? "none" : `transform ${transitionDuration}ms ease`,
          }}
        >
          {extras ? <div className="max-w-full">{extras}</div> : null}
        </div>

      </div>
    );
  }
);

export default TextRotator;
