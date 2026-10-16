import { useEffect, useState } from "react";

interface CounterProps {
  target: number;
  suffix?: string;
}

function Counter({ target, suffix = "" }: CounterProps) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let v = 0;
    const step = Math.ceil(target / 60);

    const t = setInterval(() => {
      v += step;

      if (v >= target) {
        setVal(target);
        clearInterval(t);
      } else {
        setVal(v);
      }
    }, 24);

    return () => clearInterval(t);
  }, [target]);

  return (
    <span>
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

export default Counter;