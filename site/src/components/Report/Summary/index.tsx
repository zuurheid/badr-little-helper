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

  const getDecreeDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR").format(date);
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
    (acc, currEl) => acc + currEl.naturalizationsCount,
    0
  );
  return (
    <Article
      title={t("report.summary.header")}
      body={[
        <TextBlock
          text={t("report.summary.text", {
            count: decreesTitles.length,
            naturalisations: t("report.summary.naturalisations", {
              count: totalNaturalisationsNumber,
            }),
            decree: t("report.summary.decree", {
              count: decreesTitles.length,
              decreeName: decreesTitles.map((t) => t.number).join(", "),
            }),
            decreeDate:
              decreesTitles.length > 1
                ? null
                : getDecreeDate(decreesTitles[0].date!),
          })}
        />,
        decreesTitles.length > 1 ? (
          <ListBlock
            elements={decreesTitles.map((d) =>
              t("report.summary.listElement", {
                naturalisations: t("report.summary.naturalisations", {
                  count: d.entriesCount,
                }),
                decreeNumber: d.number,
                decreeDate: getDecreeDate(d.date!),
              })
            )}
            type="unordered"
          />
        ) : (
          <></>
        ),
      ]}
    />
  );
};

export default Summary;
