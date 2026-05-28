const DATA_PATH = "data/football.json";

// Dimensions to show the data for in the graph from left to right.
const dimensions = [
    "id",
    "appearance",
    "mins_played",
    "ball_recovery",
    "clearance_total",
    "duel_aerial_lost",
    "duel_aerial_won",
    "final_third",
    "pass_inaccurate",
    "pass_accurate",
    "possession",
    "punches",
    "touches",
    "keeper_missed",
    "keeper_save_total",
    "goals"
];

window.addEventListener("load", async () => {
    const dataset = await d3.json(DATA_PATH);
    // The actual player rows are inside dataset.nodes.
    const players = normalizePlayers(dataset.nodes);

    renderParallelCoordinates(players)
});

function normalizePlayers(nodes) {
    // Fill missing stats with 0 so every player has every dimension.
    return nodes.map((node) => {
        const player = {
            id: node.id,
            label: node.label
        };

        dimensions.forEach((dimension) => {
            player[dimension] = Number(node[dimension] ?? 0);
        });

        return player;
    });
}

function renderParallelCoordinates(players) {
    // Margins leave room for axis labels and tick labels.
    const margin = { top: 80, right: 24, bottom: 16, left: 24 };
    const width = 1100;
    const height = 620;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create the complete SVG for the graph.
    const svg = d3.create("svg")
        .attr("id", "parallel-coordinates-chart")
        .attr("class", "parallel-chart")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("role", "img");

    // margins and so on of the parent group
    const chart = svg.append("g")
        .attr("class", "plot-area")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // x maps each dimension name to a horizontal axis position.
    const x = d3.scalePoint()
        .domain(dimensions)
        .range([0, innerWidth])
        .padding(0.2);

    // y stores one vertical scale per dimension.
    const y = new Map(
        dimensions.map((dimension) => [
            dimension,
            d3.scaleLinear()
                .domain(d3.extent(players, (player) => player[dimension])) // min/max for the dimension using all players
                .nice() // makes min/max more pretty
                .range([innerHeight, 0])
        ])
    );

    // Color lines by 'mins_played', just to separate players visually.
    const color = d3.scaleSequential()
        .domain(d3.extent(players, (player) => player.mins_played))
        .interpolator(d3.interpolatePlasma); // color scheme: https://d3js.org/d3-scale-chromatic/sequential#interpolateGnBu

    // Converts coordinate points into the SVG path string.
    const line = d3.line()
        .x((point) => point[0])
        .y((point) => point[1]);

    const playerLines = chart // add the player lines with the value as y and x where the dimension line will be
        .append("g")
        .attr("class", "player-lines")
        .selectAll("path")
        .data(players)
        .join("path")
        .attr("d", (player) =>
            line(dimensions.map((dimension) => [x(dimension), y.get(dimension)(player[dimension])]))
        )
        .attr("stroke", (player) => color(player.mins_played));

    playerLines
        .append("title")
        .text((player) => player.label);

    const axisGroups = chart // add a line per dimension which are the axes
        .append("g")
        .attr("class", "axes")
        .selectAll("g")
        .data(dimensions)
        .join("g")
        .attr("transform", (dimension) => `translate(${x(dimension)},0)`);

    axisGroups // add the y levels
        .each(function (dimension) {
            d3.select(this).call(d3.axisLeft(y.get(dimension)).ticks(8));
        });

    axisGroups // add axis labels
        .append("text")
        .attr("class", "axis-title")
        .attr("transform", "translate(0,-4) rotate(-45)")
        .text((dimension) => dimension);

    const deselectcol = "#ddd";
    const brushwidth = 50;
    const selections = new Map();
    const brush = d3.brushY()
        .extent([
            [-brushwidth / 2, 0],
            [brushwidth / 2, innerHeight]
        ])
        .on("start brush end", brushed);

    function brushed({ selection }, dimension) {
        if (selection === null) {
            selections.delete(dimension);
        } else {
            selections.set(dimension, selection.map(y.get(dimension).invert).sort(d3.ascending));
        }

        playerLines.each(function (player) {
            const selected = Array.from(selections).every(([dimension, [min, max]]) =>
                player[dimension] >= min && player[dimension] <= max
            );

            d3.select(this)
                .classed("is-deselected", !selected)
                .attr("stroke", selected ? color(player.mins_played) : deselectcol);

            if (selected) {
                d3.select(this).raise();
            }
        });
    }

    axisGroups
        .append("g")
        .attr("class", "axis-brush")
        .call(brush);

    d3.select("#parallel-coordinates-container")
        .node()
        .appendChild(svg.node());
}
