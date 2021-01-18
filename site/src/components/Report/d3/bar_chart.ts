import * as types from "./types";
import * as d3 from "d3";
import { createSVG, composeClasses } from "./internal";
import s from "./BarChart.module.scss";

interface BarChartParams extends types.ChartParams {
  // axis: {
  //   x: AxisParams;
  //   y: AxisParams;
  // };
}

export function initializeBarChart(
  opts: types.ChartParams
): d3.Selection<SVGSVGElement, unknown, HTMLElement, unknown> {
  return createSVG({
    ...opts,
    dimensions: opts.sizeAttributes.dimensions,
  });
}

interface AxisParams {
  a: d3.Axis<string>;
  classes?: string[];
  attrs?: { name: string; value: string }[];
}

function createAxis(
  svg: d3.Selection<SVGSVGElement, undefined, HTMLElement, undefined>,
  params: AxisParams
) {
  const axis = svg
    .append("g")
    .attr("class", composeClasses([s.axis], params.classes));
  params.attrs?.forEach(({ name, value }) => axis.attr(name, value));
  axis.call(params.a);
  return axis;
}
