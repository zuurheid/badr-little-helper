import * as d3 from "d3";
import sReport from "../Report.module.scss";
import * as types from "./types";

interface CreateSVGParams {
  container: types.ChartContainer;
  dimensions: types.Dimensions;
  classes?: string[];
}

export function createSVG(
  opts: CreateSVGParams
): d3.Selection<SVGSVGElement, unknown, HTMLElement, any> {
  const container = d3.select(opts.container.selector);
  const svg = insertSVGIntoContainer(container, opts.container.position);
  svg
    .attr("class", composeSVGClass(opts.classes))
    .attr("viewBox", `0 0 ${opts.dimensions.width} ${opts.dimensions.height}`);
  return svg;
}

function insertSVGIntoContainer(
  container: d3.Selection<d3.BaseType, unknown, HTMLElement, unknown>,
  pos?: types.ChartPosition
): d3.Selection<SVGSVGElement, unknown, HTMLElement, any> {
  const svgType = "svg";
  if (pos === undefined || pos === "last") {
    return container.append(svgType);
  }
  const insertSelector = pos === "first" ? ":first-child" : pos.before;
  return container.insert(svgType, insertSelector);
}

function composeSVGClass(classes?: string[]): string {
  return composeClasses([sReport.chartSVG], classes);
}

export function composeClasses(
  classes: string[],
  optionalClasses?: string[]
): string {
  const classesSep = " ";
  return optionalClasses === undefined
    ? classes.join(classesSep)
    : classes.concat(optionalClasses).join(classesSep);
}
