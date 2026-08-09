import { memo } from 'react';
import type { EdgeProps } from '@xyflow/react';

/**
 * Marriage line between two people sitting side-by-side, with interlocking
 * wedding rings at the midpoint so couples read clearly as couples.
 */
function SpouseEdgeComponent({ sourceX, sourceY, targetX, targetY, data }: EdgeProps) {
  const divorced = Boolean(data?.divorced);
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;
  const path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;

  const r = 5.5;
  const dx = 3.2;

  return (
    <g className={divorced ? 'spouse-edge spouse-edge--divorced' : 'spouse-edge'}>
      {/* Soft halo so the link stays readable on the dotted canvas */}
      <path
        d={path}
        fill="none"
        strokeWidth={9}
        strokeLinecap="round"
        className="spouse-edge__halo pointer-events-none"
        aria-hidden
      />
      <path
        d={path}
        fill="none"
        strokeWidth={divorced ? 2 : 2.75}
        strokeLinecap="round"
        strokeDasharray={divorced ? '3 5' : undefined}
        className="spouse-edge__line"
      />
      {/* Clear the line under the rings */}
      <circle cx={midX} cy={midY} r={11} className="spouse-edge__pad" aria-hidden />
      <g transform={`translate(${midX} ${midY}) rotate(-18)`} className="pointer-events-none" aria-hidden>
        <circle cx={-dx} cy={0} r={r} fill="none" strokeWidth={2.35} className="spouse-edge__ring" />
        <circle cx={dx} cy={0} r={r} fill="none" strokeWidth={2.35} className="spouse-edge__ring" />
        {!divorced && (
          <>
            <circle cx={-dx - 1.6} cy={-2.4} r={1.05} className="spouse-edge__shine" />
            <circle cx={dx - 1.6} cy={-2.4} r={1.05} className="spouse-edge__shine" />
          </>
        )}
      </g>
    </g>
  );
}

export const SpouseEdge = memo(SpouseEdgeComponent);
