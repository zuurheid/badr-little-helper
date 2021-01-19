import * as types from "./types";
import * as d3 from "d3";
import { createSVG, composeClasses } from "./internal";
import s from "./BarChart.module.scss";

interface BarChartParams<T, U, Data> extends types.ChartParams {
  axis: {
    x: AxisParams<T>;
    y: AxisParams<U>;
  };
  barParams: barsParams<Data>;
}

export function initializeBarChart<T, U, Data>(
  params: BarChartParams<T, U, Data>
): d3.Selection<SVGSVGElement, unknown, HTMLElement, unknown> {
  const svg = createSVG({
    ...params,
    dimensions: params.sizeAttributes.dimensions,
  });
  createXYAxis(svg, params.sizeAttributes, params.axis);
  drawBars(svg, params.barParams);
  return svg;
}

interface AxisParams<T> {
  a: d3.Axis<T>;
  elAttrs: types.ElementAttrs;
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
  const axis = svg.append("g");
  return setAttrs(axis, {
    classes:
      params.elAttrs.classes === undefined
        ? [s.axis]
        : [s.axis, ...params.elAttrs.classes],
    attrs: params.elAttrs.attrs,
  })
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

interface barsParams<T> {
  data: Array<T>;
  drawBarFn: (
    el: d3.Selection<
      Element | d3.EnterElement | Document | Window | SVGRectElement | null,
      T,
      SVGGElement,
      unknown
    >
  ) => d3.Selection<
    Element | d3.EnterElement | Document | Window | SVGRectElement | null,
    T,
    SVGGElement,
    unknown
  >;
  barsAttrs?: types.ElementAttrs;
  containerAttrs?: types.ElementAttrs;
}

function drawBars<T>(
  svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, unknown>,
  params: barsParams<T>
) {
  const container = svg.append("g");
  if (params.containerAttrs != undefined) {
    setAttrs(container, params.containerAttrs);
  }
  let rect = container.selectAll("rect").data(params.data).join("rect");
  const barsAttrs: types.ElementAttrs =
    params.barsAttrs === undefined
      ? {
          classes: [s.bar],
        }
      : params.barsAttrs;
  setAttrs(rect, barsAttrs);
  return params.drawBarFn(rect);
}

interface attrSetter {
  attr(name: string, value: string | number | boolean): this;
}

function setAttrs<T>(el: T, attrs: types.ElementAttrs) {
  const setter = (el as unknown) as attrSetter;
  if (attrs.classes != undefined) {
    setter.attr("class", composeClasses(attrs.classes));
  }
  attrs.attrs?.forEach((a) => setter.attr(a.name, a.value));
  return el as T;
}
