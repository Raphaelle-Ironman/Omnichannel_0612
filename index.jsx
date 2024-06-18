// 1. Export default

// 2. Exports (shorcuts / helpers)



import React, { useRef, useEffect, useContext, createContext, useState } from 'react';
import {default as ChartJs} from './charts/chart';
import {default as DonutsJs} from './charts/meter';

export const TooltipContext = createContext(null);

export function Donuts({data, options={}}) {
  const container = useRef(null);
  useEffect(() => {
    new DonutsJs({
      target: container.current,
      data,
      options
    })
  }, [container]);
  return <div style={{width: "100%", height:"100%"}} ref={container} />;
}


export default function Chart({ data, options={}, xAxis={}, yAxis=[], charts=[] }) {
  const tooltipContext = useContext(TooltipContext);
  const container = useRef(null);
  const [width, setWidth] = useState(undefined);
  const [height, setHeight] = useState(undefined);
  function resize() {
    // Set window width/height to state
    const sizeDiv = container.current.getBoundingClientRect();
    setWidth(sizeDiv.width)
    setHeight(sizeDiv.height)
  }
  //const context = useContext();
  useEffect(() => {
    window.addEventListener("resize", resize, false);
    if (container.current.lastChild) {
      container.current.removeChild(container.current.lastChild)
    }
    new ChartJs({
      target: container.current,
      xAxis,
      yAxis,
      data,
      charts,
      options,
      toolTipContent: (row, rows, labelName='name' , labelValue='value') => {
        let text ='';
        rows.forEach(d => {
          text =  `<tspan x="0" dy="1.2em">${d.category}</tspan>
          <tspan style="font-weight:bold">` + d[labelValue] + '</tspan></tspan>' + text;
        });
        text = `<tspan x="0" dy="1.2em">${row[labelName]}</tspan><tspan dy="1.8em"`+text+`</tspan>`
        return text
      },
      tooltipContext: tooltipContext,
    });
    return () => {
      window.removeEventListener("resize", resize, false);
    };
    // Create the chart
  }, [container, width, height]);

  return <div style={{width: "100%", height:"100%"}} ref={container} />;
};

export function Bars({ data, options={}, xAxis={}, yAxis=[], barcharts={} }) {
  const charts = [{...barcharts, type: 'bars'}]
  return <Chart
    data={data}
    charts={charts}
    options={options}
    xAxis={xAxis}
    yAxis={yAxis}
  />;
}

export function MultiBars({ data, options={}, xAxis={}, yAxis=[], barcharts={} }) {
  const charts = [{...barcharts, type: 'multiBars'}]
  return <Chart
    data={data}
    charts={charts}
    options={options}
    xAxis={xAxis}
    yAxis={yAxis}
  />;
}

export function Lines({ data, options={}, xAxis={}, yAxis=[], lines={} }) {
  const charts = [{...lines, type: 'lines'}]
  return <Chart
    data={data}
    charts={charts}
    options={options}
    xAxis={xAxis}
    yAxis={yAxis}
  />;
}

export function StackedBars({ data, options={}, xAxis={}, yAxis=[], stackedBars={} }) {
  const charts = [{...stackedBars, type: 'stackedBars'}]
  return <Chart
    data={data}
    charts={charts}
    options={options}
    xAxis={xAxis}
    yAxis={yAxis}
  />;
}

Chart.Bars = Bars;
Chart.MultiBars = MultiBars;
Chart.Lines = Lines;
Chart.StackedBars = StackedBars;
