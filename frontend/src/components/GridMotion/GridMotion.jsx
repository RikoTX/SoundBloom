import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const ROW_CONFIG = [
  { speed: 0.18, amplitude: 220, phase: 0 },
  { speed: 0.22, amplitude: 260, phase: 1.2 },
  { speed: 0.16, amplitude: 200, phase: 2.4 },
  { speed: 0.24, amplitude: 240, phase: 3.6 },
  { speed: 0.2, amplitude: 220, phase: 4.8 },
  { speed: 0.26, amplitude: 280, phase: 6.0 },
];

const GridMotion = ({
  items = [],
  gradientColor = "black",
  rows = 4,
  cols = 7,
}) => {
  const gridRef = useRef(null);
  const rowRefs = useRef([]);
  const mouseXRef = useRef(0);
  const smoothMouseRef = useRef(0);
  const startTimeRef = useRef(0);

  const totalItems = rows * cols;
  const defaultItems = Array.from(
    { length: totalItems },
    (_, index) => `Item ${index + 1}`
  );
  const combinedItems =
    items.length > 0 ? items.slice(0, totalItems) : defaultItems;

  useEffect(() => {
    mouseXRef.current = window.innerWidth / 2;
    smoothMouseRef.current = window.innerWidth / 2;
    startTimeRef.current = performance.now();
    gsap.ticker.lagSmoothing(0);

    const handleMouseMove = (e) => {
      mouseXRef.current = e.clientX;
    };

    const updateMotion = () => {
      const elapsed = (performance.now() - startTimeRef.current) / 1000;

      smoothMouseRef.current +=
        (mouseXRef.current - smoothMouseRef.current) * 0.08;
      const mouseRatio = smoothMouseRef.current / window.innerWidth - 0.5;

      rowRefs.current.forEach((row, index) => {
        if (!row) return;

        const config = ROW_CONFIG[index % ROW_CONFIG.length];
        const direction = index % 2 === 0 ? 1 : -1;

        const autoOffset =
          Math.sin(elapsed * config.speed + config.phase) *
          config.amplitude *
          direction;

        const mouseOffset = mouseRatio * 200 * direction;

        gsap.set(row, { x: autoOffset + mouseOffset });
      });
    };

    const removeAnimationLoop = gsap.ticker.add(updateMotion);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      removeAnimationLoop();
    };
  }, []);

  return (
    <div ref={gridRef} className="h-full w-full overflow-hidden">
      <section
        className="w-full h-full overflow-hidden relative flex items-center justify-center"
        style={{
          background: `radial-gradient(circle, ${gradientColor} 0%, transparent 100%)`,
        }}
      >
        <div className="absolute inset-0 pointer-events-none z-[4] bg-[length:250px]"></div>
        <div
          className="gap-3 flex-none relative w-[160vw] h-[160vh] grid grid-cols-1 rotate-[-15deg] origin-center z-[2]"
          style={{ gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}
        >
          {[...Array(rows)].map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid gap-3"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                willChange: "transform, filter",
              }}
              ref={(el) => (rowRefs.current[rowIndex] = el)}
            >
              {[...Array(cols)].map((_, itemIndex) => {
                const content = combinedItems[rowIndex * cols + itemIndex];
                return (
                  <div key={itemIndex} className="relative">
                    <div className="relative w-full h-full overflow-hidden rounded-[10px] bg-[#111] flex items-center justify-center text-white text-[1.5rem]">
                      {typeof content === "string" && content.startsWith("http") ? (
                        <div
                          className="w-full h-full bg-cover bg-center absolute top-0 left-0"
                          style={{ backgroundImage: `url(${content})` }}
                        ></div>
                      ) : typeof content === "string" &&
                        (content.includes(".png") ||
                          content.includes(".jpg") ||
                          content.includes(".jpeg") ||
                          content.includes(".webp")) ? (
                        <div
                          className="w-full h-full bg-cover bg-center absolute top-0 left-0"
                          style={{ backgroundImage: `url(${content})` }}
                        ></div>
                      ) : (
                        <div className="p-4 text-center z-[1]">{content}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="relative w-full h-full top-0 left-0 pointer-events-none"></div>
      </section>
    </div>
  );
};

export default GridMotion;
