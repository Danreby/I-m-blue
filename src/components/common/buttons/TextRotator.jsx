import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";

export function buildGroupsFromLyrics(lyrics, opts = {}) {
  const {
    baseDisplayPerChar = 120,
    minDisplay = 250,
    defaultLetterDelay = 50,
    pauseForLineBreaks = true,
    lineBreakPause = 700,
    overridesByIndex = {},
    overridesByWord = {},
    trimWords = true,
  } = opts;

  const lines = lyrics.split(/\r?\n/);
  const groups = [];

  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    if (!line.trim()) {
      if (pauseForLineBreaks) {
        groups.push({ text: "", letterDelay: 0, displayDuration: lineBreakPause, isPause: true });
      }
      continue;
    }

    const tokens = line.split(/\s+/);
    for (let t = 0; t < tokens.length; t++) {
      let word = tokens[t];
      if (trimWords) word = word.trim();
      if (word === "") continue;

      const idx = groups.length;
      const overridden = Object.prototype.hasOwnProperty.call(overridesByIndex, idx)
        ? Number(overridesByIndex[idx])
        : (Object.prototype.hasOwnProperty.call(overridesByWord, word) ? Number(overridesByWord[word]) : null);

      const displayDuration = (overridden !== null && !Number.isNaN(overridden))
        ? overridden
        : Math.max(minDisplay, Math.ceil(word.length * baseDisplayPerChar));

      const letterDelay = Math.max(10, Math.round(defaultLetterDelay - Math.log(Math.max(1, word.length)) * 6));

      groups.push({ text: word, letterDelay, displayDuration });
    }

    if (pauseForLineBreaks && li < lines.length - 1) {
      groups.push({ text: "", letterDelay: 0, displayDuration: Math.round(lineBreakPause / 2), isPause: true });
    }
  }

  return groups;
}

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
  const mountedRef = useRef(true);

  const typingTimerRef = useRef(null);
  const waitTimerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    startSequence: (startIndex = 0) => {
      if (!groups || groups.length === 0) return;
      const idx = Math.max(0, Math.min(startIndex, groups.length - 1));
      setIndex(idx);
      setTimeout(() => typeGroup(idx), 20);
    },
    stopSequence: () => {
      clearAllTimers();
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
      try { onIndexChange(index); } catch (err) {}
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

    const letterDelay = typeof group.letterDelay === "number" ? group.letterDelay : defaultLetterDelay;
    const displayDuration = typeof group.displayDuration === "number" ? group.displayDuration : defaultDisplayDuration;

    setAnimClass((prev) => (prev.includes("fade-in") ? prev : "fade-in-right"));

    if (phrase === "") {
      setIsTyping(false);
      waitTimerRef.current = setTimeout(() => {
        nextOrEnd(i);
      }, displayDuration);
      return;
    }

    let pos = 0;
    function typeNext() {
      if (!mountedRef.current) return clearAllTimers();
      if (pos <= phrase.length) {
        setVisibleText(phrase.substring(0, pos));
        pos += 1;
        typingTimerRef.current = setTimeout(typeNext, letterDelay);
      } else {
        setIsTyping(false);
        waitTimerRef.current = setTimeout(() => {
          nextOrEnd(i);
        }, displayDuration);
      }
    }

    typeNext();
  }

  function nextOrEnd(i) {
    if (!mountedRef.current) return;
    if (i >= groups.length - 1) {
      if (typeof onEnd === "function") onEnd();
      return;
    }
    goToIndex(i + 1, "next");
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
export default TextRotator;
