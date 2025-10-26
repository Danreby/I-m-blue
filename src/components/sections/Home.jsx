import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { TextRotator } from "../common/buttons/TextRotator";
import { RevealOnScroll } from "../RevealOnScroll"; // mantém o mesmo import do seu projeto

export const Home = () => {
  const rotatorRef = useRef(null);

  const [dateLife, setDateLife] = useState("");
  const [dateLifeAlone, setDateLifeAlone] = useState(0);
  const [displayDateLifeAloneExtense, setDisplayDateLifeAloneExtense] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const startUTC = Date.UTC(2003, 3, 15);
    const today = new Date();
    const todayUTC = Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate()
    );
    const msPerDay = 1000 * 60 * 60 * 24;
    setDateLife(Math.floor((todayUTC - startUTC) / msPerDay));

    const startAloneY = 2022;
    const startAloneM = 11;
    const startAloneD = 7;

    const startAloneUTC = Date.UTC(startAloneY, startAloneM, startAloneD);
    const totalDaysAlone = Math.floor((todayUTC - startAloneUTC) / msPerDay);
    setDateLifeAlone(totalDaysAlone);

    const currY = today.getUTCFullYear();
    const currM = today.getUTCMonth();
    const currD = today.getUTCDate();

    let years = currY - startAloneY;
    let months = currM - startAloneM;
    let days = currD - startAloneD;

    if (days < 0) {
      const daysInPrevMonth = new Date(Date.UTC(currY, currM, 0)).getUTCDate();
      days += daysInPrevMonth;
      months -= 1;
    }

    if (months < 0) {
      months += 12;
      years -= 1;
    }

    const yLabel = `${years} ano${years !== 1 ? "s" : ""}`;
    const mLabel = `${months} mês${months !== 1 ? "es" : ""}`;
    const dLabel = `${days} dia${days !== 1 ? "s" : ""}`;

    setDisplayDateLifeAloneExtense(`${yLabel}, ${mLabel} e ${dLabel}`);
  }, []);

  const groups = [
    { text: `Primeira linha — digitando devagar...`, letterDelay: 80, displayDuration: 1800 },
    { text: `Segunda linha — digitando rápido.`, letterDelay: 25, displayDuration: 1200 },
    { text: `E além... 🚀`, letterDelay: 50, displayDuration: 2000 },
  ];

  function handleStart() {
    if (!rotatorRef.current || typeof rotatorRef.current.startSequence !== "function") return;
    setIsStarted(true);
    rotatorRef.current.startSequence(0);
  }

  function handleOnIndexChange(idx) {
    setCurrentIndex(idx);
  }

  function handleOnEnd() {
    setIsStarted(false);
  }

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative">
      <RevealOnScroll>
        <div className="text-center z-10 px-4">
          <div className="mb-8">
            <TextRotator
              ref={rotatorRef}
              groups={groups}
              defaultLetterDelay={50}
              defaultDisplayDuration={1500}
              transitionDuration={450}
              onIndexChange={handleOnIndexChange}
              onEnd={handleOnEnd}
            />
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={handleStart}
              disabled={isStarted}
              className={`px-4 py-2 rounded-md text-white font-semibold transition ${isStarted ? 'opacity-50 cursor-not-allowed bg-gray-500' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {isStarted ? 'Em execução...' : 'Iniciar sequência'}
            </button>

            <div className="text-sm text-gray-400 select-none">
              Texto atual: {currentIndex + 1} / {groups.length}
            </div>
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
};

export default Home;
