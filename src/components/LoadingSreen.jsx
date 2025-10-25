import { useEffect, useState } from "react";

export const LoadingScreen = ({ onComplete }) => {
  const [text, setText] = useState("");
  const fullText = "...";

  useEffect(() => {
    let mounted = true;
    let count = 0;

    const dotsInterval = setInterval(() => {
      count = (count % 3) + 1; 
      if (mounted) setText(fullText.substring(0, count));
    }, 1000); 

    const minTimeout = setTimeout(() => {
      clearInterval(dotsInterval);

      if (!mounted) return;
      setText(fullText);
      if (typeof onComplete === "function") onComplete();
    }, 3000); 

    return () => {
      mounted = false;
      clearInterval(dotsInterval);
      clearTimeout(minTimeout);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-black text-gray-100 flex flex-col items-center justify-center">
      <div className="mb-4 text-4xl font-mono font-bold bg-white bg-clip-text text-transparent leading-right uppercase">
        carregando{text}
        <span className="animate-blink ml-1">|</span>
      </div>
      <div className="w-[200px] h-[2px] bg-gray-800 rounded relative overflow-hidden">
        <div className="w-[40%] h-full bg-blue-500 shadow-[0_0_15px_#3b82f6] animate-loading-bar">
          {/* {""} */}
        </div>
      </div>
    </div>
  );
};
