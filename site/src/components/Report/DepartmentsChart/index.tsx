import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "../../Select";
import { HeaderBlock, ListBlock, TextBlock } from "../TextBlocks";
import Article from "../Article";
import s from "./DepartmentsChart.module.scss";
import sReport from "../Report.module.scss";
import { useTranslation } from "react-i18next";

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

  const margin = { top: 20, right: 20, bottom: 60, left: 80 };
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
      .range([margin.left, width - margin.right]);
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
      .rangeRound([margin.top, height - margin.bottom])
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

    const svg = d3
      .select(`#${divID}`)
      .insert("svg", ":first-child")
      .attr("class", sReport.chartSVG)
      .attr("viewBox", `0 0 ${width} ${height}`);

    svg
      .append("g")
      .attr("id", "bars-space")
      .selectAll("rect")
      .data(topDepartments)
      .join("rect")
      .attr("fill", "#3f51b5")
      .attr("x", margin.left)
      .attr("y", (d) => yScale(d.idx) as any)
      .attr("height", yScale.bandwidth())
      .attr("width", (d) => xScale(d.count) - margin.left);

    svg
      .append("g")
      .attr("id", "x-axis")
      .attr("class", sReport.axis)
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(null));

    svg
      .append("g")
      .attr("id", "y-axis")
      .attr("class", sReport.axis)
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale).ticks(null));

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
      .attr("y", (d) => (yScale(d.idx) as any) + margin.top);

    svg
      .append("text")
      .attr("class", sReport.axisLabel)
      .attr("id", "y-axis-label")
      .attr("transform", "rotate(-90)")
      .attr("y", margin.left / 4 + 10)
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
    dataSet.push({
      idx: d.idx,
      count: d.count,
      name: d.name,
    });
    const xScale = initXScale(dataSet);
    const yScale = initYScale(dataSet);
    const bars = svg.select("#bars-space").selectAll("rect").data(dataSet);

    bars
      .enter()
      .append("rect")
      .attr("fill", sReport.customBarColor)
      .merge(bars as any)
      .transition()
      .attr("x", margin.left)
      .attr("y", (d) => yScale(d.idx) as any)
      .attr("height", yScale.bandwidth())
      .attr("width", (d) => xScale(d.count) - margin.left);

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
      .attr("y", (d) => (yScale(d.idx) as any) + margin.top);
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
      .attr("x", margin.left)
      .attr("y", (d) => yScale(d.idx) as any)
      .attr("height", yScale.bandwidth())
      .attr("width", (d) => xScale(d.count) - margin.left);

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
      .attr("y", (d) => (yScale(d.idx) as any) + margin.top);
  };

  const updateChart = (customDept: departmentsDataElement | null) => {
    const svg = d3.select(`#${divID}`).select("svg");
    if (customDept === null) {
      removeFromChart(svg, topDepartments);
      return;
    }
    addToChart(svg, customDept);
  };

  useEffect(() => {
    if (customDepartment === undefined) {
      return;
    }
    updateChart(customDepartment);
  }, [customDepartment]);

  const handleCustomSelect = (d: departmentsDataElement | null) => {
    setCustomDepartment(d);
  };

  return (
    <>
      <DepartmentsChartTitle elementsCount={topDepartments.length} />
      <div className={sReport.container} id={divID}>
        <DepartmentSelector
          departments={rest}
          onCustomSelect={handleCustomSelect}
        />
      </div>
      <DepartmentsChartText data={topDepartments} />
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
}

// TODO: write logic for the dataset with a single department inside
const DepartmentsChartText: React.FC<departmentsChartTextProps> = ({
  data,
}) => {
  const { t } = useTranslation();

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
    };
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

interface DepartmentSelectorProps {
  departments: departmentsDataElement[];
  onCustomSelect: (d: departmentsDataElement | null) => void;
}

const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({
  departments,
  onCustomSelect,
}) => {
  const { t } = useTranslation();
  let [
    customDepartment,
    setCustomDepartment,
  ] = useState<departmentsDataElement | null>(null);

  const handleChange = (e: any) => {
    const customDeptFiltered = departments.filter(
      (d) => d.idx === e.target.value
    );
    const newCustomDept =
      customDeptFiltered.length === 1 ? customDeptFiltered[0] : null;
    setCustomDepartment(newCustomDept);
    onCustomSelect(newCustomDept);
  };

  const emptyElement = t("report.departments.selector.naOption");

  return (
    <div className={s.customDepartmentSelector}>
      <div className={s.customDepartmentSelectorText}>
        <TextBlock
          text={t("report.departments.selector.selectorText")}
          style="em"
        />
      </div>

      <FormControl variant="outlined" size="small">
        <Select
          autoWidth={true}
          value={customDepartment == null ? emptyElement : customDepartment.idx}
          onChange={handleChange}
        >
          <MenuItem value={emptyElement}>{emptyElement}</MenuItem>
          {departments
            .sort((a, b) => (a.idx > b.idx ? 1 : -1))
            .map((d) => (
              <MenuItem key={d.idx} value={d.idx}>
                {d.idx} ({d.name})
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </div>
  );
};
