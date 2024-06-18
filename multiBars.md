[library-chart](../../README.md) / Chart

# MultiBars

Create uniquely multibars chart in function of data.
Chart have Four parameters. `data`, `barcharts`, `xAxis` and `yAxis`
It is all an object format.

### data

the data to display, It is a array of objects where each object contains an x value, y value and a category.

### xAxis (falcutatif)

Object which contain parameters about x axis

Information about x axis
| Name                | Type                 | Default | Description                               |
|---------------------|----------------------|---------|-------------------------------------------|
| `title`             | `string`             |         |  Title of x axis                          |
| `name`              | `string`             | `name`  |  Key name to get value in data            |
| `hidden`            | `bool`               | `false` |  Hide x axis on the graph                 |
| `range`             | `[integer, integer]` |         |  Range of the axis                        |
| `category`          | `string`             |         |  Type of axis (number, date or point)     |
| `displayLine`       | `boolean`            | `false` |  Remove the line of axis, keep only ticks |
| `tickSize`          | `integer`            |         |  Size of the tick (line after the number) |
| `fontSize`          | `integer`            |         |  Size of the font                         |


### yAxis (falcutatif)

Array of objects, which contain parameters about y axis

| Name                | Type                 | Default | Description                               |
|---------------------|----------------------|---------|-------------------------------------------|
| `id`                | `string`             |         |  Id of the y axis                         |
| `title`             | `string`             |         |  Title of y axis                          |
| `name`              | `string`             | `name`  |  Key name to get value in data            |
| `hidden`            | `bool`               | `false` |  Hide y axis on the graph                 |
| `range`             | `[integer, integer]` |         |  Range of the axis                        |
| `category`          | `string`             |         |  Type of axis (number, date or point)     |
| `displayLine`       | `boolean`            | `false` |  Remove the line of axis, keep only ticks |
| `tickSize`          | `integer`            |         |  Size of the tick (line after the number) |
| `fontSize`          | `integer`            |         |  Size of the font                         |

### barcharts (falcutatif)

object which contain parameters about the graph to display (type of graph, tooltip to display, transition).

| Name             | Type                 | Default | Description                                                                                     |
|----------------|----------------------|---------|---------------------------------------------------------------------------------------------------|
| `categories`   | `list(string)`       |         |  List of categories of data to draw in graph (if empty get all categories)                        |
| `colors`       | `list(string)`       |         |  List of color to draw the graph                                                                  |
| `hideTooltips` | `boolean`            |         |  Hide the tooltips on graph                                                                       |
| `width`        | `integer`            |         |  Width of the bars in graph                                                                       |
| `noTransition` | `booleen`            |         |  Remove transition                                                                                    |

## example

```js
import { MultiBars } from 'library-chart';

const data = [
  {name: "100", value: 60, category: 'bobi'},
  {name: "120", value: 20, category: 'bobi'},
  {name: "150", value: 12, category: 'bobi'},
  {name: "200", value: 24, category: 'bobi'},
  {name: "100", value: 33, category: 'paul'},
  {name: "120", value: 56, category: 'paul'},
  {name: "150", value: 13, category: 'paul'},
  {name: "200", value: 60, category: 'paul'},
  {name: "100", value: 12, category: 'bernadette'},
  {name: "120", value: 24, category: 'bernadette'},
  {name: "150", value: 6, category: 'bernadette'},
  {name: "200", value: 30, category: 'bernadette'},
]

<Chart.MultiBars data={data}/>
```
