import { normalizeOptions } from "../library/d3js/optionNormalization.js";
import { createxAxis, createyAxis } from "../library/d3js/scale.js";
import * as htmlElement from "../library/d3js/htmlElement.js";
import * as d3 from "d3";
import { useContext } from "react";
import { v4 as uuidv4 } from 'uuid'

const VALID_TYPES = ['lines', 'line', 'bars', 'multiBars', 'stackedBars', 'horizontalStackedBars'];

function createContext(marginTop, marginRight, marginBottom, marginLeft, xAxis, yAxis, data, charts, options, tooltipContext) {
  const normalizedOptions = normalizeOptions(marginTop, marginRight, marginBottom, marginLeft, xAxis, yAxis, data, charts, options);
  const id = uuidv4();
  const svg = htmlElement.createSvg(
    normalizedOptions.width,
    normalizedOptions.height
  );
  options.target.append(svg.node());
  let tooltip = {contexts: []};
  if (tooltipContext) {
    tooltip = tooltipContext
  }
  const context = { svg, options : normalizedOptions, x: null, y: {}, tooltipContext: tooltip, id }
  tooltip.contexts.push(context);

  return context;
}

export default function Chart({
  marginTop = 20,
  marginRight = 30,
  marginBottom = 30,
  marginLeft = 50,
  xAxis = {},
  yAxis = [],
  data = [],
  charts = [],
  tooltipContext = null,
  ...options
}) {
  if (!data) throw new Error('The data is mandatory.');
  if (!options.target) throw new Error('The target is mandatory.');
  const context = createContext(marginTop, marginRight, marginBottom, marginLeft, xAxis, yAxis, data, charts, options , tooltipContext);
  createxAxis(context);
  createyAxis(context);

  context.options.charts.forEach((chart) => {
    if (!VALID_TYPES.includes(chart.type)) {
      throw new Error(`Invalid chart type : "${chart.type}"`);
    }
    htmlElement[chart.type](chart)(context);
  });
}

// <div width="100%" height="200px">
//   <Chart.Context>
//     <Chart data={data} options={} />
//     <Chart.Line data={data} options={} />
//   </Chart.Context>
// </div>
