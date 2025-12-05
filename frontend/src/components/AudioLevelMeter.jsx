import { useEffect, useRef, useState } from 'react';

/**
 * Composant pour afficher le niveau audio en temps réel pendant l'enregistrement
 */
export default function AudioLevelMeter({ stream }) {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (!stream) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    microphone.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      
      analyser.getByteFrequencyData(dataArray);
      
      // Calculer le niveau moyen
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const normalizedLevel = average / 255;
      setLevel(normalizedLevel);

      // Dessiner sur le canvas
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.clearRect(0, 0, width, height);
      
      // Barre de niveau
      const barWidth = width * normalizedLevel;
      const gradient = ctx.createLinearGradient(0, 0, barWidth, 0);
      gradient.addColorStop(0, '#10b981'); // Vert
      gradient.addColorStop(0.7, '#f59e0b'); // Orange
      gradient.addColorStop(1, '#ef4444'); // Rouge
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, height / 2 - 10, barWidth, 20);
      
      // Ligne de référence
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      audioContext.close();
    };
  }, [stream]);

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-slate-400">Niveau audio:</span>
        <div className="flex-1 bg-slate-900 rounded-full h-2 overflow-hidden">
          <div
            className="h-full transition-all duration-100"
            style={{
              width: `${level * 100}%`,
              background: level < 0.7 
                ? 'linear-gradient(to right, #10b981, #f59e0b)' 
                : 'linear-gradient(to right, #f59e0b, #ef4444)',
            }}
          />
        </div>
        <span className="text-xs text-slate-400 w-12 text-right">
          {Math.round(level * 100)}%
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={300}
        height={40}
        className="w-full h-10 bg-slate-900 rounded border border-slate-700"
      />
    </div>
  );
}

