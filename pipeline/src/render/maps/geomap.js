// Client-side geo-map initializer, emitted as an inline <script> in the deck.
// Depends on globals: d3, topojson, WORLD_TOPO (all inlined into the deck head).
// Renders every element matching [data-geomap] from its JSON config.

export const GEOMAP_CLIENT_SCRIPT = `
(function () {
  function drawOne(panel) {
    var cfg;
    try { cfg = JSON.parse(panel.getAttribute("data-geomap")); }
    catch (e) { return; }
    if (!cfg) return;

    var w = panel.clientWidth, h = panel.clientHeight;
    if (!w || !h) return;

    var svg = d3.select(panel).append("svg")
      .attr("viewBox", "0 0 " + w + " " + h)
      .attr("width", w).attr("height", h);

    svg.append("rect").attr("width", w).attr("height", h).attr("fill", "var(--sea)");

    if (typeof WORLD_TOPO === "undefined" || typeof topojson === "undefined") {
      svg.append("text").attr("x", w / 2).attr("y", h / 2)
        .attr("text-anchor", "middle").attr("fill", "#888")
        .text("Map data unavailable");
      return;
    }

    var b = cfg.bounds || { west: -180, south: -60, east: 180, north: 75 };
    // MultiPoint of corners avoids d3-geo spherical winding-order issues.
    var boundsGeo = { type: "MultiPoint", coordinates: [
      [b.west, b.south], [b.east, b.south], [b.east, b.north], [b.west, b.north]
    ]};

    var projection = d3.geoMercator();
    var path = d3.geoPath(projection);
    var countries = topojson.feature(WORLD_TOPO, WORLD_TOPO.objects.countries).features;
    projection.fitExtent([[14, 16], [w - 14, h - 14]], boundsGeo);

    var hi = cfg.highlight_countries || [];
    function isHi(name) { return hi.indexOf(name) !== -1; }

    svg.append("g").selectAll("path").data(countries).join("path")
      .attr("d", path)
      .attr("fill", function (d) { return isHi(d.properties.name) ? "var(--land-hi)" : "var(--land)"; })
      .attr("stroke", function (d) { return isHi(d.properties.name) ? "var(--land-hi-line)" : "var(--land-line)"; })
      .attr("stroke-width", function (d) { return isHi(d.properties.name) ? 1 : 0.5; });

    (cfg.country_labels || []).forEach(function (c) {
      var p = projection([c.lng, c.lat]);
      svg.append("text").attr("class", "country-label")
        .attr("x", p[0]).attr("y", p[1]).attr("text-anchor", "middle").text(c.name);
    });

    var pts = (cfg.nodes || []).map(function (n) {
      return Object.assign({}, n, { p: projection([n.lng, n.lat]) });
    });

    if (pts.length > 1 && !cfg.hide_route) {
      var lineD = pts.map(function (n, i) { return (i === 0 ? "M " : "L ") + n.p[0] + " " + n.p[1]; }).join(" ");
      svg.append("path").attr("d", lineD).attr("fill", "none")
        .attr("stroke", "var(--route-line)").attr("stroke-width", 2.5)
        .attr("stroke-dasharray", "6 4").attr("stroke-linecap", "round");
    }

    if (cfg.depart && pts.length) {
      var last = pts[pts.length - 1].p;
      var end = [Math.min(last[0] + 70, w - 8), Math.min(last[1] + 48, h - 8)];
      svg.append("path").attr("d", "M " + last[0] + " " + last[1] + " L " + end[0] + " " + end[1])
        .attr("fill", "none").attr("stroke", "var(--banner-bg)")
        .attr("stroke-width", 2).attr("stroke-dasharray", "4 3");
      svg.append("text").attr("x", end[0]).attr("y", end[1] + 4)
        .attr("text-anchor", "middle").attr("font-size", "14px").text("\\u2708");
      svg.append("text").attr("x", end[0]).attr("y", end[1] + 18)
        .attr("text-anchor", "middle").attr("class", "city-label")
        .style("font-size", "10px").text(cfg.depart.caption || "Depart");
    }

    var node = svg.append("g").selectAll("g").data(pts).join("g");
    node.append("text").attr("class", "city-label")
      .attr("x", function (d) { return d.p[0]; })
      .attr("y", function (d) { return d.p[1] + (d.labelDy || -18); })
      .attr("text-anchor", "middle").text(function (d) { return d.label; });
    node.append("circle")
      .attr("cx", function (d) { return d.p[0]; })
      .attr("cy", function (d) { return d.p[1]; })
      .attr("r", 13).attr("fill", function (d) { return d.color || "#c0392b"; })
      .attr("stroke", "#fff").attr("stroke-width", 2.5);
    node.append("text").attr("class", "node-letter")
      .attr("x", function (d) { return d.p[0]; })
      .attr("y", function (d) { return d.p[1] + 4; })
      .attr("text-anchor", "middle").text(function (d) { return d.marker || ""; });
  }

  function drawAll() {
    var panels = document.querySelectorAll("[data-geomap]");
    for (var i = 0; i < panels.length; i++) drawOne(panels[i]);
  }

  if (document.readyState === "complete") drawAll();
  else window.addEventListener("load", drawAll);
})();
`;
