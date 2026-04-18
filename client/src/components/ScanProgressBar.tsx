import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

interface ScanStep {
  label: string;
  duration: number; // ms to complete this step
}

interface ScanProgressBarProps {
  isScanning: boolean;
  steps: ScanStep[];
  onComplete?: () => void;
}

export default function ScanProgressBar({ isScanning, steps, onComplete }: ScanProgressBarProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!isScanning) {
      // Reset when not scanning
      setCurrentStep(0);
      setProgress(0);
      setStepProgress(0);
      setCompleted(false);
      return;
    }

    // Reset on new scan start
    setCurrentStep(0);
    setProgress(0);
    setStepProgress(0);
    setCompleted(false);

    let stepIndex = 0;
    let stepTimer: ReturnType<typeof setInterval> | null = null;
    let overallProgress = 0;

    const runStep = (index: number) => {
      if (index >= steps.length) return;

      setCurrentStep(index);
      setStepProgress(0);

      const stepDuration = steps[index].duration;
      const tickInterval = 50; // update every 50ms
      const ticks = stepDuration / tickInterval;
      const progressPerTick = 100 / ticks;
      const overallPerStep = 100 / steps.length;
      const overallBase = (index / steps.length) * 100;

      let localTick = 0;

      stepTimer = setInterval(() => {
        localTick++;
        const localPct = Math.min(localTick * progressPerTick, 100);
        setStepProgress(localPct);
        overallProgress = Math.min(overallBase + (localPct / 100) * overallPerStep, 99);
        setProgress(overallProgress);

        if (localPct >= 100) {
          if (stepTimer) clearInterval(stepTimer);
          stepIndex = index + 1;
          if (stepIndex < steps.length) {
            setTimeout(() => runStep(stepIndex), 100);
          }
        }
      }, tickInterval);
    };

    runStep(0);

    return () => {
      if (stepTimer) clearInterval(stepTimer);
    };
  }, [isScanning]);

  // When scan finishes externally, snap to 100%
  useEffect(() => {
    if (!isScanning && progress > 0) {
      setProgress(100);
      setStepProgress(100);
      setCurrentStep(steps.length - 1);
      setCompleted(true);
      onComplete?.();
    }
  }, [isScanning]);

  if (!isScanning && !completed) return null;

  return (
    <div className="space-y-3 p-4 bg-[#0a0e27] border border-[#00f5ff]/20 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {completed ? (
            <CheckCircle2 className="w-4 h-4 text-[#39ff14]" />
          ) : (
            <Loader2 className="w-4 h-4 text-[#00f5ff] animate-spin" />
          )}
          <span className="text-sm font-mono font-bold text-[#00f5ff]">
            {completed ? "SCAN COMPLETE" : "SCANNING..."}
          </span>
        </div>
        <span className="text-sm font-mono text-[#39ff14] font-bold">
          {Math.round(progress)}%
        </span>
      </div>

      {/* Overall Progress Bar */}
      <div className="w-full h-2 bg-[#1a1f3a] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-100 ease-linear"
          style={{
            width: `${progress}%`,
            background: completed
              ? "linear-gradient(90deg, #39ff14, #00f5ff)"
              : "linear-gradient(90deg, #00f5ff, #b537f2)",
            boxShadow: completed
              ? "0 0 8px #39ff14"
              : "0 0 8px #00f5ff",
          }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step, idx) => {
          const isDone = idx < currentStep || completed;
          const isActive = idx === currentStep && isScanning;
          const isPending = idx > currentStep && !completed;

          return (
            <div key={idx} className="flex items-center gap-3">
              {/* Step indicator */}
              <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-[#39ff14]" />
                ) : isActive ? (
                  <Loader2 className="w-4 h-4 text-[#00f5ff] animate-spin" />
                ) : (
                  <div className="w-3 h-3 rounded-full border border-gray-600" />
                )}
              </div>

              {/* Step label + mini bar */}
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-center">
                  <span
                    className={`text-xs font-mono ${
                      isDone
                        ? "text-[#39ff14]"
                        : isActive
                          ? "text-[#00f5ff]"
                          : "text-gray-600"
                    }`}
                  >
                    {step.label}
                  </span>
                  {isActive && (
                    <span className="text-xs font-mono text-[#b537f2]">
                      {Math.round(stepProgress)}%
                    </span>
                  )}
                  {isDone && (
                    <span className="text-xs font-mono text-[#39ff14]">DONE</span>
                  )}
                </div>

                {/* Per-step mini bar */}
                {(isActive || isDone) && (
                  <div className="w-full h-1 bg-[#1a1f3a] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-100"
                      style={{
                        width: isDone ? "100%" : `${stepProgress}%`,
                        background: isDone
                          ? "#39ff14"
                          : "linear-gradient(90deg, #00f5ff, #b537f2)",
                        boxShadow: isDone ? "0 0 4px #39ff14" : "0 0 4px #00f5ff",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
