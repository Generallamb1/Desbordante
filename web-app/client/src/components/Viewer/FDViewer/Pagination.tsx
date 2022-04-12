import React, { useContext } from "react";
import Button from "../../Button/Button";
import clamp from "../../../functions/clamp";
import { TaskContext } from "../../TaskContext";

const maxOffset = 50;

interface Props {
  primitiveType: "FD" | "CFD" | "AR";
}

const Pagination: React.FC<Props> = ({ primitiveType }) => {
  const { primitiveFilter, setPrimitiveFilter } = useContext(TaskContext)!;
  const { offset: paginationOffset, limit: paginationLimit } =
      primitiveType === "FD" || primitiveType === "AR"
      ? primitiveFilter[primitiveType].pagination
      : primitiveFilter[primitiveType];

  const setOffset = (newOffset: number) =>
    setPrimitiveFilter((prev) => {
      const newFilter = { ...prev };
      if (primitiveType === "FD" || primitiveType === "AR") {
        newFilter[primitiveType].pagination.offset = clamp(newOffset, 1, maxOffset);
      } else {
        newFilter[primitiveType].offset = clamp(newOffset, 1, maxOffset);
      }
      return newFilter;
    });

  const goToPreviousPage = () => setOffset(paginationOffset - paginationLimit);
  const goToNextPage = () => setOffset(paginationOffset + paginationLimit);

  return (
    <div className="w-100 d-flex justify-content-center align-items-center">
      <Button
        onClick={goToPreviousPage}
        variant="dark"
        enabled={paginationOffset > 1}
      >
        <i className="bi bi-chevron-left" />
      </Button>
      <p className="mb-0 mx-2 fs-5">
        {paginationOffset}-{paginationOffset + paginationLimit}
      </p>
      <Button
        onClick={goToNextPage}
        variant="dark"
        enabled={paginationOffset + paginationLimit < maxOffset}
      >
        <i className="bi bi-chevron-right" />
      </Button>
    </div>
  );
};

export default Pagination;