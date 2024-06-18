# Context tooltip

context tooltip can bu used to display multiple tooltip in the same time for two graph.
if a graph is pointed, tooltip will displayed in all graph which is in the same context.

the value of context must be an object with an empty array named `contexts`.

## Example
````js
<TooltipContext.Provider value={{contexts: []}}>
  <Chart data={data} charts={charts1}></Chart>
  <Chart data={data2} charts={charts2}></Chart>
</TooltipContext.Provider>
````
