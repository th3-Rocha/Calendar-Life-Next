import React, { useEffect, useState } from "react";

export default function AnalogClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();

  // Calculate degrees for each hand
  const secondDegrees = (seconds / 60) * 360;
  const minuteDegrees = (minutes / 60) * 360 + (seconds / 60) * 6;
  const hourDegrees = (hours / 12) * 360 + (minutes / 60) * 30;

  return (
    <div style={styles.clockContainer} title={time.toLocaleTimeString()}>
      <div style={styles.clockFace}>
        <div
          style={{
            ...styles.hand,
            ...styles.hourHand,
            transform: `rotate(${hourDegrees}deg)`,
          }}
        />
        <div
          style={{
            ...styles.hand,
            ...styles.minuteHand,
            transform: `rotate(${minuteDegrees}deg)`,
          }}
        />
        <div
          style={{
            ...styles.hand,
            ...styles.secondHand,
            transform: `rotate(${secondDegrees}deg)`,
          }}
        />
        <div style={styles.centerDot} />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  clockContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px",
    backgroundColor: "#1a1a1a",
    borderRadius: "50%",
    border: "1px solid #333",
    boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
  },
  clockFace: {
    position: "relative",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "#000",
    border: "1px solid #222",
  },
  hand: {
    position: "absolute",
    bottom: "50%",
    left: "50%",
    transformOrigin: "bottom center",
    borderRadius: "2px",
    // Smooth ticking effect for hour/minute hands
    transition: "transform 0.1s cubic-bezier(0.4, 2.08, 0.55, 0.44)",
  },
  hourHand: {
    width: "3px",
    height: "8px",
    marginLeft: "-1.5px",
    backgroundColor: "#fff",
    zIndex: 3,
  },
  minuteHand: {
    width: "2px",
    height: "12px",
    marginLeft: "-1px",
    backgroundColor: "#aaa",
    zIndex: 2,
  },
  secondHand: {
    width: "1px",
    height: "14px",
    marginLeft: "-0.5px",
    backgroundColor: "#ef4444",
    zIndex: 4,
    // Snap instantly for seconds to prevent weird rewinding at 0
    transition: "none",
  },
  centerDot: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "4px",
    height: "4px",
    marginLeft: "-2px",
    marginTop: "-2px",
    backgroundColor: "#ef4444",
    borderRadius: "50%",
    zIndex: 5,
  },
};
