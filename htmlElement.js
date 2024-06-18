import * as d3 from "d3";
import { linesTooltip, barsTooltip, donutsTooltip } from "./tooltip.js";
import {Swatches} from "./legent.js"

const chartColors = {
  eskimoz : ['#0E44A8', '#2F80ED', '#B1E3FF','#A1A4E3',],
  eskimozDonuts: ['#5A88FF', '#D67FFF', '#5AC4FF', '#FF5A5A', '#44DA86', '#FFC03D', '#FF9F5A', '#05153D'],
  paper: ['#ff5a5a', '#cd1f1f', '#ffe1e1'],
}

function initiateChart(context, options) {
    let data = context.options.data;
    if (options.categories) {
      data = data.filter( d =>  options.categories.includes(d.category))
    }
    let xAxis = context.options.xAxis;
    let yAxis = context.options.yAxis.find(y => y.id == options.YId);
    if (!yAxis) {
      yAxis = context.options.yAxis[0]
    }
    const {x, y, z} = initiateScale(context, options, data);
    return {data, xAxis, yAxis, x, y, z}
}

function initiateScale(context, options, data) {
  const x = context.x;
  const y = context.y[options.YId ? options.YId : Object.keys(context.y)[0]];
  const categories = new Set(data.map(d => d.category));
  const z = d3.scaleOrdinal().domain(categories).range(chartColors[options.colors] ? chartColors[options.colors] : chartColors.eskimoz ).unknown("#ccc");

  return {x, y, z};
}

export function createSvg(
  width = 640,
  height = 400,
  donuts = false
) {
    const svg = d3.create("svg")
    .attr("width", '100%')
    .attr("height", '100%')
    .attr("viewBox", [donuts ? -width/2 : 0, donuts ? -height/2 : 0, width, height])

  return svg;
}

export function line(options) {
  function draw(context) {
    const {data, xAxis, yAxis, x, y, z} = initiateChart(context, options);
    const line = d3.line()
      .x((data) => x(data[xAxis.name]))
      .y((data) => y(data[yAxis.name]))
    if (options.curve == 'cardinal') {
      line.curve(d3.curveCardinal);
    }
    if (options.curve == 'curveStep') {
      line.curve(d3.curveStep);
    }

    context.svg.append("path")
      .attr("fill", "none")
      .attr("stroke", options.color ? options.color : "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", line(data));
  }
  return draw;
}

export function lines(options) {
  function draw(context) {
    const {data, xAxis, yAxis, x, y, z} = initiateChart(context, options);
    const line = d3.line();
    line.curve(d3.curveCardinal.tension(0.3));
    if (options.curve == 'curveStep') {
      line.curve(d3.curveStep);
    }
    const points = data.map((d) => [x(d[xAxis.name]), y(d[yAxis.name]), d.category, d[yAxis.name]]);
    const groups = d3.rollup(points, v => Object.assign(v, {category: v[0][2]}), d => d[2]);
    context.svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2.5)
      .selectAll("path")
      .data(groups.values())
      .join("path")
      .attr("stroke", d => z(d.category))
      .attr("d", line)
      .transition()
      .duration(!options.noTransition ? 1000 : 0)
      .ease(d3.easePolyInOut.exponent(2))
      .attrTween("stroke-dasharray", function() {
        const length = this.getTotalLength();
        return d3.interpolate(`0,${length}`, `${length},${length}`);
      })
      ;

    if (!options.hideTooltips) {
      linesTooltip(context, xAxis, yAxis, data, z)
    }

    if (options.legends) {
      let test = Swatches(z)
      context.options.target.insertBefore(test, context.svg.node())
    }
  }
  return draw;
}

export function bars(options) {
  function draw(context) {
    const rx = 8;
    const ry = 8;
    const {data, xAxis, yAxis, x, y, z} = initiateChart(context, options);
    const xValues = new Set(data.map(d => d[xAxis.name]))
    const width = options?.width ? options.width : (context.options.width - 30 - 50) / (xValues.size + 1);
    context.svg.append("g")
      .selectAll()
      .data(data)
      .join("path")
      .attr('class', 'bars')
      .style('opacity', 1)
      .attr("fill", d => z(d.category))
      .attr( "d", item => `M${x(item[xAxis.name]) - width/2},${context.options.height - context.options.marginBottom}
      a0,0 0 0 1 0,0
      h${width}
      a0,0 0 0 1 0,0
      v${0}
      h${-width}Z`)
      .attr("fill", d => z(d.category));

    const bars = context.svg.selectAll(".bars");

    bars
      .sort(function(a,b){return a[xAxis.name]-b[xAxis.name]})
      .transition()
      .duration(!options.noTransition ? 700 : 0)
      .delay((d, i) => i * (!options.noTransition ? 50 : 0))
      .attr( "d", item => `M${x(item[xAxis.name]) - width/2},${y(item[yAxis.name]) + ry}
      a${rx},${ry} 0 0 1 ${rx},${-ry}
      h${width - 2 * rx}
      a${rx},${ry} 0 0 1 ${rx},${ry}
      v${context.options.height - y(item[yAxis.name]) - ry  - context.options.marginBottom}
      h${-width}Z`)


    if (!options.hideTooltips) {
      linesTooltip(context, xAxis, yAxis, data, z)
    }
  }
  return draw;
}

export function multiBars(options) {
  function draw(context) {
    const rx = 8;
    const ry = 8;
    const {data, xAxis, yAxis, x, y, z} = initiateChart(context, options);
    const categories = new Set(data.map(d => d.category))
    const xValues = new Set(data.map(d => d[xAxis.name]))
    const width = options?.width ? options.width : (context.options.width - 30 - 50) / (xValues.size + 1);
    const xCategories = d3.scaleBand().domain(categories)
    .range([0, width])
    .padding(0.05);

    context.svg.append("g")
    .selectAll()
    .data(d3.group(data, d => d[xAxis.name]))
    .join("g")
    .attr("transform", ([name]) => `translate(${x(name)},0)`)
    .selectAll()
      .data(([, d]) => d)
      .join("path")
      .attr('class', 'bars')
      .style('opacity', 1)
      .attr( "d", item => `M${xCategories(item.category) - width/2},${context.options.height - context.options.marginBottom}
      a0,0 0 0 1 0,0
      h${xCategories.bandwidth()}
      a0,0 0 0 1 0,0
      v${0}
      h${-xCategories.bandwidth()}Z`)
      .attr("fill", d => z(d.category));

    const bars = context.svg.selectAll(".bars");

    bars
      .sort(function(a,b){return a[xAxis.name]-b[xAxis.name]})
      .transition()
      .duration(!options.noTransition ? 700 : 0)
      .delay((d, i) => i * (!options.noTransition ? 50 : 0))
      .attr( "d", item => `M${xCategories(item.category) - width/2},${y(item[yAxis.name]) + ry}
      a${rx},${ry} 0 0 1 ${rx},${-ry}
      h${xCategories.bandwidth() - 2 * rx}
      a${rx},${ry} 0 0 1 ${rx},${ry}
      v${context.options.height - y(item[yAxis.name]) - ry  - context.options.marginBottom}
      h${-xCategories.bandwidth()}Z`)


    if (!options.hideTooltips) {
      linesTooltip(context, xAxis, yAxis, data, z)
    }
    if (options.legends) {
      let test = Swatches(z)
      context.svg.node().after(test)
    }

  }
  return draw;
}

export function stackedBars(options) {
  function draw(context) {
    const {data, xAxis, yAxis, x, y, z} = initiateChart(context, options);
    const series = d3.stack()
      .order(d3.stackOrderInsideOut)
      .keys(d3.union(data.map(d => d.category))) // distinct series keys, in input order
      .value((group, key) => group.get(key)[yAxis.name])
      .order(d3.stackOrderReverse)
      (d3.rollup(data, ([d]) => d, d => d[xAxis.name], d => d.category).values())
      .map(s => (s.forEach(d => d.data = d.data.get(s.key)), s))

    const xValues = new Set(data.map(d => d[xAxis.name]));
    const width = options?.width ? options.width : (context.options.width - 30 - 50) / (xValues.size + 1);

    context.svg.append("g")
      .selectAll()
      .data(series)
      .join("g")
      .attr("fill", d => z(d.key))
      .selectAll("rect")
      .data(D => D.map(d => (d.key = D.key, d)))
      .join("rect")
      .style('opacity', 1)
      .attr("x", d => x(d.data[xAxis.name]) - width/2)
      .attr("y", d => context.options.height - context.options.marginBottom)
      .attr("width", width)

    if (!options.noTransition) {
      const bars = context.svg.selectAll("rect");
      bars.sort(function(a,b){return a[0]-b[0]})
        .sort(function(a,b){return a.data[xAxis.name]-b.data[xAxis.name]})
        .transition()
        .duration(500)
        .delay((d, i) => i * (20))
        .attr("fill", d => z(d.key))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]));
    }

    if (!options.hideTooltips) {
      linesTooltip(context, xAxis, yAxis, data, z)
    }

    if (options.legends) {
      let test = Swatches(z)
      context.options.target.insertBefore(test, context.svg.node())
    }

  }
  return draw;
}

export function horizontalStackedBars(options) {
  function draw(context) {
    const {data, xAxis, yAxis, x, y, z} = initiateChart(context, options);
    const series = d3.stack()
      .order(d3.stackOrderInsideOut)
      .keys(d3.union(data.map(d => d.category))) // distinct series keys, in input order
      .value((group, key) => group.get(key)[xAxis.name])
      .order(d3.stackOrderReverse)
        (d3.rollup(data, ([d]) => d, d => d[yAxis.name], d => d.category).values())
      .map(s => (s.forEach(d => d.data = d.data.get(s.key)), s))

    const xValues = new Set(data.map(d => d[yAxis.name]));
    const width = options.style?.height ? options.style.height : (context.options.height - 30 - 30) / (xValues.size + 1);
    context.svg.append("g")
      .selectAll()
      .data(series)
      .join("g")
      .attr("fill", d => z(d.key))
      .selectAll("rect")
      .data(D => D.map(d => (d.key = D.key, d)))
      .join("rect")
      .style('opacity', 0.8)
      .attr("x", d => x(d[0]))
      .attr("y", d => y(d.data[yAxis.name]) - width/2)
      .attr("height", width)
      .attr("width", d => x(d[1]) - x(d[0]))

    if (!options.hideTooltips) {
        const bars = context.svg.selectAll("rect");
        barsTooltip(bars, context, xAxis, yAxis, data, true)
    }

    if (options.legends) {
      let test = Swatches(z)
      context.options.target.insertBefore(test, context.svg.node())
    }

  }
  return draw;
}

export function donuts(options) {
  function draw(context) {
    const radius = Math.min(context.options.minSize, context.options.minSize) / 2;
    const data = context.options.data;
    const arc = d3.arc()
      .innerRadius(context.options.type == "pie" ? 0 : radius * 0.67)
      .outerRadius(radius - 1);

    const pie = d3.pie()
      .sort(null)
      .value(d => d[context.options.value]);

    const color = d3.scaleOrdinal()
      .domain(data.map(d => d[context.options.label]))
      .range(options.colors ? options.colors : chartColors.eskimozDonuts ).unknown("#ccc");

    const arcs = context.svg.append("g")
      .selectAll()
      .data(pie(data))
      .join("path")
      .attr("fill", d => color(d.data[context.options.label]));

    let angleInterpolation = d3.interpolate(pie.startAngle()(), pie.endAngle()());


    arcs.transition()
      .duration(1000)
      .attrTween("d", d => {
        let originalEnd = d.endAngle;
        return t => {
          let currentAngle = angleInterpolation(t);
          if (currentAngle < d.startAngle) {
            return "";
          }

          d.endAngle = Math.min(currentAngle, originalEnd);

          return arc(d);
        };
      });

    const g = context.svg.append("g")
      .attr("text-anchor", "middle")
      .style("opacity", 0)
    g.transition().duration(1000).style("opacity",1);
    if (context.options.center) {
      g.append("text")
        .attr("y", "-1em")
        .style("fill", "grey")
        .style("font-size", "150%")
        .text(context.options.labelCenter);
      g.append('text')
        .style("font-weight", "bold")
        .attr("x", 0)
        .attr("y", "1em")
        .style("font-size", "250%")
        .text(d3.sum(data, d => d[context.options.value]));
    }

    donutsTooltip(arcs, context)

  }
  return draw
}
