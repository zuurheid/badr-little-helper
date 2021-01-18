import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import { TextBlock, HeaderBlock, ListBlock } from "../TextBlocks";
import Article from "../Article";
import s from "./SeriesChart.module.scss";
import sReport from "../Report.module.scss";
import { useTranslation } from "react-i18next";
import ChartSelector from "../ChartSelector";
import * as d3Utils from "../d3";

export interface ministrySeriesDataElement {
  series: string;
  count: number;
}

interface seriesChartProps {
  decreesNumbers: string[];
  series: {
    topSeries: ministrySeriesDataElement[];
    rest: ministrySeriesDataElement[];
  };
}

export const SeriesChart: React.FC<seriesChartProps> = ({
  series,
  decreesNumbers,
}) => {
  const { t } = useTranslation();
  const divID = "series-chart";

  const width = 1000;
  const height = 700;
  const margin = { top: 20, right: 50, bottom: 90, left: 80 };

  let [
    customSeries,
    setCustomSeries,
  ] = useState<ministrySeriesDataElement | null>();

  const barLabelPadding = 5;

  const initXScale = (data: ministrySeriesDataElement[]) => {
    return d3
      .scaleBand()
      .domain(data.map((d) => d.series))
      .rangeRound([margin.left, width - margin.right])
      .paddingInner(0.6);
  };

  const initYScale = (data: ministrySeriesDataElement[]) => {
    let maxCount = data.reduce((maxCount, c) => {
      if (c.count > maxCount) {
        return c.count;
      }
      return maxCount;
    }, -1);
    const roundToMultiplier = 50;
    return d3
      .scaleLinear()
      .domain([0, Math.ceil(maxCount / roundToMultiplier) * roundToMultiplier])
      .range([height - margin.bottom, margin.top]);
  };

  const createChart = () => {
    if (series.topSeries.length === 0) {
      throw new Error("passed data set is empty");
    }

    const svg = d3Utils.createSVG({
      containerSelector: `#${divID}`,
      dimensions: { height, width },
      position: "first",
    });
    const y = initYScale(series.topSeries);
    const x = initXScale(series.topSeries);

    svg
      .append("g")
      .attr("id", "x-axis")
      .attr("class", `${sReport.axis} ${s.axis_x}`)
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickPadding(20))
      .selectAll("text");

    svg
      .append("g")
      .attr("id", "y-axis")
      .attr("class", `${sReport.axis}`)
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(null));

    svg
      .append("g")
      .attr("id", "bars-space")
      .selectAll("rect")
      .data(series.topSeries)
      .join("rect")
      .attr("class", sReport.bar)
      .attr("x", (d) => x(d.series) as any)
      .attr("y", (d) => y(d.count))
      .attr("height", (d) => y(0) - y(d.count))
      .attr("width", x.bandwidth());

    svg
      .append("g")
      .attr("id", "labels-space")
      .selectAll("text")
      .data(series.topSeries)
      .enter()
      .append("text")
      .attr("class", sReport.barValue)
      .text((d) => d.count)
      .attr("x", (d) => x(d.series) as any)
      .attr("y", (d) => y(d.count) - barLabelPadding);

    svg
      .append("text")
      .attr("class", sReport.axisLabel)
      .attr("id", "y-axis-label")
      .attr("transform", "rotate(-90)")
      .attr("y", margin.left / 4 + 10)
      .attr("x", 0 - height / 2)
      .style("text-anchor", "middle")
      .text(t("report.series.graph.yAxisLabel"));

    svg
      .append("text")
      .attr("class", sReport.axisLabel)
      .attr("id", "x-axis-label")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .style("text-anchor", "middle")
      .text(t("report.series.graph.xAxisLabel"));

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
  };

  useEffect(() => {
    createChart();
  }, []);

  useEffect(() => {
    d3.selectAll(`#${divID} #y-axis-label`).each(function () {
      d3.select(this).text(t("report.series.graph.yAxisLabel"));
    });
    d3.selectAll(`#${divID} #x-axis-label`).each(function () {
      d3.select(this).text(t("report.series.graph.xAxisLabel"));
    });
  });

  const addToChart = (
    svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
    s: ministrySeriesDataElement
  ) => {
    let dataSet = series.topSeries.slice();
    dataSet.push(s);
    dataSet = dataSet.sort((a, b) => (a.series > b.series ? 1 : -1));
    const xScale = initXScale(dataSet);
    const yScale = initYScale(dataSet);
    const bars = svg.select("#bars-space").selectAll("rect").data(dataSet);

    bars
      .enter()
      .append("rect")
      .merge(bars as any)
      .transition()
      .attr("class", (d) =>
        d.series !== s.series ? sReport.bar : sReport.customBar
      )
      .attr("x", (d) => xScale(d.series) as any)
      .attr("y", (d) => yScale(d.count))
      .attr("height", (d) => yScale(0) - yScale(d.count))
      .attr("width", xScale.bandwidth());

    const xAxis = d3.axisBottom(xScale).tickPadding(20);
    svg
      .select("#x-axis")
      .transition()
      .call(xAxis as any);

    const labels = svg.select("#labels-space").selectAll("text").data(dataSet);
    labels
      .enter()
      .append("text")
      .merge(labels as any)
      .transition()
      .attr("class", sReport.barValue)
      .text((d) => d.count)
      .attr("x", (d) => xScale(d.series) as any)
      .attr("y", (d) => yScale(d.count) - barLabelPadding);
  };

  const removeFromChart = (
    svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>
  ) => {
    const dataSet = series.topSeries;
    const xScale = initXScale(dataSet);
    const yScale = initYScale(dataSet);
    const bars = svg.select("#bars-space").selectAll("rect").data(dataSet);
    const barsToRemove = (bars.exit().remove() as unknown) as d3.Selection<
      SVGRectElement,
      ministrySeriesDataElement,
      d3.BaseType,
      unknown
    >;
    barsToRemove
      .merge(bars as any)
      .transition()
      .attr("class", (d) =>
        d.series !== s.series ? sReport.bar : sReport.customBar
      )
      .attr("x", (d) => xScale(d.series) as any)
      .attr("y", (d) => yScale(d.count))
      .attr("height", (d) => yScale(0) - yScale(d.count))
      .attr("width", xScale.bandwidth());

    const xAxis = d3.axisBottom(xScale).tickPadding(20);
    svg
      .select("#x-axis")
      .transition()
      .call(xAxis as any);

    const labels = svg.select("#labels-space").selectAll("text").data(dataSet);
    const labelsToRemove = (labels.exit().remove() as unknown) as d3.Selection<
      SVGRectElement,
      ministrySeriesDataElement,
      d3.BaseType,
      unknown
    >;
    labelsToRemove
      .merge(labels as any)
      .transition()
      .attr("class", sReport.barValue)
      .text((d) => d.count)
      .attr("x", (d) => xScale(d.series) as any)
      .attr("y", (d) => yScale(d.count) - barLabelPadding);
  };

  useEffect(() => {
    if (customSeries === undefined) {
      return;
    }
    const svg = d3.select(`#${divID}`).select("svg");
    if (customSeries === null) {
      removeFromChart(svg);
      return;
    }
    addToChart(svg, customSeries);
  }, [customSeries]);

  const handleCustomSelect = (el: ministrySeriesDataElement | null) => {
    setCustomSeries(el);
  };

  return (
    <>
      <SeriesChartTitle elementsCount={series.topSeries.length} />
      <div className={sReport.container} id={divID}>
        <ChartSelector<ministrySeriesDataElement>
          label={t("report.series.selector.selectorText")}
          elements={series.rest /*.sort((a, b) => (a.idx > b.idx ? 1 : -1))*/}
          getValue={(d) => d.series}
          onCustomSelect={handleCustomSelect}
          emptyElement={{
            value: t("report.series.selector.naOption") as string,
            text: t("report.series.selector.naOption") as string,
          }}
          elementToItem={(d) => ({
            key: d.series,
            text: d.series,
          })}
        />
      </div>
      <SeriesChartText
        data={series.topSeries}
        decreesNumbers={decreesNumbers}
        customSeries={customSeries}
      />
    </>
  );
};

interface seriesChartTitleProps {
  elementsCount: number;
}

const SeriesChartTitle: React.FC<seriesChartTitleProps> = ({
  elementsCount,
}) => {
  const { t } = useTranslation();
  const text = t("report.series.header", {
    seriesCount: elementsCount,
  });
  return <HeaderBlock text={text} />;
};

interface seriesChartTextProps {
  decreesNumbers: string[];
  data: ministrySeriesDataElement[];
  customSeries: ministrySeriesDataElement | null | undefined;
}

// TODO: refactor this large piece of doo-doo, add unitary tests
const SeriesChartText: React.FC<seriesChartTextProps> = ({
  decreesNumbers,
  data,
  customSeries,
}) => {
  const { t } = useTranslation();

  const getCustomSeriesText = (s: ministrySeriesDataElement) => {
    return `${t("report.series.list.naturalisations", {
      count: s.count,
    })} ${t("report.series.list.series", {
      count: 1,
      series: s.series,
    })}`;
  };

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
      m.get(currEntry.count)!.push(currEntry.series.replace(/\s+/g, "\u00A0"));
      return m;
    }, new Map<number, string[]>());
    let textsToStore: string[] = [];
    dataCopyMap.forEach((series, count) => {
      textsToStore.push(
        `${t("report.series.list.naturalisations", {
          count,
        })} ${t("report.series.list.series", {
          count: series.length,
          series: series.join(", "),
        })}`
      );
    });
    return {
      texts: textsToStore,
      title: getTitle(decreesNumbers),
      customSeriesText:
        customSeries == null ? null : getCustomSeriesText(customSeries),
    };
  };

  const getTitle = (decreesNumbers: string[]) => {
    return `${t("report.series.text.static", {
      decrees: `${t("report.series.text.decree", {
        count: decreesNumbers.length,
      })} ${decreesNumbers.join(", ")}`,
    })}`;
  };

  let { title, texts, customSeriesText } = getText();
  const articleBody =
    customSeriesText != null ? [<TextBlock text={customSeriesText} />] : [];
  articleBody.push(
    <TextBlock text={title} />,
    <ListBlock elements={texts} type="unordered" />
  );
  return <Article body={articleBody} />;
};

export default SeriesChart;
