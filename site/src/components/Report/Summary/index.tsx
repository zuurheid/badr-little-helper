import React from "react";
import { DecreesStats } from "../../../engine/engine";
import Article from "../Article";
import { ListBlock, TextBlock } from "../TextBlocks";
import { useTranslation } from "react-i18next";

interface SummaryProps {
  stats: DecreesStats;
}

const Summary: React.FC<SummaryProps> = ({ stats }) => {
  const { t } = useTranslation();
  const getDecreeName = (title: { date: Date | null; number: string }) => {
    if (title.date === null) {
      return `${title.number}`;
    }
    let date = new Intl.DateTimeFormat("fr-FR").format(title.date);
    return `${title.number} ${t("report.summary.datePreposition")} ${date}`;
  };

  let decreesTitles = stats.decrees.map((d) => ({
    date: d.date,
    number: d.number,
    entriesCount: d.naturalizationsCount,
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
        title={t("report.summary.header")}
        body={[
          <TextBlock
            text={t("report.summary.text", {
              decreeName: getDecreeName(decreesTitles[0]),
              naturalisedCount: decreesTitles[0].entriesCount,
            })}
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

export default Summary;
