// Client-side geo-map initializer, emitted as an inline <script> in the deck.
// Depends on globals: d3, topojson, WORLD_TOPO (all inlined into the deck head).
// Renders every element matching [data-geomap] from its JSON config.

export const GEOMAP_CLIENT_SCRIPT = `
(function () {
  function drawOne(panel) {
    if (panel.querySelector("svg")) return;
    var cfg;
    try { cfg = JSON.parse(panel.getAttribute("data-geomap")); }
    catch (e) { return; }
    if (!cfg) return;

    var w = panel.clientWidth, h = panel.clientHeight;
    if (!w || !h) {
      requestAnimationFrame(function () { drawOne(panel); });
      return;
    }

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

    var anchorIdx = cfg.anchor_index;
    if (cfg.distance_edges && anchorIdx != null && pts[anchorIdx]) {
      var ap = pts[anchorIdx].p;
      cfg.distance_edges.forEach(function (e) {
        var bp = pts[e.to]?.p;
        if (!bp) return;
        svg.append("line")
          .attr("x1", ap[0]).attr("y1", ap[1])
          .attr("x2", bp[0]).attr("y2", bp[1])
          .attr("stroke", "var(--dist-line, #7f8c8d)")
          .attr("stroke-width", 1.5)
          .attr("stroke-dasharray", "3 3")
          .attr("opacity", 0.85);
        var mx = (ap[0] + bp[0]) / 2;
        var my = (ap[1] + bp[1]) / 2;
        var dx = bp[0] - ap[0];
        var dy = bp[1] - ap[1];
        var len = Math.sqrt(dx * dx + dy * dy) || 1;
        var nx = -dy / len;
        var ny = dx / len;
        var lx = mx + nx * 10;
        var ly = my + ny * 10;
        var g = svg.append("g").attr("class", "dist-label");
        var text = g.append("text")
          .attr("x", lx).attr("y", ly)
          .attr("text-anchor", "middle")
          .attr("class", "dist-label-text")
          .text(e.label || "");
        var bb = text.node().getBBox();
        g.insert("rect", "text")
          .attr("class", "dist-label-bg")
          .attr("x", bb.x - 3).attr("y", bb.y - 1)
          .attr("width", bb.width + 6).attr("height", bb.height + 2)
          .attr("rx", 2);
      });
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

    function labelText(d) {
      return d.mapLabel || d.label || "";
    }

    function labelLines(d) {
      var raw = labelText(d);
      if (!raw) return [];
      if (raw.indexOf("/") !== -1) {
        return raw.split(/\\s*\\/\\s*/).map(function (s) { return s.trim(); }).filter(Boolean);
      }
      return [raw];
    }

    var node = svg.append("g").selectAll("g.node").data(pts).join("g").attr("class", "node");
    node.append("circle")
      .attr("cx", function (d) { return d.p[0]; })
      .attr("cy", function (d) { return d.p[1]; })
      .attr("r", function (d) { return d.role === "anchor" ? 16 : 13; })
      .attr("fill", function (d) { return d.color || "#c0392b"; })
      .attr("stroke", "#fff").attr("stroke-width", function (d) { return d.role === "anchor" ? 3 : 2.5; });
    node.append("text").attr("class", "node-letter")
      .attr("x", function (d) { return d.p[0]; })
      .attr("y", function (d) { return d.p[1] + 4; })
      .attr("text-anchor", "middle").text(function (d) { return d.marker || ""; });

    var labelGroups = node.append("g").attr("class", "city-label-group");
    labelGroups.each(function (d) {
      var g = d3.select(this);
      var lines = labelLines(d);
      if (!lines.length) return;
      var x = d.p[0] + (d.labelDx || 0);
      var y = d.p[1] + (d.labelDy || -18);
      var text = g.append("text").attr("class", "city-label")
        .attr("x", x).attr("y", y).attr("text-anchor", "middle");
      lines.forEach(function (line, i) {
        text.append("tspan")
          .attr("x", x)
          .attr("dy", i === 0 ? 0 : "1.15em")
          .text(line);
      });
      var bbox = text.node().getBBox();
      g.insert("rect", "text")
        .attr("class", "city-label-bg")
        .attr("x", bbox.x - 4).attr("y", bbox.y - 2)
        .attr("width", bbox.width + 8).attr("height", bbox.height + 4)
        .attr("rx", 3);
      d._labelBox = { x: bbox.x - 4, y: bbox.y - 2, w: bbox.width + 8, h: bbox.height + 4 };
    });

    // Nudge overlapping labels apart vertically.
    for (var a = 0; a < pts.length; a++) {
      for (var b = a + 1; b < pts.length; b++) {
        var ba = pts[a]._labelBox, bb = pts[b]._labelBox;
        if (!ba || !bb) continue;
        var overlapX = ba.x < bb.x + bb.w && ba.x + ba.w > bb.x;
        var overlapY = ba.y < bb.y + bb.h && ba.y + ba.h > bb.y;
        if (!overlapX || !overlapY) continue;
        var shift = Math.ceil((ba.y + ba.h - bb.y + 4) / 2);
        pts[b]._labelBox.y += shift;
        var gB = d3.select(labelGroups.nodes()[b]);
        gB.attr("transform", "translate(0," + shift + ")");
      }
    }
  }

  function drawAll() {
    var panels = document.querySelectorAll("[data-geomap]");
    for (var i = 0; i < panels.length; i++) drawOne(panels[i]);
  }

  if (document.readyState === "complete") drawAll();
  else window.addEventListener("load", drawAll);
})();
`;
