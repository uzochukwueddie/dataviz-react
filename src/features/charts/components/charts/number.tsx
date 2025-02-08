import { FC, ReactElement, useEffect, useRef } from 'react';

type INumberCanvas = { number: number; width?: number; height?: number };

const NumberCanvas: FC<INumberCanvas> = ({ number, width = 300, height = 150 }): ReactElement => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawNumber = (): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const numberValue = number.toFixed(4);
    const displayNumber = number % 1 !== 0 ? parseFloat(numberValue) : parseInt(numberValue);

    // Clear the canvas
    ctx?.clearRect(0, 0, width, height);

    // Setup text properties
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'black';

    // Calculate font size
    const calculateFontSize = () => {
      let fontSize = Math.min(width, height) * 0.8;
      ctx.font = `bold ${fontSize}px Arial`;

      while (ctx.measureText(`${displayNumber}`).width > width * 0.9 || fontSize > height * 0.8) {
        fontSize *= 0.9;
        ctx.font = `bold ${fontSize}px Arial`;
      }

      return fontSize;
    };

    const fontSize = calculateFontSize();
    ctx.font = `bold ${fontSize}px Arial`;

    // Draw the number
    ctx.fillText(`${displayNumber}`, width / 2, height / 2);
  };

  useEffect(() => {
    drawNumber();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [number, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} />;
};

export default NumberCanvas;
