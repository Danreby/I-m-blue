import React, { useEffect, useRef, useState } from "react";

/**
 * WordSyncPlayer
 *
 * Props:
 *  - audioSrc: string (URL ou caminho do áudio)
 *  - timedWords: Array<{ word: string, time: number (seconds), letterDelay?: number }>
 *  - className: string (opcional)
 *  - autoPlay: boolean (opcional)
 *
 * Comportamento:
 *  - escuta currentTime do <audio>
 *  - quando currentTime >= timedWords[nextIndex].time inicia a digitação daquela palavra
 *  - se o áudio pular à frente além do tempo (seek rápido), a palavra é mostrada imediatamente
 *  - se o áudio voltar pra trás, o estado se ajusta para refletir a palavra correta
 */
export default function WordSyncPlayer({
  audioSrc,
  timedWords = [],
  className = "",
  autoPlay = false,
}) {
  const audioRef = useRef(null);
  const [displayWords, setDisplayWords] = useState([]); // words já completamente exibidas
  const [currentTyping, setCurrentTyping] = useState(""); // a palavra que está sendo digitada (parcial)
  const typingIntervalRef = useRef(null);
  const nextIndexRef = useRef(0); // índice da próxima palavra a processar
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearTypingInterval();
    };
  }, []);

  useEffect(() => {
    // reset quando lista de palavras muda
    setDisplayWords([]);
    setCurrentTyping("");
    nextIndexRef.current = 0;
    clearTypingInterval();
  }, [timedWords]);

  function clearTypingInterval() {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
  }

  function showFullWordAndAdvance(wordObj) {
    setDisplayWords((p) => [...p, wordObj.word]);
    setCurrentTyping("");
    nextIndexRef.current = nextIndexRef.current + 1;
  }

  function startTypingWord(wordObj) {
    clearTypingInterval();
    const letterDelay = Number.isFinite(wordObj.letterDelay) ? wordObj.letterDelay : 40;
    let pos = 0;
    setCurrentTyping("");
    typingIntervalRef.current = setInterval(() => {
      if (!mountedRef.current) return clearTypingInterval();
      // se o áudio avançou além do tempo para esta palavra (ou passou adiante), revele direto
      const audio = audioRef.current;
      if (audio && audio.currentTime > wordObj.time + 1.0) {
        // se o audio está >1s além do início da palavra, assume que devemos mostrar direto
        clearTypingInterval();
        showFullWordAndAdvance(wordObj);
        return;
      }
      if (pos <= wordObj.word.length) {
        setCurrentTyping(wordObj.word.slice(0, pos));
        pos++;
      } else {
        clearTypingInterval();
        showFullWordAndAdvance(wordObj);
      }
    }, Math.max(1, letterDelay));
  }

  function onTimeUpdate() {
    const audio = audioRef.current;
    if (!audio) return;
    const t = audio.currentTime;
    const idx = nextIndexRef.current;

    // se já processamos todas as palavras, nada a fazer
    if (idx >= timedWords.length) return;

    const nextWordObj = timedWords[idx];
    if (!nextWordObj) return;

    // se o tempo atual já passou do timestamp da próxima palavra -> iniciar digitação (ou exibir direto)
    if (t >= nextWordObj.time) {
      // se a palavra tem zero length, apenas avance
      if (!nextWordObj.word || nextWordObj.word.length === 0) {
        showFullWordAndAdvance(nextWordObj);
        return;
      }
      // se audio está bastante adiantado em relação ao word start, exiba direto
      if (t >= nextWordObj.time + 0.25) {
        // exibe direto para não ficar digitando atrasado
        showFullWordAndAdvance(nextWordObj);
      } else {
        // inicia digitação da palavra
        startTypingWord(nextWordObj);
      }
    } else {
      // tempo atual é anterior ao próximo word -> pode ter rolado seek pra trás
      // reconstruir displayWords conforme t
      // encontrar o último índice cuja time <= t
      let lastIdx = -1;
      for (let i = 0; i < timedWords.length; i++) {
        if (timedWords[i].time <= t) lastIdx = i;
        else break;
      }
      if (lastIdx + 1 !== nextIndexRef.current) {
        // ajustar display conforme lastIdx
        const newDisplay = timedWords.slice(0, lastIdx + 1).map((w) => w.word);
        setDisplayWords(newDisplay);
        setCurrentTyping("");
        clearTypingInterval();
        nextIndexRef.current = lastIdx + 1;
      }
    }
  }

  function onPlay() {
    // no play, apenas garantir que estamos alinhados
    onTimeUpdate();
  }

  // manually trigger onTimeUpdate when user seeks via progress bar
  function onSeeked() {
    clearTypingInterval();
    onTimeUpdate();
  }

  // render: exibe displayWords (separadas por espaço) + currentTyping
  return (
    <div className={`word-sync-player ${className}`}>
      <audio
        ref={audioRef}
        src={audioSrc}
        controls
        onTimeUpdate={onTimeUpdate}
        onPlay={onPlay}
        onSeeked={onSeeked}
        autoPlay={autoPlay}
      />
      <div
        className="word-display text-4xl font-bold font-mono mt-6"
        aria-live="polite"
      >
        {displayWords.length > 0 ? displayWords.join(" ") + " " : ""}
        <span>{currentTyping}</span>
        <span className="ml-1 animate-blink">|</span>
      </div>
    </div>
  );
}
