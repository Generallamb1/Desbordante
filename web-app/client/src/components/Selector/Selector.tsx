/* eslint-disable no-unsafe-optional-chaining */

import React, { useEffect, useRef, useState } from "react";
import { useSpring, animated } from "react-spring";
import { Container } from "react-bootstrap";
import styled from "styled-components";

const ResetButton = styled.button`
  transition: color 0.3s;
  position: relative;
  text-decoration: none;
  text-underline: none;
  background: none;
  border: none;

  &:focus {
    outline: none;
    box-shadow: none;
  }
`;

const Filler = styled.div`
  position: absolute;
`;

interface Props<T> {
  options: T[];
  current: T;
  onSelect: (selected: T) => void;
  label: (current: T) => string;
  variant?: "light" | "dark";
  className?: string;
}

const Selector = <T,>({
  options,
  current,
  onSelect,
  label,
  variant = "light",
  className = "",
}: Props<T>) => {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const offset = { left: 0, top: 0 };
  for (let i = 0; i < selectedIndex; i += 1) {
    offset.left += refs.current[i]?.offsetWidth || 0;
  }

  const props = useSpring({
    left: offset.left,
    top: offset.top,
    width,
    height,
    onRest: () => setIsLoaded(true),
    config: {
      duration: isLoaded ? undefined : 0,
    },
  });

  const AnimatedFiller = animated(Filler);
  const selectedClass = `bg-${
    variant === "dark" ? "dark" : "white"
  } rounded-pill shadow-sm border-2 border-${
    variant === "dark" ? "dark" : "white"
  }`;

  useEffect(() => {
    const newSelectedIndex = options.indexOf(current);
    setSelectedIndex(newSelectedIndex);
    setWidth(refs.current[newSelectedIndex]?.offsetWidth || 0);
    setHeight(refs.current[newSelectedIndex]?.offsetHeight || 0);
  }, [options, current, refs]);

  return (
    <Container
      ref={containerRef}
      className={`position-relative px-0 w-auto border border-${
        variant === "light" ? "lighter-dark" : "secondary"
      } border-2 rounded-pill ${className}`}
    >
      <AnimatedFiller className={selectedClass} style={props} />
      {options.map((option, index) => (
        <ResetButton
          ref={(node) => {
            refs.current[index] = node;
          }}
          className={`px-3 py-2 text-${
            // eslint-disable-next-line no-nested-ternary
            selectedIndex === index
              ? variant === "light"
                ? "black"
                : "white"
              : "grey"
          }
          `}
          key={label(option)}
          onClick={() => onSelect(option)}
        >
          {label(option)}
        </ResetButton>
      ))}
    </Container>
  );
};

export default Selector;
