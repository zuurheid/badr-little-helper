import React from "react";
import { decreesStats, totalDeptStats } from "../../engine/engine";
import SeriesChart, { ministrySeriesDataElement } from "../SeriesChart";
import s from "./Report.module.scss";
import Summary from "./Summary";
import { DepartmentsChart, departmentsDataElement } from "./DepartmentsChart";

interface ReportProps {
  decreesStats: decreesStats;
}

const Report: React.FC<ReportProps> = ({ decreesStats }) => {
  const seriesData = getMinistrySeriesData(
    decreesStats.totalMinistryNumberStats
  );
  return (
    <div className={s.root}>
      <Summary stats={decreesStats} />
      <SeriesChart
        decreesNumbers={getDecreesNumbers(decreesStats)}
        data={seriesData}
      />
      <DepartmentsChart
        data={getDepartmentsData(decreesStats.totalDepartmentsStats)}
      />
    </div>
  );
};

function getDecreesNumbers(stats: decreesStats): string[] {
  return stats.decrees.map((d) => d.number);
}

function getMinistrySeriesData(
  stats: [string, number][]
): ministrySeriesDataElement[] {
  let statsCopy = stats.slice();
  const seriesStatsDataLen = 11;
  if (stats.length > seriesStatsDataLen) {
    statsCopy.sort((a, b) =>
      a[1] > b[1] ? -1 : a[1] < b[1] ? 1 : a[0] > b[0] ? -1 : 1
    );
  }
  return ministryNumberStatsToMinistrySeriesDataElements(
    statsCopy
      .slice(0, seriesStatsDataLen)
      .sort((a, b) => (a[0] > b[0] ? 1 : -1))
  );
}

function ministryNumberStatsToMinistrySeriesDataElements(
  mn: [string, number][]
): ministrySeriesDataElement[] {
  return mn.map((m) => {
    return {
      series: m[0],
      count: m[1],
    };
  });
}

function getDepartmentsData(stats: totalDeptStats[]): departmentsDataElement[] {
  let statsCopy = stats.slice();
  const departmentsDataLength = 10;
  statsCopy.sort((a, b) =>
    a.count > b.count
      ? -1
      : a.count < b.count
      ? 1
      : a.department.idx > b.department.idx
      ? -1
      : 1
  );
  return departmentsStatsToDepartmentsDataElements(
    statsCopy.slice(0, departmentsDataLength)
  );
}

function departmentsStatsToDepartmentsDataElements(
  stats: totalDeptStats[]
): departmentsDataElement[] {
  return stats.map((s) => ({
    idx: s.department.idx,
    name: s.department.name,
    count: s.count,
  }));
}

export default Report;
