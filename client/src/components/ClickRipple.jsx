import { useState, useEffect } from 'react';

export default function ClickRipple() {
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    const handleClick = (e) => {
      // Evitar efeito se clicar em botões ou inputs (já têm os seus próprios efeitos)
      const target = e.target;
      if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.tagName === 'INPUT' || target.closest('button') || target.closest('a')) {
        return;
      }

      const size = 150; // Tamanho base da onda
      const newRipple = {
        id: Date.now(),
        x: e.clientX - size / 2,
        y: e.clientY - size / 2,
        size
      };

      setRipples((prev) => [...prev, newRipple]);

      // Remover a onda após a animação
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 800);
    };

    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <>
      {ripples.map((r) => (
        <div
          key={r.id}
          className="ripple"
          style={{
            left: r.x,
            top: r.y,
            width: r.size,
            height: r.size
          }}
        />
      ))}
    </>
  );
}
