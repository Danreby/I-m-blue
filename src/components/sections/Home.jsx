import React, { useEffect, useRef, useState } from "react";
import { RevealOnScroll } from "../RevealOnScroll";
import TextRotator from "../common/buttons/TextRotator";

export const Home = () => {
  const rotatorRef = useRef(null);

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

  const groups = [
    {
      text: `'im'`,
      letterDelay: 40,
      displayDuration: 3000,
    },
    {
      text: `Sou desenvolvedor front-end com experiência em React e Inertia.`,
      letterDelay: 50,
      displayDuration: 3200,
    },
    {
      text: `Atualmente: .`,
      letterDelay: 45,
      displayDuration: 2800,
    },
    { text: "E além... 🚀", letterDelay: 30, displayDuration: 2500 },
  ];

  const handleIndexChange = (idx) => {
    // console.log('Texto atual', idx);
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative">
      <RevealOnScroll>
        <div className="text-center z-10 px-4">
          <div className="mb-8">
            <TextRotator
              ref={rotatorRef}
              groups={groups}
              defaultLetterDelay={45}
              defaultDisplayDuration={2200}
              transitionDuration={450}
              mobileBreakpoint={768}
              onIndexChange={handleIndexChange}
            />
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
};

export default Home;
