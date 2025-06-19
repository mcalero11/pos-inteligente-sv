import { useState, useRef, useEffect } from "preact/hooks";

interface LogoProps {
  className?: string;
}

function Logo({ className = "h-8 w-8" }: LogoProps) {
  const [clickCount, setClickCount] = useState(0);
  const [isPartyMode, setIsPartyMode] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const resetTimeoutRef = useRef<any>(null);
  const partyTimeoutRef = useRef<any>(null);

  // Cleanup effect to ensure animations are reset
  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        globalThis.clearTimeout(resetTimeoutRef.current);
      }
      if (partyTimeoutRef.current) {
        globalThis.clearTimeout(partyTimeoutRef.current);
      }
    };
  }, []);

  // Ensure party mode always gets cleared after 3 seconds, even if component re-renders
  useEffect(() => {
    if (isPartyMode && !partyTimeoutRef.current) {
      // If party mode is active but no timeout is set, set one
      partyTimeoutRef.current = globalThis.setTimeout(() => {
        setIsPartyMode(false);
        setShowConfetti(false);
        setClickCount(0);
        partyTimeoutRef.current = null;
      }, 3000);
    }

    return () => {
      // Cleanup on any re-render while in party mode
      if (partyTimeoutRef.current) {
        globalThis.clearTimeout(partyTimeoutRef.current);
        partyTimeoutRef.current = null;
      }
    };
  }, [isPartyMode]);

  const handleLogoClick = (e: any) => {
    e.preventDefault();
    const newCount = clickCount + 1;
    setClickCount(newCount);

    // Clear any existing reset timeout
    if (resetTimeoutRef.current) {
      globalThis.clearTimeout(resetTimeoutRef.current);
    }

    if (newCount >= 10) {
      // Clear any existing party timeout
      if (partyTimeoutRef.current) {
        globalThis.clearTimeout(partyTimeoutRef.current);
      }

      // Trigger party mode!
      setIsPartyMode(true);
      setShowConfetti(true);

      // Reset after animation
      partyTimeoutRef.current = globalThis.setTimeout(() => {
        setIsPartyMode(false);
        setShowConfetti(false);
        setClickCount(0);
        partyTimeoutRef.current = null;
      }, 3000);
    } else {
      // Reset count if no activity for 5 seconds
      resetTimeoutRef.current = globalThis.setTimeout(() => {
        setClickCount(0);
        resetTimeoutRef.current = null;
      }, 5000);
    }
  };

  // Create confetti pieces with more variety
  const confettiPieces = Array.from({ length: 80 }, (_, i) => {
    const shapes = ["circle", "square", "triangle", "diamond", "star"];
    const sizes = [6, 8, 10, 12, 14];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const size = sizes[Math.floor(Math.random() * sizes.length)];

    return (
      <div
        key={i}
        className={`confetti-piece confetti-${shape} ${showConfetti ? "animate" : ""}`}
        style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
          backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`,
          width: `${size}px`,
          height: `${size}px`,
        }}
      />
    );
  });

  return (
    <>
      <div className="relative">
        {/* Confetti Container */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {confettiPieces}
          </div>
        )}

        {/* Logo */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 256 256"
          className={`${className} select-none transition-all duration-500 ease-out ${
            isPartyMode ? "animate-party-bounce" : "hover:scale-110"
          }`}
          onClick={handleLogoClick}
        >
          <defs>
            {/* Main gradient using theme primary color */}
            <linearGradient
              id="primaryGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                style={{ stopColor: "var(--primary)", stopOpacity: 1 }}
              />
              <stop
                offset="50%"
                style={{ stopColor: "var(--primary-hover)", stopOpacity: 1 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: "var(--primary-dark)", stopOpacity: 1 }}
              />
            </linearGradient>

            {/* Subtle background gradient */}
            <radialGradient id="backgroundGradient" cx="50%" cy="50%" r="60%">
              <stop
                offset="0%"
                style={{ stopColor: "var(--primary)", stopOpacity: 0.15 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: "var(--primary)", stopOpacity: 0.05 }}
              />
            </radialGradient>

            {/* Inner highlight gradient */}
            <linearGradient
              id="highlightGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                style={{ stopColor: "var(--primary-light)", stopOpacity: 0.9 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: "var(--primary-light)", stopOpacity: 0.7 }}
              />
            </linearGradient>
          </defs>

          {/* Background circle with subtle gradient */}
          <circle cx="128" cy="128" r="120" fill="url(#backgroundGradient)" />

          {/* Main geometric shape with enhanced gradient */}
          <path
            d="M128 32 L208 80 L208 176 L128 224 L48 176 L48 80 Z"
            fill="url(#primaryGradient)"
            stroke="var(--primary)"
            strokeWidth="3"
            style={{
              filter: "drop-shadow(0 4px 8px rgba(var(--primary-rgb), 0.3))",
            }}
          />

          {/* Inner accent with gradient */}
          <circle
            cx="128"
            cy="128"
            r="28"
            fill="url(#highlightGradient)"
            opacity="0.9"
          />

          {/* Center dot with slight glow */}
          <circle
            cx="128"
            cy="128"
            r="10"
            fill="var(--primary)"
            style={{
              filter: "drop-shadow(0 0 4px rgba(var(--primary-rgb), 0.5))",
            }}
          />

          {/* Small inner highlight for depth */}
          <circle
            cx="128"
            cy="128"
            r="4"
            fill="var(--primary-light)"
            opacity="0.8"
          />
        </svg>
      </div>

      {/* Party Mode Styles */}
      <style jsx>{`
        @keyframes party-bounce {
          0%,
          100% {
            transform: translateY(0) rotate(0deg) scale(1);
          }
          25% {
            transform: translateY(-12px) rotate(8deg) scale(1.15);
          }
          50% {
            transform: translateY(-6px) rotate(-5deg) scale(1.08);
          }
          75% {
            transform: translateY(-10px) rotate(3deg) scale(1.12);
          }
        }

        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        .animate-party-bounce {
          animation: party-bounce 1.2s ease-in-out infinite;
        }

        .confetti-piece {
          position: absolute;
          opacity: 0;
        }

        .confetti-piece.animate {
          animation: confetti-fall 3s linear forwards;
          opacity: 1;
        }

        /* Circle confetti */
        .confetti-circle {
          border-radius: 50%;
        }

        /* Square confetti (default) */
        .confetti-square {
          /* Default square shape */
        }

        /* Triangle confetti */
        .confetti-triangle {
          width: 0 !important;
          height: 0 !important;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-bottom: 10px solid;
          border-bottom-color: inherit;
          background: transparent !important;
        }

        /* Diamond confetti */
        .confetti-diamond {
          transform: rotate(45deg);
          border-radius: 2px;
        }

        /* Star confetti */
        .confetti-star {
          position: relative;
          display: inline-block;
          border-radius: 50%;
        }

        .confetti-star::before,
        .confetti-star::after {
          content: "";
          position: absolute;
          left: 50%;
          top: 50%;
          background: inherit;
          border-radius: inherit;
          transform: translate(-50%, -50%);
        }

        .confetti-star::before {
          width: 100%;
          height: 30%;
          border-radius: 2px;
        }

        .confetti-star::after {
          width: 30%;
          height: 100%;
          border-radius: 2px;
        }

        /* Add some sparkle to triangles */
        .confetti-triangle.animate {
          animation:
            confetti-fall 3s linear forwards,
            sparkle 0.5s ease-in-out infinite alternate;
        }

        @keyframes sparkle {
          0% {
            filter: brightness(1);
          }
          100% {
            filter: brightness(1.3);
          }
        }
      `}</style>
    </>
  );
}

export default Logo;
