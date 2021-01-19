import * as types from "./types";
import * as d3 from "d3";
import { createSVG, composeClasses } from "./internal";
import s from "./BarChart.module.scss";

interface BarChartParams<T, U> extends types.ChartParams {
  axis: {
    x: AxisParams<T>;
    y: AxisParams<U>;
  };
}

export function initializeBarChart<T, U>(
  params: BarChartParams<T, U>
): d3.Selection<SVGSVGElement, unknown, HTMLElement, unknown> {
  const svg = createSVG({
    ...params,
    dimensions: params.sizeAttributes.dimensions,
  });
  return createXYAxis(svg, params.sizeAttributes, params.axis);
}

interface AxisParams<T> {
  a: d3.Axis<T>;
  classes?: string[];
  attrs?: { name: string; value: string }[];
}

function createXYAxis<T, U>(
  svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, unknown>,
  sizeAttrs: types.ChartSizeAttributes,
  axis: {
    x: AxisParams<T>;
    y: AxisParams<U>;
  }
) {
  drawAxis(svg, "X", axis.x, sizeAttrs);
  drawAxis(svg, "Y", axis.y, sizeAttrs);
  return svg;
}

type axisType = "X" | "Y";

function drawAxis<T>(
  svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, unknown>,
  t: axisType,
  params: AxisParams<T>,
  sizeAttrs: types.ChartSizeAttributes
): d3.Selection<SVGGElement, unknown, HTMLElement, unknown> {
  const axis = svg
    .append("g")
    .attr("class", composeClasses([s.axis], params.classes));
  params.attrs?.forEach(({ name, value }) => axis.attr(name, value));
  return axis
    .attr("transform", getAxisTransformation(t, sizeAttrs))
    .call(params.a);
}

function getAxisTransformation(
  t: axisType,
  sizeAttrs: types.ChartSizeAttributes
): string {
  switch (t) {
    case "X":
      return `translate(0,${
        sizeAttrs.dimensions.height - sizeAttrs.margins.bottom
      })`;
    case "Y":
      return `translate(${sizeAttrs.margins.left}, 0)`;
  }
}
