"use client";

import React, { useState, useEffect, useRef } from "react";
import { Deck } from "@deck.gl/core";
import { ArcLayer, ScatterplotLayer } from "@deck.gl/layers";
import { OrthographicView } from "@deck.gl/core";
import { Bot, Network } from "lucide-react";

/**
 * AgentSwarmNetwork.tsx
 * Using low-level Deck instance to fix WebGL device/resize-observer crashes in React/Next.js.
 */

const DATA = {
  nodes: [
    { id: "core", position: [0, 0, 0], color: [0, 240, 255] as [number, number, number], size: 20 },
    { id: "agent_1", position: [-200, 150, 0], color: [0, 240, 255] as [number, number, number], size: 10 },
    { id: "agent_2", position: [200, 150, 0], color: [0, 240, 255] as [number, number, number], size: 10 },
    { id: "agent_3", position: [-150, -200, 0], color: [0, 240, 255] as [number, number, number], size: 10 },
    { id: "agent_4", position: [150, -200, 0], color: [0, 240, 255] as [number, number, number], size: 10 },
    { id: "task_1", position: [-300, 0, 0], color: [255, 255, 255] as [number, number, number], size: 5 },
    { id: "task_2", position: [300, 0, 0], color: [255, 255, 255] as [number, number, number], size: 5 },
  ],
  links: [
    { source: [0, 0, 0] as [number, number, number], target: [-200, 150, 0] as [number, number, number] },
    { source: [0, 0, 0] as [number, number, number], target: [200, 150, 0] as [number, number, number] },
    { source: [0, 0, 0] as [number, number, number], target: [-150, -200, 0] as [number, number, number] },
    { source: [0, 0, 0] as [number, number, number], target: [150, -200, 0] as [number, number, number] },
    { source: [-200, 150, 0] as [number, number, number], target: [200, 150, 0] as [number, number, number] },
    { source: [-150, -200, 0] as [number, number, number], target: [150, -200, 0] as [number, number, number] },
    { source: [-200, 150, 0] as [number, number, number], target: [-300, 0, 0] as [number, number, number] },
    { source: [200, 150, 0] as [number, number, number], target: [300, 0, 0] as [number, number, number] },
  ]
};

export default function AgentSwarmNetwork() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const deckRef = useRef<any>(null);
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    // Small delay to ensure browser layout is stable
    const timer = setTimeout(() => {
      if (!canvasRef.current || deckRef.current) return;

      deckRef.current = new Deck({
        canvas: canvasRef.current,
        width: "100%",
        height: "100%",
        initialViewState: {
          target: [0, 0, 0],
          zoom: 1,
          minZoom: 0.5,
          maxZoom: 3
        } as any,
        views: [new OrthographicView()],
        controller: true,
        layers: []
      });
    }, 100);

    const interval = setInterval(() => {
      setTime(t => (t + 0.05) % 1);
    }, 50);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      if (deckRef.current) {
        deckRef.current.finalize();
        deckRef.current = null;
      }
    };
  }, []);

  // Update layers when time changes
  useEffect(() => {
    if (deckRef.current) {
      const layers = [
        new ScatterplotLayer({
          id: "swarm-nodes",
          data: DATA.nodes,
          pickable: true,
          opacity: 0.8,
          stroked: true,
          filled: true,
          radiusScale: 1,
          radiusMinPixels: 2,
          radiusMaxPixels: 100,
          lineWidthMinPixels: 1,
          getPosition: d => d.position,
          getRadius: d => d.size * (1 + Math.sin(time * 10) * 0.1),
          getFillColor: d => [...d.color, 180] as [number, number, number, number],
          getLineColor: [0, 240, 255, 255] as [number, number, number, number],
        }),
        new ArcLayer({
          id: "swarm-arcs",
          data: DATA.links,
          getSourcePosition: d => d.source,
          getTargetPosition: d => d.target,
          getSourceColor: [0, 240, 255, 255] as [number, number, number, number],
          getTargetColor: [255, 255, 255, 100] as [number, number, number, number],
          getWidth: 2,
          opacity: 0.4,
        })
      ];
      deckRef.current.setProps({ layers });
    }
  }, [time]);

  return (
    <div ref={containerRef} className="w-full h-[500px] relative bg-black/40 backdrop-blur-md rounded-3xl border border-cyan-500/20 overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.05)]">
      {/* HUD Info */}
      <div className="absolute top-6 right-6 z-10 text-right bg-black/50 p-4 border border-cyan-500/10 rounded-xl backdrop-blur-lg pointer-events-none">
         <h3 className="text-[#00f0ff] font-heading font-black text-lg tracking-widest uppercase flex items-center justify-end gap-3 drop-shadow-[0_0_10px_#00f0ff]">
            <Network className="w-5 h-5 text-white" />
            AgentOS Swarm in Action
         </h3>
         <p className="text-cyan-600 font-mono text-[10px] uppercase tracking-widest mt-2 max-w-[200px]">
            Real-time multi-agent coordination with 0% vendor lock-in • Deployed across any infrastructure
         </p>
      </div>

      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
