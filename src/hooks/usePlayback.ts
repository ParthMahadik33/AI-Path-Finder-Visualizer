import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/appStore';
import confetti from 'canvas-confetti';

export function usePlayback() {
  const searchStatus = useAppStore((s) => s.searchStatus);
  const playbackSpeed = useAppStore((s) => s.playbackSpeed);
  const trace = useAppStore((s) => s.trace);
  const currentStepIndex = useAppStore((s) => s.currentStepIndex);
  const finalPath = useAppStore((s) => s.finalPath);
  const pathCost = useAppStore((s) => s.pathCost);
  const applyStep = useAppStore((s) => s.applyStep);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (searchStatus !== 'searching') {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (currentStepIndex >= trace.length) {
      // Completed all steps in trace
      const isPathFound = finalPath.length > 0;
      useAppStore.setState({
        searchStatus: isPathFound ? 'completed' : 'no_path',
        pathLength: isPathFound ? Math.max(0, finalPath.length - 1) : 0,
        pathCost: isPathFound ? pathCost : 0
      });

      if (isPathFound) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#F0442D', '#22C55E', '#3B82F6']
        });
      }
      return;
    }

    // Determine batch size and delay based on speed setting
    let batchSize = 1;
    let delayMs = 30;

    switch (playbackSpeed) {
      case 'slow':
        batchSize = 1;
        delayMs = 60;
        break;
      case 'normal':
        batchSize = 2;
        delayMs = 20;
        break;
      case 'fast':
        batchSize = 8;
        delayMs = 10;
        break;
      case 'instant':
        batchSize = trace.length;
        delayMs = 0;
        break;
    }

    const runBatch = () => {
      const endIndex = Math.min(trace.length, currentStepIndex + batchSize);
      let lastEvent = trace[currentStepIndex];

      for (let i = currentStepIndex; i < endIndex; i++) {
        const ev = trace[i];
        applyStep(ev);
        lastEvent = ev;
      }

      const isFinished = endIndex >= trace.length;

      // Update explored / discovered metrics in real-time as steps progress
      let exploredCount = 0;
      const discoveredSet = new Set<string>();

      for (let i = 0; i < endIndex; i++) {
        const ev = trace[i];
        discoveredSet.add(`${ev.coord.r},${ev.coord.c}`);
        if (ev.type === 'EXPLORE') {
          exploredCount++;
        }
      }

      useAppStore.setState({
        currentStepIndex: endIndex,
        currentInspectEvent: lastEvent,
        nodesExplored: exploredCount,
        nodesDiscovered: discoveredSet.size,
        searchStatus: isFinished
          ? (finalPath.length > 0 ? 'completed' : 'no_path')
          : 'searching'
      });

      if (isFinished && finalPath.length > 0) {
        useAppStore.setState({
          pathLength: Math.max(0, finalPath.length - 1),
          pathCost: pathCost
        });
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#F0442D', '#22C55E', '#3B82F6']
        });
      }
    };

    timerRef.current = window.setTimeout(runBatch, delayMs);

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [searchStatus, currentStepIndex, playbackSpeed, trace, applyStep, finalPath, pathCost]);
}
