import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import { HeaderBlock, ListBlock, TextBlock } from "../TextBlocks";
import Article from "../Article";
import sReport from "../Report.module.scss";
import { useTranslation } from "react-i18next";
import ChartSelector from "../ChartSelector";
import * as d3Utils from "../d3";

export interface departmentsDataElement {
  idx: string;
  name: string;
  count: number;
}

export interface departmentsChartProps {
  topDepartments: departmentsDataElement[];
  rest: departmentsDataElement[];
}

export const DepartmentsChart: React.FC<departmentsChartProps> = ({
  topDepartments,
  rest,
}) => {
  const { t } = useTranslation();
  const divID = "departments-chart";

  const margins = { top: 20, right: 20, bottom: 60, left: 80 };
  const width = 1000;
  const height = 700;

  const initXScale = (dataSet: departmentsDataElement[]) => {
    let maxCount = dataSet.reduce((maxCount, c) => {
      if (c.count > maxCount) {
        return c.count;
      }
      return maxCount;
    }, -1);
    const roundToMultiplier = 50;
    return d3
      .scaleLinear()
      .domain([0, Math.ceil(maxCount / roundToMultiplier) * roundToMultiplier])
      .range([margins.left, width - margins.right]);
  };
  let [xScale, setXScale] = useState(() => {
    return initXScale(topDepartments);
  });
  let [
    customDepartment,
    setCustomDepartment,
  ] = useState<departmentsDataElement | null>();

  const initYScale = (dataSet: departmentsDataElement[]) => {
    return d3
      .scaleBand()
      .domain(dataSet.map((d) => d.idx))
      .rangeRound([margins.top, height - margins.bottom])
      .paddingInner(0.6);
  };
  let [yScale, setYScale] = useState(() => {
    return initYScale(topDepartments);
  });

  const barLabelPadding = 5;

  const createChart = () => {
    if (topDepartments.length === 0) {
      throw new Error("passed data set is empty");
    }

    const svg = d3Utils.initializeBarChart({
      container: {
        selector: `#${divID}`,
        position: "first",
      },
      sizeAttributes: {
        dimensions: { height, width },
        margins,
      },
      axis: {
        x: {
          a: d3.axisBottom(xScale) /*.ticks(null)*/,
          elAttrs: {
            attrs: [
              {
                name: "id",
                value: "x-axis",
              },
            ],
          },
        },
        y: {
          a: d3.axisLeft(yScale),
          elAttrs: {
            attrs: [
              {
                name: "id",
                value: "y-axis",
              },
            ],
          },
        },
      },
      barParams: {
        data: topDepartments,
        containerAttrs: {
          attrs: [
            {
              name: "id",
              value: "bars-space",
            },
          ],
        },
        drawBarFn: (el) => {
          return el
            .attr("x", margins.left)
            .attr("y", (d) => yScale(d.idx) as any)
            .attr("height", yScale.bandwidth())
            .attr("width", (d) => xScale(d.count) - margins.left);
        },
      },
    });

    svg
      .append("g")
      .attr("id", "labels-space")
      .selectAll("text")
      .data(topDepartments)
      .enter()
      .append("text")
      .attr("class", sReport.barValue)
      .text((d) => d.count)
      .attr("x", (d) => xScale(d.count) + barLabelPadding)
      .attr("y", (d) => (yScale(d.idx) as any) + margins.top);

    svg
      .append("text")
      .attr("class", sReport.axisLabel)
      .attr("id", "y-axis-label")
      .attr("transform", "rotate(-90)")
      .attr("y", margins.left / 4 + 10)
      .attr("x", 0 - height / 2)
      .style("text-anchor", "middle")
      .text("Départements");

    svg
      .append("text")
      .attr("class", sReport.axisLabel)
      .attr("id", "x-axis-label")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .style("text-anchor", "middle")
      .text("Nombre de naturalisations");

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
      d3.select(this).text(t("report.departments.graph.yAxisLabel"));
    });
    d3.selectAll(`#${divID} #x-axis-label`).each(function () {
      d3.select(this).text(t("report.departments.graph.xAxisLabel"));
    });
  });

  const addToChart = (
    svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
    d: departmentsDataElement
  ) => {
    let dataSet = topDepartments.slice();
    dataSet.push(d);
    const xScale = initXScale(dataSet);
    const yScale = initYScale(dataSet);
    const bars = svg.select("#bars-space").selectAll("rect").data(dataSet);

    bars
      .enter()
      .append("rect")
      .attr("fill", sReport.customBarColor)
      .merge(bars as any)
      .transition()
      .attr("x", margins.left)
      .attr("y", (d) => yScale(d.idx) as any)
      .attr("height", yScale.bandwidth())
      .attr("width", (d) => xScale(d.count) - margins.left);

    const yAxis = d3.axisLeft(yScale).ticks(null);
    svg
      .select("#y-axis")
      .transition()
      .call(yAxis as any);

    const labels = svg.select("#labels-space").selectAll("text").data(dataSet);
    labels
      .enter()
      .append("text")
      .merge(labels as any)
      .transition()
      .attr("class", sReport.barValue)
      .text((d) => d.count)
      .attr("x", (d) => xScale(d.count) + barLabelPadding)
      .attr("y", (d) => (yScale(d.idx) as any) + margins.top);
  };

  const removeFromChart = (
    svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
    dataSet: departmentsDataElement[]
  ) => {
    const xScale = initXScale(dataSet);
    const yScale = initYScale(dataSet);
    const bars = svg.select("#bars-space").selectAll("rect").data(dataSet);
    const barsToRemove = (bars.exit().remove() as unknown) as d3.Selection<
      SVGRectElement,
      departmentsDataElement,
      d3.BaseType,
      unknown
    >;
    barsToRemove
      .merge(bars as any)
      .transition()
      .attr("x", margins.left)
      .attr("y", (d) => yScale(d.idx) as any)
      .attr("height", yScale.bandwidth())
      .attr("width", (d) => xScale(d.count) - margins.left);

    const yAxis = d3.axisLeft(yScale).ticks(null);
    svg
      .select("#y-axis")
      .transition()
      .call(yAxis as any);

    const labels = svg.select("#labels-space").selectAll("text").data(dataSet);
    const labelsToRemove = (labels.exit().remove() as unknown) as d3.Selection<
      SVGRectElement,
      departmentsDataElement,
      d3.BaseType,
      unknown
    >;
    labelsToRemove
      .merge(labels as any)
      .transition()
      .attr("class", sReport.barValue)
      .text((d) => d.count)
      .attr("x", (d) => xScale(d.count) + barLabelPadding)
      .attr("y", (d) => (yScale(d.idx) as any) + margins.top);
  };

  useEffect(() => {
    if (customDepartment === undefined) {
      return;
    }
    const svg = d3.select(`#${divID}`).select("svg");
    if (customDepartment === null) {
      removeFromChart(svg, topDepartments);
      return;
    }
    addToChart(svg, customDepartment);
  }, [customDepartment]);

  const handleCustomSelect = (d: departmentsDataElement | null) => {
    setCustomDepartment(d);
  };

  return (
    <>
      <DepartmentsChartTitle elementsCount={topDepartments.length} />
      <div className={sReport.container} id={divID}>
        <ChartSelector<departmentsDataElement>
          label={t("report.departments.selector.selectorText")}
          elements={rest.sort((a, b) => (a.idx > b.idx ? 1 : -1))}
          getValue={(d) => d.idx}
          onCustomSelect={handleCustomSelect}
          emptyElement={{
            value: t("report.departments.selector.naOption") as string,
            text: t("report.departments.selector.naOption") as string,
          }}
          elementToItem={(d) => ({
            key: d.idx,
            text: `${d.idx} (${d.name})`,
          })}
        />
      </div>
      <DepartmentsChartText
        data={topDepartments}
        customDepartment={customDepartment}
      />
    </>
  );
};

interface departmentsChartTitleProps {
  elementsCount: number;
}

const DepartmentsChartTitle: React.FC<departmentsChartTitleProps> = ({
  elementsCount,
}) => {
  const { t } = useTranslation();
  const text = t("report.departments.header", {
    departmentsCount: elementsCount,
  });
  return <HeaderBlock text={text} />;
};

interface departmentsChartTextProps {
  data: departmentsDataElement[];
  customDepartment: departmentsDataElement | null | undefined;
}

// TODO: write logic for the dataset with a single department inside
const DepartmentsChartText: React.FC<departmentsChartTextProps> = ({
  data,
  customDepartment,
}) => {
  const { t } = useTranslation();

  const getCustomDepartmentText = (d: departmentsDataElement) => {
    return t("report.departments.customDepartmentText", {
      naturalisedCount: t("report.departments.naturalisedCount", {
        count: d.count,
      }),
      departmentNumber: d.idx,
      departmentName: d.name,
    });
  };

  const getText = () => {
    let dataCopy = data.slice();
    const entriesCount = 4;
    if (data.length >= entriesCount) {
      dataCopy = dataCopy.slice(0, entriesCount);
    }
    let texts: string[] = [];
    dataCopy.forEach((d) => {
      texts.push(
        t("report.departments.listElement", {
          departmentNumber: d.idx,
          departmentName: d.name,
          count: d.count,
        })
      );
    });
    return {
      texts,
      title: t("report.departments.text"),
      customDepartmentText:
        customDepartment == null
          ? null
          : getCustomDepartmentText(customDepartment),
    };
  };

  let { title, texts, customDepartmentText } = getText();
  const articleBody =
    customDepartmentText != null
      ? [<TextBlock text={customDepartmentText} />]
      : [];
  articleBody.push(
    <TextBlock text={title} />,
    <ListBlock elements={texts} type="unordered" />
  );
  return <Article body={articleBody} />;
};
