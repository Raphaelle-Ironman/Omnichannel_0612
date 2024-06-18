import * as d3 from "d3";

export function createxAxis(context) {
  let x=null;
  switch (context.options.xAxis.category) {
    case 'date':
      x = d3.scaleUtc()
        .domain(context.options.xAxis.range)
        .range([context.options.marginLeft, context.options.width - context.options.marginRight]);
      break
    case 'number':
      x = d3.scaleLinear()
        .domain(context.options.xAxis.range)
        .range([context.options.marginLeft, context.options.width - context.options.marginRight]);
      break
    case 'point':
      x = d3.scalePoint()
        .domain(context.options.xAxis.range)
        .range([context.options.marginLeft, context.options.width - context.options.marginRight])
        .padding(0.5);
      break;

    default:
      break;
  }
  if (!context.options.xAxis.hidden) {
    const axis = context.svg.append("g");
    if (context.options.xAxis.position == 'top') {
      axis
        .attr("transform", `translate(0, ${context.options.marginTop})`)
        .call(d3.axisTop(x).tickSize(context.options.xAxis.tickSize != null ? context.options.xAxis.tickSize : 6))
        .attr("color", "grey");
    } else {
      axis
        .attr("transform", `translate(0, ${context.options.height - context.options.marginBottom})`)
        .call(d3.axisBottom(x)
          .tickSize(context.options.xAxis.tickSize != null ? context.options.xAxis.tickSize : 6)
          .tickPadding(10)
        )
        .attr("color", "grey");
    }
    axis.attr("font-size", context.options.xAxis.fontSize? context.options.xAxis.fontSize : context.options.width / 80);
    if (!context.options.xAxis.displayLine) {
      axis.call(g => g.selectAll(".domain").remove());
    }
  }
  context.x = x;
}

export function createyAxis(context) {
  let y=null;
  context.options.yAxis.forEach(element => {
    switch (element.category) {
      case 'date':
        y = d3.scaleUtc()
          .domain(element.range.reverse()[0])
          .range([context.options.marginTop, context.options.height - context.options.marginBottom])
        break
      case 'number':
        y = d3.scaleLinear()
          .domain(element.range.reverse())
          .range([context.options.marginTop, context.options.height - context.options.marginBottom])
        break
      case 'point':
        y = d3.scalePoint()
          .domain(element.range.reverse())
          .range([context.options.marginTop, context.options.height - context.options.marginBottom])
          .padding(0.5)
        break;

      default:
        break;
    }
    if (!element.hidden) {
      const axis = context.svg.append("g");
      if (element.position == 'right') {
        axis
          .attr("transform", `translate(${context.options.width - context.options.marginRight}, 0)`)
          .call(d3.axisRight(y).tickSize(element.tickSize != null ? element.tickSize : 6).tickFormat(d3.format("~s")))
          .call(g => g.selectAll(".tick line").clone().lower()
          .attr("color", "grey")
          .attr("stroke-opacity", 0.2)
          .attr("x2", -context.options.width + context.options.marginRight + context.options.marginLeft));
        axis.call(g => g.append("text")
            .attr("x", -30)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text(element.title));

      } else {
        axis
          .attr("transform", `translate(${context.options.marginLeft}, 0)`)
          .call(d3.axisLeft(y)
            .tickSize(element.tickSize != null ? element.tickSize : 0)
            .tickPadding(15)
            .tickFormat(d3.format("~s")))
            .attr("color", "grey")
          .call(g => g.selectAll(".tick line").clone().lower()
            .attr("stroke-opacity", 0.2)
            .attr("x2", context.options.width - context.options.marginRight - context.options.marginLeft));
        axis.call(g => g.append("text")
            .attr("x", -30)
            .attr("y", 10)
            .attr("text-anchor", "start")
            .text(element.title));
      }
      axis.attr("font-size", element.fontSize? element.fontSize : context.options.height / 40);
      if (!element.displayLine) {
        axis.call(g => g.selectAll(".domain").remove());
      }
    }

    if (!element.id){
      element.id = 0;
    }
    context.y[element.id] = y;
  });
}
