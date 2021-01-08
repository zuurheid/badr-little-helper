import React from "react";
import { decreesStats, entryType } from "../../../engine/engine";
import Article from "../Article";
import { ListBlock, TextBlock } from "../TextBlocks";

interface SummaryProps {
  stats: decreesStats;
}

const Summary: React.FC<SummaryProps> = ({ stats }) => {
  const getDecreeName = (title: { date: Date | null; number: string }) => {
    if (title.date === null) {
      return `${title.number}`;
    }
    let date = `${title.date.getDay()} ${
      frenchMonthsNames[title.date.getMonth()]
    } ${title.date.getFullYear()}`;
    return `${title.number} de ${date}`;
  };

  let decreesTitles = stats.decrees.map((d) => ({
    date: d.date,
    number: d.number,
    entriesCount: d.entries.filter((e) => e.type !== entryType.EFF).length,
  }));

  decreesTitles.sort((a, b) => {
    let numberComparisonResult = a.number > b.number ? 1 : -1;
    if (a.date === null && b.date === null) {
      return numberComparisonResult;
    }
    if (a.date === null) {
      return -1;
    }
    if (b.date === null) {
      return 1;
    }
    return a.date > b.date ? 1 : a.date < b.date ? -1 : numberComparisonResult;
  });
  let totalNaturalisationsNumber = stats.decrees.reduce(
    (acc, currEl) => acc + currEl.entries.length,
    0
  );
  if (decreesTitles.length === 1) {
    return (
      <Article
        title="Sommaire"
        body={[
          <TextBlock
            text={`${
              decreesTitles[0].entriesCount
            } naturalisés dans le décret ${getDecreeName(decreesTitles[0])}`}
          />,
        ]}
      />
    );
  }
  return (
    <Article
      title="Sommaire"
      body={[
        <TextBlock
          text={`Nombre total de naturalisations dans les ${stats.decrees.length} décrets : ${totalNaturalisationsNumber}`}
        />,
        <ListBlock
          elements={decreesTitles.map(
            (d) =>
              `${d.entriesCount} naturalisés dans le décret ${getDecreeName(d)}`
          )}
          type="unordered"
        />,
      ]}
    />
  );
};

const frenchMonthsNames = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "julliet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

export default Summary;
