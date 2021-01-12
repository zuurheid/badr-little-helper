import React, { useEffect } from "react";
import * as d3 from "d3";
import { TextBlock, HeaderBlock, ListBlock } from "../TextBlocks";
import Article from "../Article";
import s from "./SeriesChart.module.scss";
import sReport from "../Report.module.scss";

export interface ministrySeriesDataElement {
  series: string;
  count: number;
}

interface seriesChartProps {
  decreesNumbers: string[];
  data: ministrySeriesDataElement[];
}

export const SeriesChart: React.FC<seriesChartProps> = ({
  data,
  decreesNumbers,
}) => {
  const divID = "series-chart";

  useEffect(() => {
    if (data.length === 0) {
      throw new Error("passed data set is empty");
    }
    const width = 1000;
    const height = 700;
    const margin = { top: 20, right: 50, bottom: 90, left: 80 };
    const svg = d3
      .select(`#${divID}`)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`);
    let maxCount = data.reduce((maxCount, c) => {
      if (c.count > maxCount) {
        return c.count;
      }
      return maxCount;
    }, -1);
    const roundToMultiplier = 50;
    const y = d3
      .scaleLinear()
      .domain([0, Math.ceil(maxCount / roundToMultiplier) * roundToMultiplier])
      .range([height - margin.bottom, margin.top]);
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.series))
      .rangeRound([margin.left, width - margin.right])
      .paddingInner(0.6);

    svg
      .append("g")
      .attr("class", `${sReport.axis} ${s.axis_x}`)
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickPadding(20))
      .selectAll("text");

    svg
      .append("g")
      .attr("class", `${sReport.axis}`)
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(null));

    svg
      .append("g")
      .attr("fill", "steelblue")
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", (d) => x(d.series) as any)
      .attr("y", (d) => y(d.count))
      .attr("height", (d) => y(0) - y(d.count))
      .attr("width", x.bandwidth());

    const colLabelPadding = 5;

    svg
      .append("g")
      .selectAll("text")
      .data(data)
      .enter()
      .append("text")
      .attr("class", sReport.barValue)
      .text((d) => d.count)
      .attr("x", (d) => x(d.series) as any)
      .attr("y", (d) => y(d.count) - colLabelPadding);

    svg
      .append("text")
      .attr("class", sReport.axisLabel)
      .attr("transform", "rotate(-90)")
      .attr("y", margin.left / 4 + 10)
      .attr("x", 0 - height / 2)
      .style("text-anchor", "middle")
      .text("Nombre de naturalisations");

    svg
      .append("text")
      .attr("class", sReport.axisLabel)
      .attr("x", width / 2)
      .attr("y", height - 10)
      .style("text-anchor", "middle")
      .text("Séries Rezé");

    svg
      .attr("border", 1)
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("height", height)
      .attr("width", width)
      .style("stroke", "black")
      .style("fill", "none")
      .style("stroke-width", 1);
  }, []);

  return (
    <>
      <SeriesChartTitle elementsCount={data.length} />
      <div className={sReport.container} id={divID} />
      <SeriesChartText data={data} decreesNumbers={decreesNumbers} />
    </>
  );
};

interface seriesChartTitleProps {
  elementsCount: number;
}

const SeriesChartTitle: React.FC<seriesChartTitleProps> = ({
  elementsCount,
}) => {
  const text = `Top ${elementsCount} des séries REZE selon le nombre de naturalisations`;
  return <HeaderBlock text={text} />;
};

interface seriesChartTextProps {
  decreesNumbers: string[];
  data: ministrySeriesDataElement[];
}

// TODO: refactor this large piece of doo-doo, add unitary tests
const SeriesChartText: React.FC<seriesChartTextProps> = ({
  decreesNumbers,
  data,
}) => {
  const getText = () => {
    let dataCopy = data.slice().sort((a, b) => (a.count > b.count ? -1 : 1));
    const entriesCount = 4;
    if (dataCopy.length >= entriesCount) {
      dataCopy = dataCopy.slice(0, entriesCount);
    }
    let dataCopyMap = dataCopy.reduce((m, currEntry) => {
      if (!m.has(currEntry.count)) {
        m.set(currEntry.count, []);
      }
      m.get(currEntry.count)!.push(currEntry.series);
      return m;
    }, new Map<number, string[]>());
    let textsToStore: string[] = [];
    dataCopyMap.forEach((series, count) => {
      const naturalisationCountStr = `${count} naturalisation${
        count > 1 ? "s" : ""
      }`;
      let seriesStr: string;
      if (series.length === 1) {
        seriesStr = `de la série ${series[0]}`;
      } else {
        seriesStr = `des séries ${series.join(", ")}`;
      }
      textsToStore.push(`${naturalisationCountStr} ${seriesStr}`);
    });
    return {
      texts: textsToStore,
      title: getTitle(decreesNumbers),
    };
  };

  const getTitle = (decreesNumbers: string[]) => {
    let decreeStrPart = decreesNumbers.length > 1 ? "les décrets" : "le décret";
    return `Séries les plus naturalisées dans ${decreeStrPart} ${decreesNumbers.join(
      ", "
    )}:`;
  };

  let { title, texts } = getText();

  return (
    <Article
      body={[
        <TextBlock text={title} />,
        <ListBlock elements={texts} type="unordered" />,
      ]}
    />
  );
};

export default SeriesChart;