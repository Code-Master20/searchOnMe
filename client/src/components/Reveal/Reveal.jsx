import { useEffect, useRef, useState } from "react";

function Reveal({
  as: Tag = "div",
  children,
  className = "",
  delay = 0,
  distance = "28px",
  once = true,
  ...props
}) {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);

          if (once) {
            observer.disconnect();
          }

          return;
        }

        if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -12% 0px"
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [once]);

  return (
    <Tag
      ref={elementRef}
      className={`reveal ${isVisible ? "revealVisible" : ""} ${className}`.trim()}
      style={{
        "--reveal-delay": `${delay}ms`,
        "--reveal-distance": distance
      }}
      {...props}
    >
      {children}
    </Tag>
  );
}

export default Reveal;
