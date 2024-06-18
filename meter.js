import { normalizeOptionsDonut } from "../library/d3js/optionNormalization.js";
import * as scale from "../library/d3js/scale.js";
import * as htmlElement from "../library/d3js/htmlElement.js";
import * as d3 from "d3";

function createContext( data, options) {
  const normalizedOptions = normalizeOptionsDonut(data, options);
  const svg = htmlElement.createSvg(
    normalizedOptions.minSize,
    normalizedOptions.minSize,
    true
  );
  options.target.append(svg.node());
  return { svg, options : normalizedOptions, x: null, y: {} };
}

export default function Donut({
  data = [],
  ...options
}) {
  console.log(options)
  if (!data) throw new Error('The data is mandatory.');
  if (!options.target) throw new Error('The target is mandatory.');

  const context = createContext(data, options);

  //createPieScale(context);
  //createColorScale(context);

  htmlElement.donuts(options)(context);
}
