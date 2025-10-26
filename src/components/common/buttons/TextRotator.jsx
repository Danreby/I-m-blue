import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";

export const TextRotator = forwardRef(({
  groups = [],
  defaultLetterDelay = 50,
  defaultDisplayDuration = 1500,
  transitionDuration = 500,
  onIndexChange,
  onEnd,
}, ref) => {
  const [index, setIndex] = useState(0);
  const indexRef = useRef(index);
  useEffect(() => { indexRef.current = index; }, [index]);

  const [visibleText, setVisibleText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [animClass, setAnimClass] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const mountedRef = useRef(true);
  const typingTimerRef = useRef(null);
  const waitTimerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    startSequence: (startIndex = 0) => {
      if (!groups || groups.length === 0) return;
      const idx = Math.max(0, Math.min(startIndex, groups.length - 1));
      setIndex(idx);
      setIsRunning(true);
      setTimeout(() => typeGroup(idx), 20);
    },
    stopSequence: () => {
      clearAllTimers();
      setIsRunning(false);
      setIsTyping(false);
    },
    getIndex: () => indexRef.current,
  }), [groups]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearAllTimers();
    };
  }, []);

  useEffect(() => {
    if (typeof onIndexChange === "function") {
      try {
        onIndexChange(index);
      } catch (err) {}
    }
  }, [index]);

  function clearAllTimers() {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    if (waitTimerRef.current) {
      clearTimeout(waitTimerRef.current);
      waitTimerRef.current = null;
    }
  }

  function typeGroup(i) {
    clearAllTimers();
    if (!mountedRef.current) return;
    const group = groups[i] ?? { text: "" };
    const phrase = String(group.text ?? "");

    setVisibleText("");
    setIsTyping(true);

    setAnimClass((prev) => (prev.includes("fade-in") ? prev : "fade-in-right"));

    let pos = 0;
    const letterDelay = typeof group.letterDelay === "number" ? group.letterDelay : defaultLetterDelay;

    function typeNext() {
      if (!mountedRef.current) return clearAllTimers();
      if (pos <= phrase.length) {
        setVisibleText(phrase.substring(0, pos));
        pos += 1;
        typingTimerRef.current = setTimeout(typeNext, letterDelay);
      } else {
        setIsTyping(false);

        setAnimClass("fade-in-right");

        const displayDuration = typeof group.displayDuration === "number" ? group.displayDuration : defaultDisplayDuration;

        if (i >= groups.length - 1) {
          waitTimerRef.current = setTimeout(() => {
            clearAllTimers();
            setIsRunning(false);
            if (typeof onEnd === "function") onEnd();
          }, displayDuration);
        } else {
          waitTimerRef.current = setTimeout(() => {
            goToIndex(i + 1, "next");
          }, displayDuration);
        }
      }
    }

    typeNext();
  }

  function goToIndex(nextIndex, dir = "next") {
    if (!groups || groups.length === 0) return;
    clearAllTimers();

    setAnimClass(dir === "next" ? "fade-out-left" : "fade-out-right");

    setTimeout(() => {
      if (!mountedRef.current) return;
      const idx = ((nextIndex % groups.length) + groups.length) % groups.length;
      setIndex(idx);
      setAnimClass(dir === "next" ? "fade-in-right" : "fade-in-left");
      typeGroup(idx);
    }, transitionDuration);
  }

  const currentGroup = groups[index] ?? {};
  const extras = currentGroup.extras ?? null;

  return (
    <div className="w-full max-w-3xl mx-auto text-center text-rotator-draggable">
      <div
        className={`text-4xl font-bold font-mono text-rotator-placeholder ${animClass}`}
        style={{ animationDuration: `${transitionDuration}ms` }}
      >
        <span>{visibleText}</span>
        <span className="ml-1 animate-blink">|</span>
      </div>

      <div className="mt-4 flex items-center justify-center" aria-hidden={isTyping}>
        {extras ? <div className="max-w-full">{extras}</div> : null}
      </div>

    </div>
  );
});

TextRotator.displayName = "TextRotator";