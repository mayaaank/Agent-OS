"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

export default function CursorRobot() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const [direction, setDirection] = useState(1);
  
  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) return;

    let mousePosX = window.innerWidth / 2;
    let mousePosY = window.innerHeight / 2;
    let robotPosX = window.innerWidth / 2;
    let robotPosY = window.innerHeight / 2;
    
    let stopTimeout: NodeJS.Timeout;

    const mouseMoveHandler = (e: MouseEvent) => {
      mousePosX = e.clientX;
      mousePosY = e.clientY;
      setIsMoving(true);
      clearTimeout(stopTimeout);
      stopTimeout = setTimeout(() => setIsMoving(false), 300);
    };

    document.addEventListener("mousemove", mouseMoveHandler);

    let animationFrameId: number;
    const speed = 0.12; // Snappy follow

    const updatePosition = () => {
      // Offset position
      const targetX = mousePosX + 25;
      const targetY = mousePosY + 25;

      const diffX = targetX - robotPosX;
      const diffY = targetY - robotPosY;
      
      robotPosX += diffX * speed;
      robotPosY += diffY * speed;
      
      if (Math.abs(diffX) > 1) {
         setDirection(diffX > 0 ? 1 : -1);
      }

      setPosition({ x: robotPosX, y: robotPosY });
      animationFrameId = requestAnimationFrame(updatePosition);
    };

    updatePosition();

    return () => {
      document.removeEventListener("mousemove", mouseMoveHandler);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(stopTimeout);
    };
  }, []);

  if (position.x === 0 && position.y === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        pointerEvents: "none",
        zIndex: 9999,
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `translate(-50%, -50%) scaleX(${direction})`,
        transition: "transform 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
      }}
      className="flex flex-col items-center justify-center pointer-events-none"
    >
      <div className={`relative w-6 h-7 flex flex-col items-center transition-all ${isMoving ? 'animate-[walk_0.4s_infinite]' : 'animate-[idle_2s_ease-in-out_infinite]'}`}>
        {/* Antenna */}
        <div className="absolute -top-1 w-0.5 h-1.5 bg-cyan-400">
           <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#00f0ff] animate-pulse" />
        </div>
        
        {/* Head & Body (Cartoon Style) */}
        <div className="w-full h-5 bg-[#00f0ff] rounded-[4px] border border-black shadow-[0_0_15px_rgba(0,240,255,0.4)] relative flex items-center justify-center">
            {/* Eyes */}
            <div className="flex gap-1.5">
               <div className="w-1 h-1 bg-black rounded-full animate-[blink_3s_infinite]" />
               <div className="w-1 h-1 bg-black rounded-full animate-[blink_3s_infinite]" />
            </div>
            {/* Mouth */}
            <div className="absolute bottom-1 w-2 h-[1px] bg-black opacity-30" />
        </div>

        {/* Legs */}
        <div className="flex justify-between w-4 px-0.5 pt-[1px]">
           <div className={`w-1.5 h-1.5 bg-[#00f0ff] border border-black rounded-[1px] ${isMoving ? 'animate-[leg-L_0.4s_infinite]' : ''}`} />
           <div className={`w-1.5 h-1.5 bg-[#00f0ff] border border-black rounded-[1px] ${isMoving ? 'animate-[leg-R_0.4s_infinite_0.2s]' : ''}`} />
        </div>
      </div>

      {isMoving && <Sparkles className="absolute -top-4 text-cyan-400 size-2.5 animate-ping opacity-60" />}

      <style jsx global>{`
        @keyframes walk {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-3px) rotate(5deg); }
          75% { transform: translateY(-3px) rotate(-5deg); }
        }
        @keyframes leg-L {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes leg-R {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes idle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(0.95, 1.05); }
        }
        @keyframes blink {
          0%, 95%, 100% { transform: scaleY(1); }
          97.5% { transform: scaleY(0); }
        }
      `}</style>
    </div>
  );
}
