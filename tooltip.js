import * as d3 from "d3";

const barsType = ['horizontalStackedBars','multiBars', 'stackedBars', 'bars']

function createTooltip(context) {

  const lineTooltip = context.svg
  .insert('g', 'g')
  .append('line')
    .attr("stroke", "black")
    .attr('y1', 30)
    .attr('y2', context.options.height -30)
    .style("opacity", 0);
  const tooltip = context.svg.append("g");

  const arr = context.tooltipContext.contexts.find(arr => arr.id === context.id)
  arr.tooltip = tooltip;
  arr.lineTooltip = lineTooltip

  return tooltip
}

export function linesTooltip(context, xAxis, yAxis, data, color) {


  createTooltip(context)

  context.svg.append('rect')
    .style("fill", "none")
    .style("pointer-events", "all")
    .attr('width', context.options.width)
    .attr('height', context.options.height)
    .on('mouseover', mouseover)
    .on('mousemove', mousemove)
    .on('mouseout', mouseout);

  context.svg.append('rect')

  function mouseover() {
    context.tooltipContext.contexts.forEach(context => {
      context.tooltip.style("opacity", 1);
      context.lineTooltip.style("opacity", 0.5)
      .attr("x", 0)
      .attr("y", 0);
    });
  }

  function mousemove() {
    context.tooltipContext.contexts.forEach((context, index) => {
      context.options.charts.forEach(function(chart){
        if (chart.hideTooltips) {
          return;
        }
        let data = context.options.data;
        if (chart.categories) {
          data = data.filter( d =>  chart.categories.includes(d.category))
        }
        let ix = null;
        let iy = null;
        let dataSelected = null;
        if (context.options.xAxis.category == 'point') {
          var range = context.x.range();
          ix = d3.bisect(d3.range(range[0], range[1], context.x.step()), d3.pointer(event)[0], 1) -1;
        } else {
          const bisectX = d3.bisector(function(d) { return d[xAxis.name]; }).center;
          const x0 = context.x.invert(d3.pointer(event)[0]);
          ix = bisectX(data, x0, 0);
        }
        const bisectY = d3.bisector(function(d) { return d[yAxis.name]; }).center;
        const y0 = context.y[chart.YId ? chart.YId : Object.keys(context.y)[0]].invert(d3.pointer(event)[1]);
        dataSelected = data.filter(d => d[xAxis.name] === data[ix][xAxis.name]).sort(function(a,b) {
          return a[yAxis.name] - b[yAxis.name]
        })
        iy = bisectY(dataSelected, y0, 0);


        const path = context.tooltip.selectAll("path")
          .data([,])
          .join("path")
          .attr("fill", "white")
          .attr("stroke", "black");

        const text = context.tooltip.selectAll("text")
          .data([,])
          .join("text")
          .html(context.options.toolTipContent(dataSelected[iy], dataSelected))

        size(text, path, context.tooltip);

        context.lineTooltip
          .attr("x1", context.x(dataSelected[iy][xAxis.name]))
          .attr("x2", context.x(dataSelected[iy][xAxis.name]));

      });
    });
  }
  function mouseout() {
    context.tooltipContext.contexts.forEach(context => {
      context.tooltip.style("opacity", 0);
      context.lineTooltip.style("opacity", 0);
    });
  }

  function size(text, path, tooltip) {
    const {x, y, width: w, height: h} = text.node().getBBox();
    text.attr("transform", `translate(${-w / 2},${15 - y})`);
    path.attr("d", `M${-w / 2 - 10},5H${w / 2 + 10}v${h + 20}h-${w + 20}z`);
    const {width: pathw, height: pathh} = path.node().getBBox();
    tooltip.attr("transform", `translate(
      ${d3.pointer(event)[0] + pathw > context.options.width ? d3.pointer(event)[0] - w / 2 - 20 : d3.pointer(event)[0] + w / 2 + 20},
      ${d3.pointer(event)[1] + pathh > context.options.height ? d3.pointer(event)[1] - pathh : d3.pointer(event)[1]})`);
  }
}

export function barsTooltip(bars, context, xAxis, yAxis, data, color, staked=false) {

  const tooltip = createTooltip(context)

  const barmouseover = function(d) {
    context.tooltipContext.svg.forEach(svg => {
      svg.tooltip.style("opacity", 1);
    });
    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1);
  }
  const barmousemove = function(event, d) {
    if (staked) {
      d = d.data;
    }
    console.log(event.pageX)
    const dataSelected = data.filter(da => da[xAxis.name] === d[xAxis.name]);
    let text = context.options.toolTipContent(d, dataSelected)
    tooltip
      .html(text)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY) + "px")

  }
  const barmouseleave = function(d) {
    console.log(context.tooltipContext)
    tooltip.style("opacity", 0)
    .html("");
  d3.select(this)
    .style("stroke", "none")
    .style("opacity", 0.8);
  }

  bars
    .on("mouseover", barmouseover)
    .on("mousemove", barmousemove)
    .on("mouseleave", barmouseleave)
}

export function donutsTooltip(paths, context) {

  const div = document.createElement("div");
  div.setAttribute("class", "chartTooltip");
  context.options.target.append(div);

  const tooltip = d3.select(`.chartTooltip`).append("div")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background-color", "white")
    .style("text-align", "left")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("border-color", "black")
    .style("color", '#3B4D6F')
    .style("padding", "5px");

  const barmouseover = function(d) {
    console.log(tooltip)
    tooltip.style("opacity", 1);
    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1);
  }
  const barmousemove = function(event, d) {

    let text = `<tspan style="line-height:2em;font-weight:bold" >` + d.data[context.options.label] + '</tspan><br>' +
      `<tspan style="line-height:2em" >` + d.data[context.options.value] + '</tspan>';
    tooltip
      .html(text)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY) + "px")

  }
  const barmouseleave = function(d) {
    tooltip.style("opacity", 0)
    .html("");
  d3.select(this)
    .style("stroke", "none")
  }

  paths
    .on("mouseover", barmouseover)
    .on("mousemove", barmousemove)
    .on("mouseleave", barmouseleave)
}
