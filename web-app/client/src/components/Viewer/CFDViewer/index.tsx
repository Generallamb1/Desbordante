import React, { useState } from "react";
import { Col, Container, Row } from "react-bootstrap";

import PieChartFull from "../FDViewer/PieChartFull/PieChartFull";
import CFDList from "./CFDList";
import TableSnippet from "../TableSnippet/TableSnippet";
import Navigation from "../Navigation";
import {
  CFDTaskResult,
  ConditionalDependency,
  Dependency,
  FDAttribute,
  SortMethod,
} from "../../../types/taskInfo";

const tabs = ["Attributes", "Dependencies", "Dataset"];
const sortMethods: SortMethod<Dependency>[] = [
  {
    name: "LHS",
    comparator: (t1, t2) => {
      const str1 = t1.lhs.join("").concat(t1.rhs);
      const str2 = t2.lhs.join("").concat(t2.rhs);
      return str1.localeCompare(str2);
    },
  },
  {
    name: "RHS",
    comparator: (t1, t2) => t1.rhs.localeCompare(t2.rhs),
  },
];

interface Props {
  result: CFDTaskResult;
}

const Index: React.FC<Props> = ({ result }) => {
  const [partShown, setPartShown] = useState(0);
  const [selectedAttributesLHS, setSelectedAttributesLHS] = useState<
    FDAttribute[]
  >([]);
  const [selectedAttributesRHS, setSelectedAttributesRHS] = useState<
    FDAttribute[]
  >([]);
  const [selectedDependency, setSelectedDependency] =
    useState<ConditionalDependency | null>(null);

  // @ts-ignore
  return (
    <Container fluid className="h-100 p-4 flex-grow-1 d-flex flex-column">
      <Navigation
        partShown={partShown}
        setPartShown={setPartShown}
        options={tabs}
      />
      {partShown === 0 && (
        <Row className="w-100 flex-grow-1 justify-content-evenly">
          <Col xl={6} className="mt-5">
            <PieChartFull
              title="Left-hand side"
              attributes={result.pieChartData.withoutPatterns.lhs}
              selectedAttributeIndices={selectedAttributesLHS}
              setSelectedAttributeIndices={setSelectedAttributesLHS}
            />
          </Col>
          <Col xl={6} className="mt-5">
            <PieChartFull
              title="Right-hand side"
              attributes={result.pieChartData.withoutPatterns.rhs}
              maxItemsSelected={1}
              selectedAttributeIndices={selectedAttributesRHS}
              setSelectedAttributeIndices={setSelectedAttributesRHS}
            />
          </Col>
        </Row>
      )}

      {partShown === 1 && (
        <CFDList
          dependencies={result.CFDs}
          sortMethods={sortMethods}
          keys={result.PKs}
          selectedAttributesLHS={selectedAttributesLHS}
          selectedAttributesRHS={selectedAttributesRHS}
          selectedDependency={selectedDependency}
          /* @ts-ignore */
          setSelectedDependency={setSelectedDependency}
        />
      )}

      {partShown === 2 && (
        <TableSnippet
          selectedColumns={
            selectedDependency
              ? selectedDependency.lhs.concat(selectedDependency.rhs)
              : []
          }
        />
      )}
    </Container>
  );
};

export default Index;
