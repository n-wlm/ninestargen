'use client';

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ColorControl } from './ColorControl';
import type { StarConfig } from '@/types/star';

interface AdvancedControlsProps {
  config: StarConfig;
  update: <K extends keyof StarConfig>(key: K, value: StarConfig[K]) => void;
}

function SliderRow({ label, value, min, max, step = 1, onChange, format }: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-gray-500 font-medium">{label}</Label>
        <span className="text-xs font-mono text-gray-400">{format ? format(value) : value}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : v)}
        className="w-full"
      />
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500 font-medium">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-9 h-5 rounded-full transition-all relative ${value ? 'bg-indigo-500' : 'bg-gray-200'}`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${
            value ? 'left-4' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}

// Which types use which advanced params
const USES_CURVE = ['9-2', '9-4', '3-triangles', '3-rhombuses', '3-squares', 'spike', 'curved-outline'];
const USES_ALT = ['alt-length'];
const USES_SPIRAL = ['spiral'];
const USES_PETAL = ['petal'];
const USES_FRACTAL = ['fractal'];
const USES_INTERLACE = ['interlace'];
const USES_FILLRULE = ['3-triangles', '3-rhombuses', '3-squares'];

export default function AdvancedControls({ config, update }: AdvancedControlsProps) {
  const t = config.starType;

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Curve */}
      {USES_CURVE.includes(t) && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2.5">Curves</h3>
          <div className="flex flex-col gap-3">
            <SliderRow
              label="Curve Intensity"
              value={config.curveIntensity}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => update('curveIntensity', v)}
              format={(v) => `${Math.round(v * 100)}%`}
            />
            <SliderRow
              label="Corner Radius"
              value={config.cornerRadius}
              min={0}
              max={50}
              onChange={(v) => update('cornerRadius', v)}
              format={(v) => `${v}px`}
            />
          </div>
          <Separator className="mt-4" />
        </section>
      )}

      {/* Fill rule for overlapping shapes */}
      {USES_FILLRULE.includes(t) && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2.5">Overlap Mode</h3>
          <div className="flex gap-2">
            {(['evenodd', 'nonzero'] as const).map((r) => (
              <button
                key={r}
                onClick={() => update('fillRule', r)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  config.fillRule === r
                    ? 'bg-indigo-500 text-white border-indigo-500'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300'
                }`}
              >
                {r === 'evenodd' ? 'Cut-out' : 'Filled'}
              </button>
            ))}
          </div>
          <Separator className="mt-4" />
        </section>
      )}

      {/* Alt-length */}
      {USES_ALT.includes(t) && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2.5">Alternating Points</h3>
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              {(['short-long', 'short-mid-long'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => update('altLengthPattern', p)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    config.altLengthPattern === p
                      ? 'bg-indigo-500 text-white border-indigo-500'
                      : 'bg-white text-gray-500 border-gray-200'
                  }`}
                >
                  {p === 'short-long' ? '2-step' : '3-step'}
                </button>
              ))}
            </div>
            <SliderRow
              label="Short/Long Ratio"
              value={config.altLengthRatio}
              min={0.3}
              max={0.9}
              step={0.01}
              onChange={(v) => update('altLengthRatio', v)}
              format={(v) => `${Math.round(v * 100)}%`}
            />
          </div>
          <Separator className="mt-4" />
        </section>
      )}

      {/* Spiral */}
      {USES_SPIRAL.includes(t) && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2.5">Spiral</h3>
          <SliderRow
            label="Twist per Point"
            value={config.spiralTwist}
            min={0}
            max={40}
            step={0.5}
            onChange={(v) => update('spiralTwist', v)}
            format={(v) => `${v}°`}
          />
          <Separator className="mt-4" />
        </section>
      )}

      {/* Petal */}
      {USES_PETAL.includes(t) && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2.5">Petal Shape</h3>
          <div className="flex flex-col gap-3">
            <SliderRow
              label="Petal Width"
              value={config.petalWidth}
              min={0.1}
              max={1}
              step={0.01}
              onChange={(v) => update('petalWidth', v)}
              format={(v) => `${Math.round(v * 100)}%`}
            />
            <SliderRow
              label="Petal Curve"
              value={config.petalCurve}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => update('petalCurve', v)}
              format={(v) => `${Math.round(v * 100)}%`}
            />
          </div>
          <Separator className="mt-4" />
        </section>
      )}

      {/* Fractal */}
      {USES_FRACTAL.includes(t) && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2.5">Fractal Depth</h3>
          <div className="flex gap-2">
            {[1, 2, 3].map((d) => (
              <button
                key={d}
                onClick={() => update('fractalDepth', d)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  config.fractalDepth === d
                    ? 'bg-indigo-500 text-white border-indigo-500'
                    : 'bg-white text-gray-500 border-gray-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <Separator className="mt-4" />
        </section>
      )}

      {/* Interlace gap */}
      {USES_INTERLACE.includes(t) && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2.5">Interlace</h3>
          <SliderRow
            label="Crossing Gap"
            value={config.interlaceGap}
            min={1}
            max={20}
            onChange={(v) => update('interlaceGap', v)}
            format={(v) => `${v}px`}
          />
          <Separator className="mt-4" />
        </section>
      )}

      {/* Inner polygon */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2.5">Inner Polygon</h3>
        <div className="flex flex-col gap-3">
          <Toggle
            label="Show inner 9-gon"
            value={config.showInnerPolygon}
            onChange={(v) => update('showInnerPolygon', v)}
          />
          {config.showInnerPolygon && (
            <ColorControl
              label="Inner Color"
              value={config.innerPolygonColor}
              onChange={(v) => update('innerPolygonColor', v)}
            />
          )}
        </div>
      </section>

      <Separator />

      {/* Glow */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2.5">Glow</h3>
        <div className="flex flex-col gap-3">
          <SliderRow
            label="Glow Radius"
            value={config.glowRadius}
            min={0}
            max={40}
            onChange={(v) => update('glowRadius', v)}
            format={(v) => `${v}px`}
          />
          {config.glowRadius > 0 && (
            <ColorControl
              label="Glow Color"
              value={config.glowColor}
              onChange={(v) => update('glowColor', v)}
            />
          )}
        </div>
      </section>

      <Separator />

      {/* Shadow */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2.5">Shadow</h3>
        <div className="flex flex-col gap-3">
          <SliderRow
            label="Shadow Blur"
            value={config.shadowBlur}
            min={0}
            max={40}
            onChange={(v) => update('shadowBlur', v)}
            format={(v) => `${v}px`}
          />
          {config.shadowBlur > 0 && (
            <>
              <ColorControl
                label="Shadow Color"
                value={config.shadowColor.slice(0, 7)}
                onChange={(v) => update('shadowColor', v)}
              />
              <SliderRow
                label="Offset X"
                value={config.shadowOffsetX}
                min={-20}
                max={20}
                onChange={(v) => update('shadowOffsetX', v)}
                format={(v) => `${v}px`}
              />
              <SliderRow
                label="Offset Y"
                value={config.shadowOffsetY}
                min={-20}
                max={20}
                onChange={(v) => update('shadowOffsetY', v)}
                format={(v) => `${v}px`}
              />
            </>
          )}
        </div>
      </section>
    </div>
  );
}
