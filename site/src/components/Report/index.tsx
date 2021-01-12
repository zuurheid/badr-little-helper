import React from "react";
import {
  DecreesStats,
  TotalDepartments,
  TotalMinistrySeries,
} from "../../engine/engine";
import SeriesChart, { ministrySeriesDataElement } from "./SeriesChart";
import s from "./Report.module.scss";
import Summary from "./Summary";
import { DepartmentsChart, departmentsDataElement } from "./DepartmentsChart";

interface ReportProps {
  decreesStats: DecreesStats;
}

const Report: React.FC<ReportProps> = ({ decreesStats }) => {
  const seriesData = getMinistrySeriesData(
    decreesStats.totalStats.totalMinistrySeriesStats
  );
  return (
    <div className={s.root}>
      <Summary stats={decreesStats} />
      <SeriesChart
        decreesNumbers={getDecreesNumbers(decreesStats)}
        data={seriesData}
      />
      <DepartmentsChart
        data={getDepartmentsData(decreesStats.totalStats.totalDepartmentsStats)}
      />
    </div>
  );
};

function getDecreesNumbers(stats: DecreesStats): string[] {
  return stats.decrees.map((d) => d.number);
}

function getMinistrySeriesData(
  stats: TotalMinistrySeries[]
): ministrySeriesDataElement[] {
  let statsCopy = stats.slice();
  const seriesStatsDataLen = 11;
  let sortBySeriesFn = (
    a: TotalMinistrySeries,
    b: TotalMinistrySeries,
    asc: boolean = true
  ) => {
    let aYear = parseInt(a.ministrySeries.year, 10),
      bYear = parseInt(b.ministrySeries.year),
      aSeries = parseInt(a.ministrySeries.series, 10),
      bSeries = parseInt(b.ministrySeries.series);
    let result =
      aYear > bYear ? 1 : aYear < bYear ? -1 : aSeries > bSeries ? 1 : -1;
    if (!asc) {
      result *= -1;
    }
    return result;
  };
  if (stats.length > seriesStatsDataLen) {
    statsCopy.sort((a, b) =>
      a.count > b.count
        ? -1
        : a.count < b.count
        ? 1
        : sortBySeriesFn(a, b, false)
    );
  }
  return ministryNumberStatsToMinistrySeriesDataElements(
    statsCopy.slice(0, seriesStatsDataLen).sort((a, b) => sortBySeriesFn(a, b))
  );
}

function ministryNumberStatsToMinistrySeriesDataElements(
  mn: TotalMinistrySeries[]
): ministrySeriesDataElement[] {
  return mn.map((m) => {
    return {
      series: `${m.ministrySeries.year}X ${m.ministrySeries.series}`,
      count: m.count,
    };
  });
}

function getDepartmentsData(
  stats: TotalDepartments[]
): departmentsDataElement[] {
  let statsCopy = stats.slice();
  const departmentsDataLength = 10;
  statsCopy.sort((a, b) =>
    a.count > b.count
      ? -1
      : a.count < b.count
      ? 1
      : a.department.number > b.department.number
      ? 1
      : -1
  );
  return departmentsStatsToDepartmentsDataElements(
    statsCopy.slice(0, departmentsDataLength)
  );
}

function departmentsStatsToDepartmentsDataElements(
  stats: TotalDepartments[]
): departmentsDataElement[] {
  return stats.map((s) => ({
    idx: s.department.number,
    name: s.department.name,
    count: s.count,
  }));
}

export default Report;