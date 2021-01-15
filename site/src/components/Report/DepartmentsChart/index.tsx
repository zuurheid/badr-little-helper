import React, { useEffect } from "react";
import * as d3 from "d3";
import { HeaderBlock, ListBlock, TextBlock } from "../TextBlocks";
import Article from "../Article";
import s from "../Report.module.scss";

export interface departmentsDataElement {
  idx: string;
  name: string;
  count: number;
}

interface departmentsChartProps {
  data: departmentsDataElement[];
}

export const DepartmentsChart: React.FC<departmentsChartProps> = ({ data }) => {
  const divID = "departments-chart";

  useEffect(() => {
    if (data.length === 0) {
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
    let maxCount = data.reduce((maxCount, c) => {
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
      .domain(data.map((d) => d.idx))
      .rangeRound([margin.top, height - margin.bottom])
      .paddingInner(0.6);

    svg
      .append("g")
      .attr("fill", "steelblue")
      .selectAll("rect")
      .data(data)
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
      .data(data)
      .enter()
      .append("text")
      .attr("class", s.barValue)
      .text((d) => d.count)
      .attr("x", (d) => x(d.count) + barValuePadding)
      .attr("y", (d) => (y(d.idx) as any) + margin.top);

    svg
      .append("text")
      .attr("class", s.axisLabel)
      .attr("transform", "rotate(-90)")
      .attr("y", margin.left / 4 + 10)
      .attr("x", 0 - height / 2)
      .style("text-anchor", "middle")
      .text("Départements");

    svg
      .append("text")
      .attr("class", s.axisLabel)
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
  }, []);

  return (
    <>
      <DepartmentsChartTitle elementsCount={data.length} />
      <div className={s.container} id={divID} />
      <DepartmentsChartText data={data} />
    </>
  );
};

interface departmentsChartTitleProps {
  elementsCount: number;
}

const DepartmentsChartTitle: React.FC<departmentsChartTitleProps> = ({
  elementsCount,
}) => {
  const text = `Top ${elementsCount} des préfectures selon le nombre de naturalisations`;
  return <HeaderBlock text={text} />;
};

interface departmentsChartTextProps {
  data: departmentsDataElement[];
}

// TODO: write logic for the dataset with a single department inside
const DepartmentsChartText: React.FC<departmentsChartTextProps> = ({
  data,
}) => {
  const getText = () => {
    let dataCopy = data.slice();
    const entriesCount = 4;
    if (data.length >= entriesCount) {
      dataCopy = dataCopy.slice(0, entriesCount);
    }
    let texts: string[] = [];
    dataCopy.forEach((d) => {
      texts.push(`${d.idx} (${d.name}) avec ${d.count} naturalisations`);
    });
    return {
      texts,
      title: `Les départements où est naturalisé le plus de personnes :`,
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
