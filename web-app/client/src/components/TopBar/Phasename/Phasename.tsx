import React, { useRef } from "react";
import clamp from "../../../functions/clamp";

import "./Phasename.scss";

interface Props {
  currentPhase: number;
  maxPhase: number;
  phaseName: string;
  progress: number;
}

const Phasename: React.FC<Props> = ({
  currentPhase,
  maxPhase,
  phaseName,
  progress,
}) => {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const message = `Phase ${currentPhase} of ${maxPhase}: ${phaseName}...`;

  const titleRef = useRef(null);
  const pointerWidth = 3 * rem;
  const titleWidth = titleRef.current
    ? parseFloat(getComputedStyle(titleRef.current!).width)
    : 0;
  const titleBorderRadius = 1 * rem;
  const margin = 1 * rem;

  const availableWidth = window.innerWidth;
  const progressFraction = progress / 100;

  const titleTransform = clamp(
    availableWidth * progressFraction - titleWidth / 2,
    margin,
    availableWidth - titleWidth - margin
  );

  const pointerTransform = clamp(
    availableWidth * progressFraction - pointerWidth / 2,
    margin + titleBorderRadius,
    availableWidth - pointerWidth - titleBorderRadius - margin
  );

  let opacity = 1;
  if (
    availableWidth * progressFraction <
    margin + titleBorderRadius + pointerWidth / 2
  ) {
    opacity =
      (availableWidth * progressFraction) /
      (margin + titleBorderRadius + pointerWidth / 2);
  }
  if (
    availableWidth * progressFraction >
    availableWidth - pointerWidth / 2 - titleBorderRadius - margin
  ) {
    opacity =
      (availableWidth * (1 - progressFraction)) /
      (pointerWidth / 2 + titleBorderRadius + margin);
  }

  return (
    <div
      className={`position-absolute flex-column mt-2 d-${
        opacity ? "flex" : "none"
      }`}
      style={{
        opacity,
      }}
    >
      <img
        src="/icons/progressbar_pointer.svg"
        alt=""
        style={{
          transform: `translateX(${pointerTransform}px)`,
          width: pointerWidth,
        }}
      />
      <div
        ref={titleRef}
        className="phase-name bg-dark text-white text-center px-5 py-3"
        style={{
          transform: `translateX(${titleTransform}px)`,
          borderRadius: titleBorderRadius,
        }}
      >
        {message}
      </div>
    </div>
  );
};

export default Phasename;
