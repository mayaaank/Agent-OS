"use client";

import React, { useState, useEffect, useRef } from "react";
import { Deck, _GlobeView } from "@deck.gl/core";
import { ArcLayer, ScatterplotLayer } from "@deck.gl/layers";
import { Globe } from "lucide-react";

/**
 * GlobalScalability.tsx
 * Manual Deck.gl implementation for stability in Next.js.
 */

const NODES = [
  { coord: [-122.4, 37.8] as [number, number], name: "SF" },
  { coord: [-74.0, 40.7] as [number, number], name: "NY" },
  { coord: [-0.1, 51.5] as [number, number], name: "LDN" },
  { coord: [139.7, 35.6] as [number, number], name: "TKY" },
  { coord: [151.2, -33.8] as [number, number], name: "SYD" },
  { coord: [103.8, 1.3] as [number, number], name: "SGP" },
  { coord: [-46.6, -23.5] as [number, number], name: "SP" }
];

const ARCS = [
  { source: [-122.4, 37.8] as [number, number], target: [-74.0, 40.7] as [number, number] },
  { source: [-74.0, 40.7] as [number, number], target: [-0.1, 51.5] as [number, number] },
  { source: [-0.1, 51.5] as [number, number], target: [139.7, 35.6] as [number, number] },
  { source: [-122.4, 37.8] as [number, number], target: [139.7, 35.6] as [number, number] },
  { source: [103.8, 1.3] as [number, number], target: [151.2, -33.8] as [number, number] },
  { source: [-0.1, 51.5] as [number, number], target: [-46.6, -23.5] as [number, number] }
];

const INITIAL_VIEW_STATE = {
  longitude: -30,
  latitude: 30,
  zoom: 0,
  pitch: 20
};

export default function GlobalScalability() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const deckRef = useRef<any>(null);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const timer = setTimeout(() => {
      if (!canvasRef.current || deckRef.current) return;
      
      deckRef.current = new Deck({
        canvas: canvasRef.current,
        width: "100%",
        height: "100%",
        initialViewState: INITIAL_VIEW_STATE as any,
        views: [new _GlobeView({ resolution: 2 })],
        controller: { dragRotate: true },
        layers: []
      });
    }, 100);

    let r: number;
    const animate = () => {
      setRotation(prev => prev + 0.1);
      r = requestAnimationFrame(animate);
    };
    r = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(r);
      clearTimeout(timer);
      if (deckRef.current) {
        deckRef.current.finalize();
        deckRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (deckRef.current) {
      const layers = [
        new ScatterplotLayer({
          id: "globe-nodes",
          data: NODES,
          getPosition: d => d.coord,
          getFillColor: [0, 240, 255, 200] as [number, number, number, number],
          getRadius: 150000,
          radiusMinPixels: 3,
          radiusMaxPixels: 15
        }),
        new ArcLayer({
          id: "globe-arcs",
          data: ARCS,
          getSourcePosition: d => d.source,
          getTargetPosition: d => d.target,
          getSourceColor: [0, 240, 255, 80] as [number, number, number, number],
          getTargetColor: [255, 255, 255, 200] as [number, number, number, number],
          getWidth: 2
        })
      ];
      deckRef.current.setProps({
        viewState: {
          ...INITIAL_VIEW_STATE,
          longitude: INITIAL_VIEW_STATE.longitude + rotation
        },
        layers
      });
    }
  }, [rotation]);

  return (
    <div ref={containerRef} className="w-full h-[400px] relative bg-black rounded-3xl border border-cyan-500/20 overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.02)]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.1),transparent_70%)] rounded-full blur-2xl pointer-events-none" />

      <div className="absolute top-6 left-6 z-10 text-left bg-black/40 p-5 border border-[#00f0ff]/20 rounded-2xl backdrop-blur-md pointer-events-none">
         <h3 className="text-white font-heading font-black text-xl tracking-widest uppercase flex items-center gap-3">
            <Globe className="w-5 h-5 text-[#00f0ff]" />
            AgentOS Scales Globally
         </h3>
         <div className="w-12 h-1 bg-[#00f0ff] mt-2 mb-3 shadow-[0_0_10px_#00f0ff]" />
         <p className="text-cyan-600 font-mono text-xs uppercase tracking-widest max-w-[250px] leading-relaxed">
            Deployed anywhere — architecture is entirely hardware & LLM agnostic
         </p>
      </div>

      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
