// src/scenes/Scene04.tsx
// SCENE 04 — THE FIVE-PENCE WAR
// 1200 frames @ 30fps = 40s. Fully procedural. Deterministic.
// 6 sequences building to the 5-pence climax.

import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  interpolate,
  Easing,
} from 'remotion';

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────
const C = {
  BG: '#0B0F14',
  BG_EDGE: '#05080e',
  BLACK: '#080B10',
  GOLD: '#F4B544',
  TEXT: '#F3F4F1',
  TEXT2: '#A1AAB5',
  STEEL: '#536273',
  STEEL_LIGHT: '#8fb2d0',
  STEEL_MID: '#3a4a5e',
  STEEL_DARK: '#1a2534',
  RED_ACCENT: '#c84a3a',
};

const F = {
  D: '"Space Grotesk","Inter",-apple-system,sans-serif',
  B: '"Inter",-apple-system,sans-serif',
};

const TOTAL_FRAMES = 1200;

const TIMING = {
  S1: { from: 0,    dur: 210 },
  S2: { from: 210,  dur: 180 },
  S3: { from: 390,  dur: 210 },
  S4: { from: 600,  dur: 270 },
  S5: { from: 870,  dur: 180 },
  S6: { from: 1050, dur: 150 },
};

const rand = (n: number) => {
  const s = Math.sin(n * 12.9898) * 43758.5453;
  return s - Math.floor(s);
};

// ─────────────────────────────────────────────────────────────
// SHARED PRIMITIVES
// ─────────────────────────────────────────────────────────────

const Atmosphere: React.FC<{
  frame: number;
  intensity?: number;
  tint?: string;
  count?: number;
}> = ({ frame, intensity = 0.3, tint = C.GOLD, count = 55 }) => {
  const p = React.useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: rand(i * 1.1) * 1920,
        y: rand(i * 2.3) * 1080,
        size: rand(i * 3.7) * 2 + 0.5,
        speed: rand(i * 4.1) * 0.5 + 0.3,
        phase: rand(i * 5.3) * Math.PI * 2,
        opacity: rand(i * 6.7) * 0.5 + 0.15,
      })),
    [count]
  );
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {p.map((pt, i) => {
        const dx = Math.sin(frame * 0.005 * pt.speed + pt.phase) * 30;
        const dy = Math.cos(frame * 0.003 * pt.speed + pt.phase) * 20;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: pt.x + dx,
              top: pt.y + dy,
              width: pt.size,
              height: pt.size,
              borderRadius: '50%',
              backgroundColor: tint,
              opacity: pt.opacity * intensity,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Vignette: React.FC<{ intensity?: number }> = ({ intensity = 0.55 }) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,${intensity}) 100%)`,
    }}
  />
);

const Grain: React.FC<{ frame: number; opacity?: number }> = ({ frame, opacity = 0.05 }) => {
  const seed = (frame % 6) * 0.008;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        opacity,
        mixBlendMode: 'overlay',
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='${0.85 +
          seed}' numOctaves='3' seed='${frame % 3}'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.55'/></svg>")`,
      }}
    />
  );
};

const AmbientBase: React.FC<{ intensity?: number; tintWarm?: number }> = ({
  intensity = 1,
  tintWarm = 0,
}) => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse at 50% 55%, #0f1822 0%, ${C.BG} 55%, ${C.BG_EDGE} 100%)`,
        opacity: intensity,
      }}
    />
    {tintWarm > 0 && (
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '55%',
          width: 1600,
          height: 700,
          transform: 'translateX(-50%)',
          background: `radial-gradient(ellipse at center, rgba(244,181,68,${tintWarm}) 0%, transparent 60%)`,
          opacity: intensity,
        }}
      />
    )}
  </AbsoluteFill>
);

// ─────────────────────────────────────────────────────────────
// PERSPECTIVE GRID
// ─────────────────────────────────────────────────────────────
const PerspectiveGrid: React.FC<{
  frame: number;
  intensity?: number;
  vanishingY?: number;
  spacing?: number;
  showCoords?: boolean;
  tint?: string;
}> = ({
  frame,
  intensity = 1,
  vanishingY = 380,
  spacing = 110,
  showCoords = false,
  tint = C.STEEL_LIGHT,
}) => {
  const rows = 22;
  const cols = 26;
  const horizon = vanishingY;
  const speed = frame * 0.9;

  return (
    <svg
      viewBox="0 0 1920 1080"
      preserveAspectRatio="none"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity: intensity,
        pointerEvents: 'none',
      }}
    >
      <defs>
        <linearGradient id="s4gridVert" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(143,178,208,0)" />
          <stop offset="30%" stopColor="rgba(143,178,208,0.25)" />
          <stop offset="100%" stopColor="rgba(143,178,208,0.55)" />
        </linearGradient>
        <radialGradient id="s4gridGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="rgba(244,181,68,0.15)" />
          <stop offset="100%" stopColor="rgba(244,181,68,0)" />
        </radialGradient>
      </defs>

      <ellipse cx="960" cy={horizon} rx="300" ry="100" fill="url(#s4gridGlow)" />

      {Array.from({ length: cols + 1 }, (_, i) => {
        const t = i / cols;
        const xBottom = t * 1920;
        return (
          <line
            key={`v-${i}`}
            x1={960}
            y1={horizon}
            x2={xBottom}
            y2={1080}
            stroke={tint}
            strokeWidth={1}
            opacity={0.35}
          />
        );
      })}

      {Array.from({ length: rows }, (_, i) => {
        const t = i / rows;
        const z = ((t * rows + speed * 0.02) % rows) / rows;
        const eased = Math.pow(z, 1.8);
        const y = horizon + eased * (1080 - horizon);
        const op = 0.15 + Math.min(1, (y - horizon) / 300) * 0.35;
        return (
          <line
            key={`h-${i}`}
            x1={0}
            y1={y}
            x2={1920}
            y2={y}
            stroke={tint}
            strokeWidth={1}
            opacity={op}
          />
        );
      })}

      {[0.25, 0.55, 0.8].map((t, i) => {
        const z = ((t * rows + speed * 0.02) % rows) / rows;
        const eased = Math.pow(z, 1.8);
        const y = horizon + eased * (1080 - horizon);
        return (
          <line
            key={`g-${i}`}
            x1={0}
            y1={y}
            x2={1920}
            y2={y}
            stroke={C.GOLD}
            strokeWidth={1.2}
            opacity={0.3}
          />
        );
      })}

      {showCoords &&
        Array.from({ length: 8 }, (_, i) => {
          const t = ((i / 8 + frame * 0.004) % 1);
          const z = Math.pow(t, 1.5);
          const y = horizon + z * (1080 - horizon);
          const op = z * 0.6;
          return (
            <g key={`c-${i}`} opacity={op}>
              <line x1={60} y1={y} x2={110} y2={y} stroke={C.GOLD} strokeWidth={1.5} />
              <line x1={1810} y1={y} x2={1860} y2={y} stroke={C.GOLD} strokeWidth={1.5} />
              <text
                x={62}
                y={y - 5}
                fontFamily={F.B}
                fontSize="9"
                letterSpacing="2"
                fill={C.GOLD}
              >
                {`Z${Math.round((1 - z) * 100).toString().padStart(3, '0')}`}
              </text>
            </g>
          );
        }}
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────
// INDUSTRIAL SILHOUETTE
// ─────────────────────────────────────────────────────────────
const IndustrialSilhouette: React.FC<{
  variant?: 'tata' | 'csn' | 'corus';
  opacity?: number;
  rim?: number;
}> = ({ variant = 'tata', opacity = 1, rim = 0.8 }) => {
  const baseTint = C.STEEL_DARK;
  const rimColor = C.STEEL_LIGHT;

  return (
    <svg
      viewBox="0 0 900 900"
      preserveAspectRatio="xMidYMax meet"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity }}
    >
      <defs>
        <linearGradient id={`s4-${variant}-shell`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0d1620" />
          <stop offset="50%" stopColor={baseTint} />
          <stop offset="100%" stopColor="#0d1620" />
        </linearGradient>
        <linearGradient id={`s4-${variant}-ground`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a2534" />
          <stop offset="100%" stopColor="#05080e" />
        </linearGradient>
      </defs>

      <rect x="0" y="820" width="900" height="80" fill={`url(#s4-${variant}-ground)`} />

      {[180, 420, 680].map((cx, i) => (
        <g key={`ct-${i}`}>
          <path
            d={`M ${cx - 70} 820 Q ${cx - 48} 620 ${cx - 22} 460 L ${cx + 22} 460 Q ${cx + 48} 620 ${cx + 70} 820 Z`}
            fill={baseTint}
            stroke={rimColor}
            strokeWidth="1"
            strokeOpacity={0.35 * rim}
          />
          <path
            d={`M ${cx - 70} 820 Q ${cx - 48} 620 ${cx - 22} 460`}
            fill="none"
            stroke={rimColor}
            strokeWidth="2"
            strokeOpacity={rim}
          />
        </g>
      ))}

      {[80, 250, 320, 550, 620, 780].map((x, i) => {
        const h = 320 + rand(i * 7 + variant.charCodeAt(0)) * 180;
        return (
          <g key={`ch-${i}`}>
            <rect x={x} y={820 - h} width={12} height={h} fill={baseTint} />
            <rect x={x} y={820 - h} width={1.5} height={h} fill={rimColor} opacity={0.6 * rim} />
          </g>
        );
      })}

      {variant === 'tata' && (
        <g>
          <path
            d="M 400 240 L 500 240 L 520 380 L 560 540 L 560 820 L 340 820 L 340 540 L 380 380 Z"
            fill={`url(#s4-${variant}-shell)`}
            stroke={rimColor}
            strokeWidth="1"
            strokeOpacity={0.4 * rim}
          />
          <line x1="400" y1="240" x2="340" y2="820" stroke={rimColor} strokeWidth="2" strokeOpacity={rim} />
          <rect x="335" y="660" width="12" height="160" fill={baseTint} stroke={rimColor} strokeOpacity={0.3} />
          <rect x="553" y="660" width="12" height="160" fill={baseTint} stroke={rimColor} strokeOpacity={0.3} />
          <rect x="420" y="160" width="60" height="80" fill={baseTint} stroke={rimColor} strokeOpacity={0.3} />
          <line x1="420" y1="200" x2="480" y2="160" stroke={rimColor} strokeWidth="1" strokeOpacity={0.5} />
          <line x1="345" y1="540" x2="555" y2="540" stroke={rimColor} strokeWidth="1" strokeOpacity={0.35} />
          <line x1="360" y1="620" x2="540" y2="620" stroke={rimColor} strokeWidth="1" strokeOpacity={0.35} />
        </g>
      )}

      {variant === 'csn' && (
        <g>
          <path
            d="M 300 300 L 400 300 L 420 440 L 440 580 L 440 820 L 260 820 L 260 580 L 280 440 Z"
            fill={`url(#s4-${variant}-shell)`}
            stroke={rimColor}
            strokeWidth="1"
            strokeOpacity={0.4 * rim}
          />
          <line x1="300" y1="300" x2="260" y2="820" stroke={rimColor} strokeWidth="2" strokeOpacity={rim} />
          <path
            d="M 500 340 L 600 340 L 620 480 L 640 620 L 640 820 L 460 820 L 460 620 L 480 480 Z"
            fill={`url(#s4-${variant}-shell)`}
            stroke={rimColor}
            strokeWidth="1"
            strokeOpacity={0.4 * rim}
          />
          <line x1="500" y1="340" x2="460" y2="820" stroke={rimColor} strokeWidth="2" strokeOpacity={rim} />
          <rect x="400" y="540" width="100" height="12" fill={baseTint} stroke={rimColor} strokeOpacity={0.35} />
          <rect x="440" y="220" width="20" height="80" fill={baseTint} stroke={rimColor} strokeOpacity={0.35} />
        </g>
      )}

      {variant === 'corus' && (
        <g>
          <path
            d="M 380 260 L 480 260 L 500 400 L 540 560 L 540 820 L 320 820 L 320 560 L 360 400 Z"
            fill={`url(#s4-${variant}-shell)`}
            stroke={rimColor}
            strokeWidth="1"
            strokeOpacity={0.4 * rim}
          />
          <line x1="380" y1="260" x2="320" y2="820" stroke={rimColor} strokeWidth="2" strokeOpacity={rim} />
          <rect x="405" y="180" width="50" height="80" fill={baseTint} stroke={rimColor} strokeOpacity={0.3} />
          <circle cx="240" cy="700" r="55" fill={baseTint} stroke={rimColor} strokeOpacity={0.35} />
          <circle cx="640" cy="700" r="55" fill={baseTint} stroke={rimColor} strokeOpacity={0.35} />
          <line x1="240" y1="650" x2="240" y2="645" stroke={rimColor} strokeWidth="1.5" strokeOpacity={0.5} />
          <line x1="640" y1="650" x2="640" y2="645" stroke={rimColor} strokeWidth="1.5" strokeOpacity={0.5} />
        </g>
      )}
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────
// METALLIC TEXT
// ─────────────────────────────────────────────────────────────
const MetallicText: React.FC<{
  text: string;
  size: number;
  color?: string;
  weight?: number;
  letterSpacing?: string;
  style?: React.CSSProperties;
}> = ({ text, size, color = C.TEXT, weight = 700, letterSpacing = '0.02em', style }) => (
  <div
    style={{
      fontFamily: F.D,
      fontWeight: weight,
      fontSize: size,
      letterSpacing,
      color,
      lineHeight: 1,
      textShadow:
        '0 1px 0 rgba(255,255,255,0.12), 0 -1px 0 rgba(0,0,0,0.5), 0 12px 60px rgba(0,0,0,0.75)',
      ...style,
    }}
  >
    {text}
  </div>
);

// ─────────────────────────────────────────────────────────────
// S1 — 455p AGREEMENT (0–209)
// ─────────────────────────────────────────────────────────────
const Seq1Agreement: React.FC = () => {
  const frame = useCurrentFrame();

  const enter = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exit = interpolate(frame, [190, 210], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const camZ = interpolate(frame, [0, 210], [1.05, 1.0], {
    extrapolateRight: 'clamp',
  });

  const dateO = interpolate(frame, [15, 45], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const dateY = interpolate(frame, [15, 45], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const approach = interpolate(frame, [30, 90], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const leftX = interpolate(approach, [0, 1], [-100, 0]);
  const rightX = interpolate(approach, [0, 1], [100, 0]);

  const panelO = interpolate(frame, [80, 115], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const panelS = interpolate(frame, [80, 120], [0.92, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const lockFlash = interpolate(frame, [115, 118, 135], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const numO = interpolate(frame, [100, 135], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const numS = interpolate(frame, [100, 140], [0.9, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const labelO = interpolate(frame, [135, 160], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const pauseO = interpolate(frame, [160, 180], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: C.BG, overflow: 'hidden', opacity: enter * exit }}>
      <AmbientBase intensity={1} tintWarm={0.05} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${camZ})`,
          transformOrigin: '50% 60%',
        }}
      >
        <PerspectiveGrid frame={frame} intensity={0.9} vanishingY={420} showCoords />

        <div
          style={{
            position: 'absolute',
            left: 80,
            bottom: '12%',
            width: 720,
            height: 720,
            transform: `translateX(${leftX}px)`,
            opacity: 0.85,
          }}
        >
          <IndustrialSilhouette variant="tata" opacity={1} rim={0.9} />
        </div>

        <div
          style={{
            position: 'absolute',
            right: 80,
            bottom: '12%',
            width: 720,
            height: 720,
            transform: `translateX(${rightX}px)`,
            opacity: 0.85,
          }}
        >
          <IndustrialSilhouette variant="corus" opacity={1} rim={0.9} />
        </div>

        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '46%',
            transform: `translate(-50%, -50%) scale(${panelS})`,
            opacity: panelO,
            width: 900,
            height: 380,
            background:
              'linear-gradient(180deg, rgba(26,37,52,0.95) 0%, rgba(13,22,32,0.95) 100%)',
            border: `1.5px solid rgba(143,178,208,0.4)`,
            boxShadow:
              '0 40px 120px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: `linear-gradient(90deg, transparent, ${C.GOLD}, transparent)`,
            }}
          />
          {[
            { top: 14, left: 14 },
            { top: 14, right: 14 },
            { bottom: 14, left: 14 },
            { bottom: 14, right: 14 },
          ].map((t, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                ...(t.top !== undefined ? { top: t.top } : { bottom: (t as any).bottom }),
                ...(t.left !== undefined ? { left: t.left } : { right: (t as any).right }),
                width: 24,
                height: 24,
                borderTop: t.top !== undefined ? `2px solid ${C.GOLD}` : undefined,
                borderBottom: t.top === undefined ? `2px solid ${C.GOLD}` : undefined,
                borderLeft: t.left !== undefined ? `2px solid ${C.GOLD}` : undefined,
                borderRight: t.left === undefined ? `2px solid ${C.GOLD}` : undefined,
              }}
            />
          ))}

          <div
            style={{
              position: 'absolute',
              top: 40,
              left: 0,
              right: 0,
              textAlign: 'center',
              fontFamily: F.B,
              fontSize: 13,
              letterSpacing: '0.55em',
              color: C.TEXT2,
            }}
          >
            RECOMMENDED CASH OFFER
          </div>

          <div
            style={{
              position: 'absolute',
              top: '46%',
              left: 0,
              right: 0,
              textAlign: 'center',
              transform: `translateY(-50%) scale(${numS})`,
              opacity: numO,
            }}
          >
            <MetallicText
              text="455"
              size={200}
              color={C.GOLD}
              letterSpacing="-0.02em"
              style={{
                textShadow:
                  '0 0 100px rgba(244,181,68,0.45), 0 16px 60px rgba(0,0,0,0.85)',
              }}
            />
            <div
              style={{
                marginTop: -8,
                fontFamily: F.D,
                fontWeight: 600,
                fontSize: 32,
                letterSpacing: '0.35em',
                color: C.TEXT,
              }}
            >
              PENCE PER SHARE
            </div>
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: 26,
              left: 0,
              right: 0,
              textAlign: 'center',
              fontFamily: F.B,
              fontSize: 11,
              letterSpacing: '0.4em',
              color: C.STEEL_LIGHT,
              opacity: 0.8,
            }}
          >
            TATA × CORUS BOARDS
          </div>
        </div>

        <AbsoluteFill
          style={{
            background: C.GOLD,
            opacity: lockFlash * 0.35,
            mixBlendMode: 'screen',
            pointerEvents: 'none',
          }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          top: 70,
          left: '50%',
          transform: `translateX(-50%) translateY(${dateY}px)`,
          opacity: dateO,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: F.B,
            fontSize: 14,
            letterSpacing: '0.55em',
            color: C.GOLD,
            marginBottom: 12,
          }}
        >
          20 OCTOBER 2006
        </div>
        <div
          style={{
            fontFamily: F.D,
            fontWeight: 700,
            fontSize: 32,
            letterSpacing: '0.2em',
            color: C.TEXT,
            textShadow: '0 8px 40px rgba(0,0,0,0.9)',
          }}
        >
          THE RECOMMENDED OFFER
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 100,
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: pauseO * (1 - Math.max(0, (frame - 190) * 0.05)),
          textAlign: 'center',
          fontFamily: F.D,
          fontWeight: 700,
          fontSize: 42,
          letterSpacing: '0.22em',
          color: C.TEXT2,
        }}
      >
        DEAL COULD HAVE ENDED HERE.
      </div>

      <Atmosphere frame={frame} intensity={0.3} />
      <Vignette intensity={0.55} />
      <Grain frame={frame} />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────
// S2 — CSN ENTERS · TATA 500p (210–389)
// ─────────────────────────────────────────────────────────────
const Seq2Tata500: React.FC = () => {
  const frame = useCurrentFrame();

  const enter = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exit = interpolate(frame, [160, 180], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const whipX = interpolate(frame, [0, 18], [300, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const whipO = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const csnIn = interpolate(frame, [25, 75], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const tataShift = interpolate(frame, [25, 65], [0, -100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  const oldVal = interpolate(frame, [40, 70], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const newVal = interpolate(frame, [70, 105], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.2, 0.8, 0.3, 1),
  });
  const newScale = interpolate(frame, [70, 110], [0.9, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.2, 0.8, 0.3, 1),
  });
  const newY = interpolate(frame, [70, 110], [30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const barRise = interpolate(frame, [70, 130], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const labelO = interpolate(frame, [110, 145], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: C.BG, overflow: 'hidden', opacity: enter * exit }}>
      <AmbientBase intensity={1} tintWarm={0.08} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translateX(${whipX}px)`,
          opacity: whipO,
        }}
      >
        <PerspectiveGrid frame={frame} intensity={0.85} vanishingY={440} showCoords />

        <div
          style={{
            position: 'absolute',
            left: 60,
            bottom: '14%',
            width: 620,
            height: 620,
            transform: `translateX(${tataShift}px)`,
            opacity: 0.9,
          }}
        >
          <IndustrialSilhouette variant="tata" opacity={1} rim={1} />
        </div>

        <div
          style={{
            position: 'absolute',
            right: 60,
            bottom: '14%',
            width: 620,
            height: 620,
            transform: `translateX(${csnIn * 400}px)`,
            opacity: 0.9,
          }}
        >
          <IndustrialSilhouette variant="csn" opacity={1} rim={1} />
        </div>

        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '25%',
            width: 4,
            height: `${barRise * 400}px`,
            transform: 'translateX(-50%)',
            background: `linear-gradient(to top, transparent, ${C.GOLD})`,
            boxShadow: `0 0 20px ${C.GOLD}`,
            opacity: barRise,
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '42%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}
        >
          {oldVal > 0.01 && (
            <div style={{ opacity: oldVal, position: 'absolute', left: '50%', top: 0, transform: 'translateX(-50%)' }}>
              <MetallicText text="455" size={140} color={C.TEXT2} />
            </div>
          )}
          <div
            style={{
              opacity: newVal,
              transform: `translateY(${newY}px) scale(${newScale})`,
            }}
          >
            <MetallicText
              text="500"
              size={300}
              color={C.GOLD}
              letterSpacing="-0.03em"
              style={{
                textShadow:
                  '0 0 120px rgba(244,181,68,0.5), 0 20px 80px rgba(0,0,0,0.9)',
              }}
            />
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '66%',
            transform: 'translateX(-50%)',
            opacity: labelO,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: F.D,
              fontWeight: 600,
              fontSize: 38,
              letterSpacing: '0.35em',
              color: C.TEXT,
              textShadow: '0 8px 40px rgba(0,0,0,0.85)',
            }}
          >
            TATA — 500 PENCE
          </div>
          <div
            style={{
              marginTop: 10,
              fontFamily: F.B,
              fontSize: 12,
              letterSpacing: '0.4em',
              color: C.STEEL_LIGHT,
              opacity: 0.8,
            }}
          >
            INCREASED OFFER
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            right: 130,
            bottom: '30%',
            opacity: labelO,
            textAlign: 'right',
          }}
        >
          <div
            style={{
              fontFamily: F.B,
              fontSize: 12,
              letterSpacing: '0.5em',
              color: C.RED_ACCENT,
              marginBottom: 8,
            }}
          >
            NEW CHALLENGER
          </div>
          <div
            style={{
              fontFamily: F.D,
              fontWeight: 700,
              fontSize: 44,
              letterSpacing: '0.05em',
              color: C.TEXT,
              textShadow: '0 8px 40px rgba(0,0,0,0.9)',
            }}
          >
            CSN
          </div>
        </div>
      </div>

      <Atmosphere frame={frame} intensity={0.28} />
      <Vignette intensity={0.55} />
      <Grain frame={frame} />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────
// S3 — CSN 515p + Corus Recommends (390–599)
// ─────────────────────────────────────────────────────────────
const Seq3Csn515: React.FC = () => {
  const frame = useCurrentFrame();

  const enter = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exit = interpolate(frame, [190, 210], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const slam = interpolate(frame, [15, 30], [1.4, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const slamO = interpolate(frame, [15, 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const shake = frame >= 25 && frame <= 40
    ? Math.sin(frame * 1.2) * (40 - frame) * 0.15
    : 0;

  const barRise = interpolate(frame, [10, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const recBeam = interpolate(frame, [90, 140], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  const labelO = interpolate(frame, [50, 85], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const recLabelO = interpolate(frame, [120, 155], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const recLabelY = interpolate(frame, [120, 155], [16, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: C.BG, overflow: 'hidden', opacity: enter * exit }}>
      <AmbientBase intensity={1} tintWarm={0.03} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translateX(${shake}px)`,
        }}
      >
        <PerspectiveGrid frame={frame} intensity={0.9} vanishingY={420} showCoords />

        <div
          style={{
            position: 'absolute',
            left: 60,
            bottom: '14%',
            width: 620,
            height: 620,
            opacity: 0.85,
          }}
        >
          <IndustrialSilhouette variant="tata" opacity={1} rim={0.8} />
        </div>

        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '22%',
            width: 520,
            height: 520,
            transform: 'translateX(-50%)',
            opacity: 0.7,
          }}
        >
          <IndustrialSilhouette variant="corus" opacity={1} rim={0.7} />
        </div>

        <div
          style={{
            position: 'absolute',
            right: 60,
            bottom: '14%',
            width: 620,
            height: 620,
            opacity: 0.95,
          }}
        >
          <IndustrialSilhouette variant="csn" opacity={1} rim={1} />
        </div>

        <div
          style={{
            position: 'absolute',
            left: '30%',
            bottom: '22%',
            width: 4,
            height: 240,
            transform: 'translateX(-50%)',
            background: `linear-gradient(to top, transparent, ${C.STEEL_LIGHT})`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '30%',
            bottom: '22%',
            width: 4,
            height: `${barRise * 320}px`,
            background: `linear-gradient(to top, transparent, ${C.GOLD})`,
            boxShadow: `0 0 24px ${C.GOLD}`,
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '40%',
            transform: `translate(-50%, -50%) scale(${slam})`,
            opacity: slamO,
            textAlign: 'center',
          }}
        >
          <MetallicText
            text="515"
            size={320}
            color={C.GOLD}
            letterSpacing="-0.03em"
            style={{
              textShadow:
                '0 0 140px rgba(244,181,68,0.6), 0 24px 90px rgba(0,0,0,0.9)',
            }}
          />
        </div>

        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '62%',
            transform: 'translateX(-50%)',
            opacity: labelO,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: F.D,
              fontWeight: 600,
              fontSize: 38,
              letterSpacing: '0.3em',
              color: C.TEXT,
              textShadow: '0 8px 40px rgba(0,0,0,0.85)',
            }}
          >
            CSN — 515 PENCE
          </div>
          <div
            style={{
              marginTop: 10,
              fontFamily: F.B,
              fontSize: 12,
              letterSpacing: '0.4em',
              color: C.GOLD,
              opacity: 0.85,
            }}
          >
            BINDING OFFER
          </div>
        </div>

        {recBeam > 0.01 && (
          <svg
            viewBox="0 0 1920 1080"
            preserveAspectRatio="none"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          >
            <defs>
              <linearGradient id="s4recbeam" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(244,181,68,0.1)" />
                <stop offset="50%" stopColor={C.GOLD} />
                <stop offset="100%" stopColor="rgba(244,181,68,0.1)" />
              </linearGradient>
            </defs>
            <path
              d="M 960 620 Q 1200 550 1420 600"
              stroke="url(#s4recbeam)"
              strokeWidth="3"
              fill="none"
              strokeDasharray="1000"
              strokeDashoffset={1000 - 1000 * recBeam}
              opacity={recBeam}
            />
            {recBeam > 0.9 && (
              <polygon
                points="1420,590 1445,600 1420,610"
                fill={C.GOLD}
                opacity={recBeam}
              />
            )}
          </svg>
        )}
      </div>

      <div
        style={{
          position: 'absolute',
          top: 100,
          left: '50%',
          transform: `translateX(-50%) translateY(${recLabelY}px)`,
          opacity: recLabelO,
          textAlign: 'center',
          padding: '14px 32px',
          background: 'rgba(11,15,20,0.85)',
          border: `1px solid ${C.GOLD}`,
        }}
      >
        <div
          style={{
            fontFamily: F.B,
            fontSize: 11,
            letterSpacing: '0.5em',
            color: C.GOLD,
            marginBottom: 6,
          }}
        >
          CORUS BOARD
        </div>
        <div
          style={{
            fontFamily: F.D,
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: '0.28em',
            color: C.TEXT,
          }}
        >
          RECOMMENDED CSN
        </div>
      </div>

      <Atmosphere frame={frame} intensity={0.28} />
      <Vignette intensity={0.55} />
      <Grain frame={frame} />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────
// S4 — FINAL AUCTION 608 vs 603 (600–869)
// ─────────────────────────────────────────────────────────────
const Seq4FinalAuction: React.FC = () => {
  const frame = useCurrentFrame();

  const enter = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exit = interpolate(frame, [250, 270], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const trackX = interpolate(frame, [10, 90], [0, -1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  const orbit = interpolate(frame, [0, 270], [-1.5, 1.5], {
    extrapolateRight: 'clamp',
  });

  const numO = interpolate(frame, [60, 110], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const numS = interpolate(frame, [60, 120], [0.9, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const tataTagO = interpolate(frame, [110, 140], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const csnTagO = interpolate(frame, [120, 150], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const winnerGlow = interpolate(frame, [170, 210], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const winnerLabelO = interpolate(frame, [180, 215], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const gapO = interpolate(frame, [150, 180], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: C.BG, overflow: 'hidden', opacity: enter * exit }}>
      <AmbientBase intensity={1} tintWarm={0.1} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `rotate(${orbit * 0.3}deg)`,
          transformOrigin: '50% 60%',
        }}
      >
        <PerspectiveGrid frame={frame} intensity={1} vanishingY={400} spacing={100} showCoords />

        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '18%',
            width: 800,
            height: 500,
            transform: 'translateX(-50%)',
            opacity: 0.35,
          }}
        >
          <IndustrialSilhouette variant="corus" opacity={1} rim={0.5} />
        </div>

        <div
          style={{
            position: 'absolute',
            top: '22%',
            left: 0,
            right: 0,
            height: 60,
            overflow: 'hidden',
            opacity: 0.85,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              transform: `translateX(${trackX * 900}px)`,
              whiteSpace: 'nowrap',
            }}
          >
            {['OCT 2006', 'NOV 2006', 'DEC 2006', 'JAN 2007'].map((label, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: i * 320 + 30,
                  top: 0,
                  bottom: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    fontFamily: F.B,
                    fontSize: 11,
                    letterSpacing: '0.4em',
                    color: C.TEXT2,
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    marginTop: 8,
                    width: 4,
                    height: 16,
                    background: i === 3 ? C.GOLD : C.STEEL_LIGHT,
                    boxShadow: i === 3 ? `0 0 16px ${C.GOLD}` : 'none',
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            top: '12%',
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: numO,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: F.B,
              fontSize: 14,
              letterSpacing: '0.55em',
              color: C.GOLD,
              marginBottom: 10,
            }}
          >
            31 JANUARY 2007
          </div>
          <div
            style={{
              fontFamily: F.D,
              fontWeight: 700,
              fontSize: 28,
              letterSpacing: '0.22em',
              color: C.TEXT,
              textShadow: '0 8px 40px rgba(0,0,0,0.9)',
            }}
          >
            FINAL AUCTION RESULT
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            transform: 'translateY(-50%)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 120,
            opacity: numO,
          }}
        >
          <div
            style={{
              transform: `scale(${numS})`,
              textAlign: 'center',
              filter:
                winnerGlow > 0.01
                  ? `drop-shadow(0 0 ${60 * winnerGlow}px rgba(244,181,68,${0.9 * winnerGlow}))`
                  : 'none',
            }}
          >
            <div
              style={{
                fontFamily: F.B,
                fontSize: 16,
                letterSpacing: '0.5em',
                color: C.GOLD,
                marginBottom: 14,
                opacity: tataTagO,
              }}
            >
              TATA
            </div>
            <MetallicText
              text="608"
              size={340}
              color={winnerGlow > 0.01 ? C.GOLD : C.TEXT}
              letterSpacing="-0.03em"
              style={{
                textShadow:
                  '0 0 100px rgba(244,181,68,0.4), 0 20px 80px rgba(0,0,0,0.9)',
              }}
            />
            <div
              style={{
                marginTop: 8,
                fontFamily: F.D,
                fontWeight: 500,
                fontSize: 20,
                letterSpacing: '0.4em',
                color: C.TEXT2,
                opacity: tataTagO,
              }}
            >
              PENCE
            </div>
          </div>

          <div
            style={{
              opacity: gapO,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div
              style={{
                width: 1,
                height: 60,
                background: `linear-gradient(to bottom, transparent, ${C.STEEL_LIGHT}, transparent)`,
              }}
            />
            <div
              style={{
                fontFamily: F.B,
                fontSize: 11,
                letterSpacing: '0.3em',
                color: C.STEEL_LIGHT,
                opacity: 0.7,
              }}
            >
              VS
            </div>
            <div
              style={{
                width: 1,
                height: 60,
                background: `linear-gradient(to bottom, transparent, ${C.STEEL_LIGHT}, transparent)`,
              }}
            />
          </div>

          <div style={{ transform: `scale(${numS})`, textAlign: 'center', opacity: 0.75 }}>
            <div
              style={{
                fontFamily: F.B,
                fontSize: 16,
                letterSpacing: '0.5em',
                color: C.RED_ACCENT,
                marginBottom: 14,
                opacity: csnTagO,
              }}
            >
              CSN
            </div>
            <MetallicText
              text="603"
              size={340}
              color={C.TEXT}
              letterSpacing="-0.03em"
              style={{
                textShadow: '0 20px 80px rgba(0,0,0,0.9)',
              }}
            />
            <div
              style={{
                marginTop: 8,
                fontFamily: F.D,
                fontWeight: 500,
                fontSize: 20,
                letterSpacing: '0.4em',
                color: C.TEXT2,
                opacity: csnTagO,
              }}
            >
              PENCE
            </div>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '16%',
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: winnerLabelO,
            textAlign: 'center',
            padding: '12px 28px',
            border: `1px solid ${C.GOLD}`,
            background: 'rgba(11,15,20,0.8)',
          }}
        >
          <div
            style={{
              fontFamily: F.D,
              fontWeight: 700,
              fontSize: 20,
              letterSpacing: '0.35em',
              color: C.GOLD,
            }}
          >
            TATA WINS AUCTION
          </div>
        </div>
      </div>

      <Atmosphere frame={frame} intensity={0.35} tint={C.GOLD} count={70} />
      <Vignette intensity={0.55} />
      <Grain frame={frame} />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────
// S5 — FIVE PENCE (870–1049)
// ─────────────────────────────────────────────────────────────
const Seq5FivePence: React.FC = () => {
  const frame = useCurrentFrame();

  const enter = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exit = interpolate(frame, [160, 180], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const separate = interpolate(frame, [20, 70], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const sepDist = 60 + separate * 140;

  const bgDim = interpolate(frame, [20, 80], [1, 0.5], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const fiveO = interpolate(frame, [60, 100], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.2, 0.8, 0.3, 1),
  });
  const fiveS = interpolate(frame, [60, 110], [0.85, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.2, 0.8, 0.3, 1),
  });

  const sweep = interpolate(frame, [90, 145], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const sweepX = interpolate(sweep, [0, 1], [-400, 1500]);

  const eqO = interpolate(frame, [120, 155], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: C.BG, overflow: 'hidden', opacity: enter * exit }}>
      <div style={{ opacity: bgDim }}>
        <AmbientBase intensity={1} tintWarm={0.08} />
        <PerspectiveGrid frame={frame} intensity={0.4} vanishingY={420} />
      </div>

      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: fiveO * 0.35,
          display: 'flex',
          gap: sepDist * 4,
        }}
      >
        <MetallicText text="608" size={100} color={C.TEXT2} />
        <MetallicText text="603" size={100} color={C.TEXT2} />
      </div>

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            position: 'relative',
            transform: `scale(${fiveS})`,
            opacity: fiveO,
          }}
        >
          <MetallicText
            text="5"
            size={620}
            color={C.GOLD}
            letterSpacing="-0.05em"
            style={{
              textShadow:
                '0 0 200px rgba(244,181,68,0.7), 0 24px 100px rgba(0,0,0,0.95)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: 300,
              left: sweepX,
              background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)`,
              mixBlendMode: 'overlay',
              pointerEvents: 'none',
            }}
          />
        </div>
        <div
          style={{
            marginTop: 20,
            opacity: fiveO,
            fontFamily: F.D,
            fontWeight: 600,
            fontSize: 60,
            letterSpacing: '0.45em',
            color: C.TEXT,
            textShadow: '0 8px 40px rgba(0,0,0,0.9)',
          }}
        >
          PENCE
        </div>
      </AbsoluteFill>

      <div
        style={{
          position: 'absolute',
          bottom: 130,
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: eqO,
          display: 'flex',
          alignItems: 'baseline',
          gap: 40,
          fontFamily: F.D,
          fontWeight: 700,
        }}
      >
        <span style={{ fontSize: 56, color: C.TEXT, letterSpacing: '0.05em' }}>608</span>
        <span style={{ fontSize: 40, color: C.GOLD, letterSpacing: '0.1em' }}>−</span>
        <span style={{ fontSize: 56, color: C.TEXT, letterSpacing: '0.05em' }}>603</span>
        <span style={{ fontSize: 40, color: C.GOLD, letterSpacing: '0.1em' }}>=</span>
        <span style={{ fontSize: 72, color: C.GOLD, letterSpacing: '0.03em' }}>5</span>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 90,
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: fiveO,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: F.B,
            fontSize: 14,
            letterSpacing: '0.55em',
            color: C.TEXT2,
          }}
        >
          THE DIFFERENCE
        </div>
      </div>

      <Atmosphere frame={frame} intensity={0.3} tint={C.GOLD} count={70} />
      <Vignette intensity={0.6} />
      <Grain frame={frame} />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────
// S6 — FINAL CALLBACK (1050–1199)
// ─────────────────────────────────────────────────────────────
const Seq6Callback: React.FC = () => {
  const frame = useCurrentFrame();

  const enter = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const camScale = interpolate(frame, [0, 150], [1.25, 0.92], {
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  const fiveScale = interpolate(frame, [0, 80], [1.15, 0.7], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const fiveY = interpolate(frame, [0, 80], [0, -60], {
    extrapolateRight: 'clamp',
  });
  const fiveO = interpolate(frame, [0, 30], [1, 0.9], {
    extrapolateRight: 'clamp',
  });

  const bgReveal = interpolate(frame, [20, 90], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const line1O = interpolate(frame, [30, 70], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const line1Y = interpolate(frame, [30, 70], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const line2O = interpolate(frame, [70, 110], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const line2Y = interpolate(frame, [70, 110], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: C.BG, overflow: 'hidden', opacity: enter }}>
      <AmbientBase intensity={1} tintWarm={0.06} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${camScale})`,
          transformOrigin: '50% 55%',
        }}
      >
        <PerspectiveGrid frame={frame} intensity={0.7} vanishingY={420} showCoords />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: bgReveal * 0.75,
            transform: `translateY(${(1 - bgReveal) * 30}px)`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '-5%',
              bottom: '18%',
              width: 700,
              height: 700,
            }}
          >
            <IndustrialSilhouette variant="tata" opacity={1} rim={0.8} />
          </div>
          <div
            style={{
              position: 'absolute',
              right: '-5%',
              bottom: '18%',
              width: 700,
              height: 700,
            }}
          >
            <IndustrialSilhouette variant="corus" opacity={1} rim={0.8} />
          </div>
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: '22%',
              width: 500,
              height: 500,
              transform: 'translateX(-50%)',
              opacity: 0.6,
            }}
          >
            <IndustrialSilhouette variant="csn" opacity={1} rim={0.6} />
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '42%',
            transform: `translate(-50%, -50%) translateY(${fiveY}px) scale(${fiveScale})`,
            opacity: fiveO,
            textAlign: 'center',
          }}
        >
          <MetallicText
            text="5"
            size={420}
            color={C.GOLD}
            letterSpacing="-0.05em"
            style={{
              textShadow:
                '0 0 160px rgba(244,181,68,0.6), 0 24px 100px rgba(0,0,0,0.95)',
            }}
          />
          <div
            style={{
              marginTop: -30,
              fontFamily: F.D,
              fontWeight: 600,
              fontSize: 28,
              letterSpacing: '0.5em',
              color: C.TEXT,
              textShadow: '0 8px 40px rgba(0,0,0,0.9)',
            }}
          >
            PENCE
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 110,
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          width: '90%',
        }}
      >
        <div
          style={{
            fontFamily: F.D,
            fontWeight: 700,
            fontSize: 60,
            letterSpacing: '0.14em',
            color: C.TEXT,
            opacity: line1O,
            transform: `translateY(${line1Y}px)`,
            textShadow: '0 12px 60px rgba(0,0,0,0.95)',
            whiteSpace: 'nowrap',
          }}
        >
          A BILLION-POUND BATTLE.
        </div>
        <div
          style={{
            marginTop: 14,
            fontFamily: F.D,
            fontWeight: 700,
            fontSize: 60,
            letterSpacing: '0.14em',
            color: C.GOLD,
            opacity: line2O,
            transform: `translateY(${line2Y}px)`,
            textShadow: '0 12px 60px rgba(0,0,0,0.95), 0 0 80px rgba(244,181,68,0.35)',
            whiteSpace: 'nowrap',
          }}
        >
          A FIVE-PENCE DIFFERENCE.
        </div>
      </div>

      <Atmosphere frame={frame} intensity={0.3} tint={C.GOLD} />
      <Vignette intensity={0.6} />
      <Grain frame={frame} />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────
// SCENE 04 ROOT
// ─────────────────────────────────────────────────────────────
export const Scene04: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.BG, overflow: 'hidden' }}>
    <Sequence from={TIMING.S1.from} durationInFrames={TIMING.S1.dur} name="S1-Agreement455">
      <Seq1Agreement />
    </Sequence>
    <Sequence from={TIMING.S2.from} durationInFrames={TIMING.S2.dur} name="S2-Tata500">
      <Seq2Tata500 />
    </Sequence>
    <Sequence from={TIMING.S3.from} durationInFrames={TIMING.S3.dur} name="S3-Csn515">
      <Seq3Csn515 />
    </Sequence>
    <Sequence from={TIMING.S4.from} durationInFrames={TIMING.S4.dur} name="S4-FinalAuction">
      <Seq4FinalAuction />
    </Sequence>
    <Sequence from={TIMING.S5.from} durationInFrames={TIMING.S5.dur} name="S5-FivePence">
      <Seq5FivePence />
    </Sequence>
    <Sequence from={TIMING.S6.from} durationInFrames={TIMING.S6.dur} name="S6-Callback">
      <Seq6Callback />
    </Sequence>
  </AbsoluteFill>
);

export default Scene04;
export const SCENE04_DURATION_FRAMES = TOTAL_FRAMES;
export const SCENE04_FPS = 30;
