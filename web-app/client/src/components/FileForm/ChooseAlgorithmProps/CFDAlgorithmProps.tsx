import React, { useContext, useEffect } from "react";

import { CFDAlgorithm } from "../../../types/types";
import Value from "../../Value/Value";
import Slider from "../../Slider/Slider";
import FormItem from "../../FormItem/FormItem";
import { AlgorithmConfigContext } from "../../AlgorithmConfigContext";
import { FileFormContext } from "../../FileFormContext";
import Selector from "../../Selector/Selector";

const CFDAlgorithmProps = () => {
  const { algorithmProps, setAlgorithmProps } = useContext(FileFormContext)!;
  const { validators, allowedValues } = useContext(AlgorithmConfigContext)!;

  const changeAlgorithm = (newAlgorithm: CFDAlgorithm) => {
    // @ts-ignore
    setAlgorithmProps((prevProps) => ({
      ...prevProps,
      algorithm: newAlgorithm,
    }));
  };

  const changeMinConfidence = (newMinConfidence: string) => {
    setAlgorithmProps((prevProps) => ({
      ...prevProps,
      minConfidence: newMinConfidence,
    }));
  };

  const changeArityConstraint = (newArityConstraint: string) => {
    setAlgorithmProps((prevProps) => ({
      ...prevProps,
      arityConstraint: newArityConstraint,
    }));
  };

  const changeMinSupport = (newMinSupport: string) => {
    setAlgorithmProps((prevProps) => ({
      ...prevProps,
      minSupportCFD: newMinSupport,
    }));
  };

  useEffect(() => {
    if (allowedValues.allowedAlgorithms?.allowedCFDAlgorithms[0]) {
      changeAlgorithm(allowedValues.allowedAlgorithms?.allowedCFDAlgorithms[0]);
    }
  }, [allowedValues]);

  const { minConfidence, arityConstraint, minSupportCFD } = algorithmProps;

  return (
    <>
      <FormItem>
        <h5 className="text-white mb-0 mx-2">Algorithm:</h5>
        <Selector
          options={allowedValues.allowedAlgorithms?.allowedCFDAlgorithms || []}
          current={
            algorithmProps.algorithm || {
              name: "",
              properties: {
                hasArityConstraint: true,
                hasConfidence: true,
                hasSupport: true,
              },
            }
          }
          onSelect={changeAlgorithm}
          label={(algo) => algo.name}
          className="mx-2"
        />
      </FormItem>
      <FormItem enabled={algorithmProps?.algorithm?.properties.hasConfidence}>
        <h5 className="text-white mb-0 mx-2">Minimum confidence:</h5>
        <Value
          value={minConfidence}
          onChange={changeMinConfidence}
          size={8}
          inputValidator={validators.isBetweenZeroAndOne}
          className="mx-2"
        />
        <Slider
          value={minConfidence}
          onChange={changeMinConfidence}
          step={1e-6}
          className="mx-2"
        />
      </FormItem>
      <FormItem
        enabled={algorithmProps?.algorithm?.properties.hasArityConstraint}
      >
        <h5 className="text-white mb-0 mx-2">Arity constraint:</h5>
        <Value
          value={arityConstraint}
          onChange={changeArityConstraint}
          size={3}
          inputValidator={validators.isInteger}
          className="mx-2"
        />
        <Slider
          value={arityConstraint}
          min={1}
          max={10}
          onChange={changeArityConstraint}
          step={1}
          className="mx-2"
        />
      </FormItem>
      <FormItem enabled={algorithmProps?.algorithm?.properties.hasSupport}>
        <h5 className="text-white mb-0 mx-2">Minimum support:</h5>
        <Value
          value={minSupportCFD}
          onChange={changeMinSupport}
          size={2}
          inputValidator={validators.isInteger}
          className="mx-2"
        />
        <Slider
          value={minSupportCFD}
          min={1}
          max={16}
          onChange={changeMinSupport}
          step={1}
          className="mx-2"
        />
      </FormItem>
    </>
  );
};

export default CFDAlgorithmProps;
