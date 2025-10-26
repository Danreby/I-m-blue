import React, { useEffect, useRef, useState } from "react";
import { RevealOnScroll } from "../RevealOnScroll";
import TextRotator, { buildGroupsFromLyrics } from "../common/buttons/TextRotator";

export const Home = () => {
  const rotatorRef = useRef(null);
  const [isStarted, setIsStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [dateLife, setDateLife] = useState("");
  const [dateLifeAlone, setDateLifeAlone] = useState(0);
  const [displayDateLifeAloneExtense, setDisplayDateLifeAloneExtense] = useState("");

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

  const lyrics = `I'm good, yeah, I'm feelin' alright
Baby, I'ma have the best fuckin' night of my life
And wherever it takes me, I'm down for the ride
Baby, don't you know I'm good?
Yeah, I'm feelin' alright

'Cause I'm good, yeah, I'm feelin' alright
Baby, I'ma have the best fuckin' night of my life
And wherever it takes me, I'm down for the ride
Baby, don't you know I'm good?
Yeah, I'm feelin' alright

Don't you know I'm good?
Yeah, I'm feelin' alright

You know I'm down for whatever tonight
I don't need the finer things in life
No matter where I go, it's a good time, yeah
And I, I don't need to sit in VIP
Middle of the floor, that's where I'll be
Don't got a lot, but that's enough for me, yeah

'Cause I'm good, yeah, I'm feelin' alright
Baby, I'ma have the best fuckin' night of my life
And wherever it takes me, I'm down for the ride
Baby, don't you know I'm good?
Yeah, I'm feelin' alright

I'm good
Good
I'm good
Don't you know I'm good?
Yeah, I'm feelin' alright

So I just let it go, let it go
Oh, na, na, na, na, na
No, I don't care no more, care no more
Oh, na, na, na, na, na
So come on, let me know, let me know
Put your hands up, na, na, na
No, baby, nothing's gonna stop us tonight

'Cause I'm good, yeah, I'm feelin' alright
Baby, I'ma have the best fuckin' night of my life
And wherever it takes me, I'm down for the ride
Baby, don't you know I'm good?
Yeah, I'm feelin' alright`;

  const groups = buildGroupsFromLyrics(lyrics, {
    baseDisplayPerChar: 120,
    minDisplay: 300,
    defaultLetterDelay: 40,
    pauseForLineBreaks: true,
    lineBreakPause: 700,
  });

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
              defaultLetterDelay={40}
              defaultDisplayDuration={400}
              transitionDuration={350}
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
