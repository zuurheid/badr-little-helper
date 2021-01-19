export interface Dimensions {
  width: number;
  height: number;
}

export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface InsertPositionSelector {
  before: string;
}

export type ChartPosition = "first" | "last" | InsertPositionSelector;

export interface ChartContainer {
  selector: string;
  position?: ChartPosition;
}

export interface ChartSizeAttributes {
  dimensions: Dimensions;
  margins: Margins;
}

export interface ElementAttrs {
  classes?: string[];
  attrs?: { name: string; value: string }[];
}

export interface ChartParams {
  container: ChartContainer;
  sizeAttributes: ChartSizeAttributes;
  //classes?: string[];
}
