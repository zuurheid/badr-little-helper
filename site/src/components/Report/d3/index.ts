import * as d3 from "d3";
import sReport from "../Report.module.scss";

interface InsertPositionSelector {
  before: string;
}

type SVGPosition = "first" | "last" | InsertPositionSelector;

interface CreateSVGOptions {
  containerSelector: string;
  dimensions: {
    width: number;
    height: number;
  };
  position?: SVGPosition;
  classes?: string[];
}

export function createSVG(
  opts: CreateSVGOptions
): d3.Selection<SVGSVGElement, unknown, HTMLElement, any> {
  const container = d3.select(opts.containerSelector);
  const svg = insertSVGIntoContainer(container, opts.position);
  svg
    .attr("class", composeSVGClass(opts.classes))
    .attr("viewBox", `0 0 ${opts.dimensions.width} ${opts.dimensions.height}`);
  return svg;
}

function insertSVGIntoContainer(
  container: d3.Selection<d3.BaseType, unknown, HTMLElement, unknown>,
  pos?: SVGPosition
): d3.Selection<SVGSVGElement, unknown, HTMLElement, any> {
  const svgType = "svg";
  if (pos === undefined || pos === "last") {
    return container.append(svgType);
  }
  const insertSelector = pos === "first" ? ":first-child" : pos.before;
  return container.insert(svgType, insertSelector);
}

function composeSVGClass(classes?: string[]): string {
  return classes === undefined
    ? sReport.chartSVG
    : [sReport.chartSVG, ...classes].join(" ");
}
