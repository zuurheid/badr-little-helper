import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { HeaderBlock, ListBlock, TextBlock } from "../TextBlocks";
import Article from "../Article";
import s from "../Report.module.scss";
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
  let [
    customDepartment,
    setCustomDepartment,
  ] = useState<departmentsDataElement | null>();

  const createChart = () => {
    if (topDepartments.length === 0) {
      throw new Error("passed data set is empty");
    }
    // TODO: share this code with other charts
    const width = 1000;
    const height = 700;
    const margin = { top: 20, right: 20, bottom: 60, left: 80 };
    const svg = d3
      .select(`#${divID}`)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`);
    let maxCount = topDepartments.reduce((maxCount, c) => {
      if (c.count > maxCount) {
        return c.count;
      }
      return maxCount;
    }, -1);
    const roundToMultiplier = 50;
    const x = d3
      .scaleLinear()
      .domain([0, Math.ceil(maxCount / roundToMultiplier) * roundToMultiplier])
      .range([margin.left, width - margin.right]);
    const y = d3
      .scaleBand()
      .domain(topDepartments.map((d) => d.idx))
      .rangeRound([margin.top, height - margin.bottom])
      .paddingInner(0.6);

    svg
      .append("g")
      .attr("fill", "#3f51b5")
      .selectAll("rect")
      .data(topDepartments)
      .join("rect")
      .attr("x", margin.left)
      .attr("y", (d) => y(d.idx) as any)
      .attr("height", y.bandwidth())
      .attr("width", (d) => x(d.count) - margin.left);

    svg
      .append("g")
      .attr("class", s.axis)
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(null));

    svg
      .append("g")
      .attr("class", s.axis)
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y).ticks(null));

    const barValuePadding = 5;

    svg
      .append("g")
      .selectAll("text")
      .data(topDepartments)
      .enter()
      .append("text")
      .attr("class", s.barValue)
      .text((d) => d.count)
      .attr("x", (d) => x(d.count) + barValuePadding)
      .attr("y", (d) => (y(d.idx) as any) + margin.top);

    svg
      .append("text")
      .attr("class", s.axisLabel)
      .attr("id", "y-axis-label")
      .attr("transform", "rotate(-90)")
      .attr("y", margin.left / 4 + 10)
      .attr("x", 0 - height / 2)
      .style("text-anchor", "middle")
      .text("Départements");

    svg
      .append("text")
      .attr("class", s.axisLabel)
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

  useEffect(() => {
    console.log("customDepartment changed: ", customDepartment);
  }, [customDepartment]);

  return (
    <>
      <DepartmentsChartTitle elementsCount={topDepartments.length} />
      <div className={s.container} id={divID} />
      <DepartmentSelector departments={rest} />
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
}

const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({
  departments,
}) => {
  let [
    customDepartment,
    setCustomDepartment,
  ] = useState<departmentsDataElement | null>(null);

  const handleChange = (e: any) => {
    console.log(e.target.value);
    const customDeptFiltered = departments.filter(
      (d) => d.idx === e.target.value
    );
    const newCustomDept =
      customDeptFiltered.length === 1 ? customDeptFiltered[0] : null;
    console.log(newCustomDept);
    setCustomDepartment(newCustomDept);
  };

  const emptyElement = "None";

  return (
    <div>
      <span>Choose: </span>
      <FormControl variant="outlined">
        <Select
          value={customDepartment == null ? emptyElement : customDepartment.idx}
          onChange={handleChange}
        >
          <MenuItem value={emptyElement}>
            <em>{emptyElement}</em>
          </MenuItem>
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
