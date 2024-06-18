import * as d3 from "d3";

export function normalizeOptions( marginTop, marginRight, marginBottom, marginLeft, xAxis, yAxis, data, charts, options, tooltipContent) {
  const { width, height } = options.target.getBoundingClientRect();
  console.log(options.target.getBoundingClientRect())
  const normOptions = {width, height, marginTop, marginRight, marginBottom, marginLeft, xAxis, yAxis, data, charts, ...options, tooltipContent}
  if (!normOptions.xAxis.name) {
    normOptions.xAxis.name = 'name';
  }
  if (!normOptions.xAxis.category) {

    if (normOptions.data[0][normOptions.xAxis.name] instanceof Date) {
      normOptions.xAxis.category = 'date'
    } else if (typeof normOptions.data[0][normOptions.xAxis.name] === 'number') {
      normOptions.xAxis.category = 'number'
    } else {
      normOptions.xAxis.category = 'point'
    }
  }
  if (!normOptions.xAxis.range) {
    if (normOptions.xAxis.category == 'point') {
      normOptions.xAxis.range = normOptions.data.map(d => d[normOptions.xAxis.name]);
    } else {
      normOptions.xAxis.range = [
        d3.min(normOptions.data, (d) => d[normOptions.xAxis.name]),
        d3.max(normOptions.data, (d) => d[normOptions.xAxis.name])
      ];
    }
  }
  if (!normOptions.yAxis.length) {
    normOptions.yAxis.push({})
  }
  const stackedBar = charts.filter( chart => chart.type == 'stackedBars' );
  normOptions.yAxis.map(function(element) {
      if (!element.name) {
        element.name = 'value';
      }
      if (!element.category) {
        if (normOptions.data[0][element.name] instanceof Date) {
          element.category = 'date'
        } else if (typeof normOptions.data[0][element.name] === 'number') {
          element.category = 'number'
        } else {
          element.category = 'point'
        }
      }
      if (!element.range) {
        if (element.category == 'point') {
          element.range = normOptions.data.map(d => d[element.name]);
        } else {
          element.range = [
            !stackedBar.length ? d3.min(normOptions.data, (d) => d[element.name]) - d3.min(normOptions.data, (d) => d[element.name]) * 0.1 : 0,
            !stackedBar.length ?
              d3.max(normOptions.data, (d) => d[element.name]) + d3.max(normOptions.data, (d) => d[element.name]) * 0.1 :
              d3.max(d3.rollup(normOptions.data, (d) => d3.sum(d, da => da[element.name]), d => d[normOptions.xAxis.name]).values()),
          ];
        }
      }
    }
  );
  return normOptions;
}

export function normalizeOptionsDonut( data, options) {

  const { width, height } = options.target.getBoundingClientRect();
  const minSize = d3.min([width, height]);
  const normOptions = {minSize, data, ...options}
  normOptions.label = normOptions.label ? normOptions.label : 'name';
  normOptions.value = normOptions.value ? normOptions.value : 'value';
  normOptions.labelCenter = normOptions.labelCenter ? normOptions.labelCenter : normOptions.label;
  return normOptions;
}

export function getType(axisOptions, name, data) {
  let type = 'point';
  if (data[0][name] instanceof Date) {
    axisOptions.category = 'date'
  }
  if (typeof data[0][name] === 'number') {
    axisOptions.category = 'number'
  }
  return type;
}
