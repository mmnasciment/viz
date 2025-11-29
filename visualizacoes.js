/**
 * visualizacoes.js
 */

import * as d3 from 'd3';

function criarTooltip(container) {
  return d3.select(container)
    .append("div")
    .attr("class", "d3-tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("pointer-events", "none");
}

// === VIZ 1: Pizza - Gênero ===
export function renderizarPizzaGenero(data) {
  const containerId = "#viz1Genero";
  d3.select(containerId).selectAll("*").remove();

  const sexoLabel = (s) => (s === 'M' ? 'Masculino' : s === 'F' ? 'Feminino' : String(s));
  const cores = { M: '#3498DB', F: '#E74C3C' };

  const width = 400;
  const height = 400;
  const radius = Math.min(width, height) / 2;

  const svg = d3.select(containerId)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  const pie = d3.pie().value(d => Number(d.quantidade));
  const arc = d3.arc().innerRadius(0).outerRadius(radius - 20);
  const labelArc = d3.arc().innerRadius(radius - 80).outerRadius(radius - 80);

  const tooltip = criarTooltip(containerId);

  const arcs = svg.selectAll("arc")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "arc");

  arcs.append("path")
    .attr("d", arc)
    .attr("fill", d => cores[d.data.sexo] || '#95A5A6')
    .attr("stroke", "white")
    .attr("stroke-width", 2)
    .on("mousemove", (event, d) => {
      const total = d3.sum(data, x => Number(x.quantidade));
      const pct = ((Number(d.data.quantidade) / total) * 100).toFixed(1);
      tooltip.style("opacity", 1)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px")
        .html(`<strong>${sexoLabel(d.data.sexo)}</strong><br>${Number(d.data.quantidade).toLocaleString('pt-BR')} (${pct}%)`);
    })
    .on("mouseleave", () => tooltip.style("opacity", 0));

  arcs.append("text")
    .attr("transform", d => `translate(${labelArc.centroid(d)})`)
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .attr("font-size", "14px")
    .attr("font-weight", "bold")
    .text(d => {
      const pct = ((Number(d.data.quantidade) / d3.sum(data, x => Number(x.quantidade))) * 100).toFixed(0);
      return `${pct}%`;
    });
}

// === VIZ 2: Barras - Faixa Etária ===
export function renderizarBarrasFaixaEtaria(data) {
  const containerId = "#viz2Idade";
  d3.select(containerId).selectAll("*").remove();

  const faixaLabels = {
    1: "< 17", 2: "17", 3: "18", 4: "19", 5: "20", 6: "21", 7: "22", 8: "23", 9: "24", 10: "25",
    11: "26-30", 12: "31-35", 13: "36-40", 14: "41-45", 15: "46-50", 16: "51-55", 17: "56-60", 18: "61-65", 19: "66-70", 20: "> 70"
  };

  const margin = { top: 20, right: 20, bottom: 80, left: 60 };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select(containerId)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
    .domain(data.map(d => faixaLabels[d.faixa] || d.faixa))
    .range([0, width])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => Number(d.quantidade))])
    .nice()
    .range([height, 0]);

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("transform", "rotate(-45)");

  svg.append("g").call(d3.axisLeft(y).tickFormat(d => d3.format(".2s")(d)));

  const tooltip = criarTooltip(containerId);

  svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => x(faixaLabels[d.faixa] || d.faixa))
    .attr("y", d => y(Number(d.quantidade)))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(Number(d.quantidade)))
    .attr("fill", "#27AE60")
    .on("mousemove", (event, d) => {
      tooltip.style("opacity", 1)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px")
        .html(`<strong>${faixaLabels[d.faixa]}</strong><br>${Number(d.quantidade).toLocaleString('pt-BR')} participantes`);
    })
    .on("mouseleave", () => tooltip.style("opacity", 0));
}

// === VIZ 3: Barras Horizontais - Estados ===
export function renderizarBarrasEstados(data) {
  const containerId = "#viz3Estados";
  d3.select(containerId).selectAll("*").remove();

  const margin = { top: 20, right: 40, bottom: 40, left: 60 };
  const width = 900 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const svg = d3.select(containerId)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain([0, d3.max(data, d => Number(d.quantidade))])
    .nice()
    .range([0, width]);

  const y = d3.scaleBand()
    .domain(data.map(d => d.uf))
    .range([0, height])
    .padding(0.15);

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d => d3.format(".2s")(d)));

  svg.append("g").call(d3.axisLeft(y));

  const tooltip = criarTooltip(containerId);
  const colorScale = d3.scaleSequential(d3.interpolateBlues)
    .domain([0, d3.max(data, d => Number(d.quantidade))]);

  svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", d => y(d.uf))
    .attr("width", d => x(Number(d.quantidade)))
    .attr("height", y.bandwidth())
    .attr("fill", d => colorScale(Number(d.quantidade)))
    .on("mousemove", (event, d) => {
      tooltip.style("opacity", 1)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px")
        .html(`<strong>${d.uf}</strong><br>${Number(d.quantidade).toLocaleString('pt-BR')} participantes`);
    })
    .on("mouseleave", () => tooltip.style("opacity", 0));

  svg.selectAll(".label")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "label")
    .attr("x", d => x(Number(d.quantidade)) + 5)
    .attr("y", d => y(d.uf) + y.bandwidth() / 2)
    .attr("dy", ".35em")
    .attr("font-size", "11px")
    .attr("fill", "#2C3E50")
    .text(d => d3.format(".3s")(Number(d.quantidade)));
}

// === VIZ 4: Barras - Médias Gerais ===
export function renderizarBarrasMediasGerais(dados) {
  const containerId = "#viz4MediasGerais";
  d3.select(containerId).selectAll("*").remove();

  const data = [
    { area: 'Ciências Natureza', media: Number(dados.cn), cor: '#9B59B6' },
    { area: 'Ciências Humanas', media: Number(dados.ch), cor: '#F39C12' },
    { area: 'Linguagens', media: Number(dados.lc), cor: '#1ABC9C' },
    { area: 'Matemática', media: Number(dados.mt), cor: '#E67E22' },
    { area: 'Redação', media: Number(dados.redacao), cor: '#34495E' }
  ];

  const margin = { top: 30, right: 20, bottom: 80, left: 60 };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select(containerId)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
    .domain(data.map(d => d.area))
    .range([0, width])
    .padding(0.3);

  const y = d3.scaleLinear()
    .domain([0, 1000])
    .range([height, 0]);

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("transform", "rotate(-45)");

  svg.append("g").call(d3.axisLeft(y));

  const tooltip = criarTooltip(containerId);

  svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => x(d.area))
    .attr("y", d => y(d.media))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d.media))
    .attr("fill", d => d.cor)
    .on("mousemove", (event, d) => {
      tooltip.style("opacity", 1)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px")
        .html(`<strong>${d.area}</strong><br>Média: ${d.media.toFixed(1)}`);
    })
    .on("mouseleave", () => tooltip.style("opacity", 0));

  svg.selectAll(".value-label")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "value-label")
    .attr("x", d => x(d.area) + x.bandwidth() / 2)
    .attr("y", d => y(d.media) - 5)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .attr("fill", "#2C3E50")
    .text(d => d.media.toFixed(1));
}

// === VIZ 5: Barras Agrupadas - Médias por Gênero ===
export function renderizarBarrasAgrupadasGenero(data) {
  const containerId = "#viz5MediasGenero";
  d3.select(containerId).selectAll("*").remove();

  const areas = ['cn', 'ch', 'lc', 'mt', 'redacao'];
  const areaLabels = { cn: 'CN', ch: 'CH', lc: 'LC', mt: 'MT', redacao: 'Red' };

  const margin = { top: 30, right: 100, bottom: 80, left: 60 };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select(containerId)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x0 = d3.scaleBand()
    .domain(areas.map(a => areaLabels[a]))
    .range([0, width])
    .padding(0.2);

  const x1 = d3.scaleBand()
    .domain(data.map(d => d.genero))
    .range([0, x0.bandwidth()])
    .padding(0.05);

  const y = d3.scaleLinear()
    .domain([0, 1000])
    .range([height, 0]);

  const color = d3.scaleOrdinal()
    .domain(['Masculino', 'Feminino'])
    .range(['#3498DB', '#E74C3C']);

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x0));

  svg.append("g").call(d3.axisLeft(y));

  const tooltip = criarTooltip(containerId);

  areas.forEach(area => {
    svg.selectAll(`.bar-${area}`)
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => x0(areaLabels[area]) + x1(d.genero))
      .attr("y", d => y(Number(d[area])))
      .attr("width", x1.bandwidth())
      .attr("height", d => height - y(Number(d[area])))
      .attr("fill", d => color(d.genero))
      .on("mousemove", (event, d) => {
        tooltip.style("opacity", 1)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px")
          .html(`<strong>${areaLabels[area]} - ${d.genero}</strong><br>Média: ${Number(d[area]).toFixed(1)}`);
      })
      .on("mouseleave", () => tooltip.style("opacity", 0));
  });

  const legend = svg.append("g").attr("transform", `translate(${width + 10}, 0)`);
  ['Masculino', 'Feminino'].forEach((g, i) => {
    legend.append("rect")
      .attr("y", i * 25).attr("width", 18).attr("height", 18).attr("fill", color(g));
    legend.append("text")
      .attr("x", 24).attr("y", i * 25 + 9).attr("dy", ".35em")
      .style("font-size", "12px").text(g);
  });
}

// === VIZ 6: Histograma - Redação ===
export function renderizarHistRedacao(redacoes) {
  const containerId = "#viz6HistRedacao";
  d3.select(containerId).selectAll("*").remove();

  const margin = { top: 20, right: 20, bottom: 50, left: 60 };
  const width = 900 - margin.left - margin.right;
  const height = 350 - margin.top - margin.bottom;

  const svg = d3.select(containerId)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([0, 1000]).range([0, width]);
  const bins = d3.bin().domain(x.domain()).thresholds(30)(redacoes);
  const y = d3.scaleLinear().domain([0, d3.max(bins, d => d.length)]).nice().range([height, 0]);

  svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));
  svg.append("g").call(d3.axisLeft(y).tickFormat(d => d3.format(".2s")(d)));

  const tooltip = criarTooltip(containerId);

  svg.selectAll("rect")
    .data(bins)
    .enter()
    .append("rect")
    .attr("x", d => x(d.x0) + 1)
    .attr("y", d => y(d.length))
    .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 2))
    .attr("height", d => height - y(d.length))
    .attr("fill", "#3498DB")
    .attr("opacity", 0.8)
    .on("mousemove", (event, d) => {
      tooltip.style("opacity", 1)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px")
        .html(`Faixa: ${d.x0?.toFixed(0)}–${d.x1?.toFixed(0)}<br>Qtd: ${d.length.toLocaleString('pt-BR')}`);
    })
    .on("mouseleave", () => tooltip.style("opacity", 0));

  const media = d3.mean(redacoes);
  svg.append("line")
    .attr("x1", x(media)).attr("x2", x(media))
    .attr("y1", 0).attr("y2", height)
    .attr("stroke", "#E74C3C").attr("stroke-width", 2).attr("stroke-dasharray", "5,5");

  svg.append("text")
    .attr("x", x(media) + 5).attr("y", 15)
    .attr("fill", "#E74C3C").attr("font-size", "12px")
    .text(`Média: ${media.toFixed(1)}`);
}

// === VIZ 7: Box Plot ===
export function renderizarBoxPlot(data) {
  const containerId = "#viz7BoxPlot";
  d3.select(containerId).selectAll("*").remove();

  const margin = { top: 30, right: 20, bottom: 60, left: 60 };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select(containerId)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand().domain(data.map(d => d.area)).range([0, width]).padding(0.3);
  const y = d3.scaleLinear().domain([0, 1000]).range([height, 0]);

  svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));
  svg.append("g").call(d3.axisLeft(y));

  const tooltip = criarTooltip(containerId);

  data.forEach(d => {
    const q1 = Number(d.q1), mediana = Number(d.mediana), q3 = Number(d.q3);
    const min_val = Number(d.min_val), max_val = Number(d.max_val);
    const xPos = x(d.area) + x.bandwidth() / 2;

    svg.append("line")
      .attr("x1", xPos).attr("x2", xPos)
      .attr("y1", y(min_val)).attr("y2", y(max_val))
      .attr("stroke", "#2C3E50").attr("stroke-width", 1.5);

    svg.append("rect")
      .attr("x", x(d.area))
      .attr("y", y(q3))
      .attr("width", x.bandwidth())
      .attr("height", y(q1) - y(q3))
      .attr("fill", "#3498DB").attr("opacity", 0.7)
      .attr("stroke", "#2C3E50").attr("stroke-width", 1.5);

    svg.append("line")
      .attr("x1", x(d.area)).attr("x2", x(d.area) + x.bandwidth())
      .attr("y1", y(mediana)).attr("y2", y(mediana))
      .attr("stroke", "#E74C3C").attr("stroke-width", 3);

    svg.append("rect")
      .attr("x", x(d.area)).attr("y", 0)
      .attr("width", x.bandwidth()).attr("height", height)
      .attr("fill", "transparent")
      .on("mousemove", (event) => {
        tooltip.style("opacity", 1)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px")
          .html(`<strong>${d.area}</strong><br>Mín: ${min_val.toFixed(1)}<br>Q1: ${q1.toFixed(1)}<br>Mediana: ${mediana.toFixed(1)}<br>Q3: ${q3.toFixed(1)}<br>Máx: ${max_val.toFixed(1)}`);
      })
      .on("mouseleave", () => tooltip.style("opacity", 0));
  });
}

// === VIZ 8: Heatmap Correlação ===
export function renderizarHeatmapCorrelacao(data) {
  const containerId = "#viz8Correlacao";
  d3.select(containerId).selectAll("*").remove();

  const vars = ['cn', 'ch', 'lc', 'mt', 'redacao'];
  const labels = { cn: 'CN', ch: 'CH', lc: 'LC', mt: 'MT', redacao: 'Red' };
  const matrix = [];

  vars.forEach(v1 => {
    vars.forEach(v2 => {
      const corr = calcularCorrelacao(data.map(d => Number(d[v1])), data.map(d => Number(d[v2])));
      matrix.push({ x: labels[v2], y: labels[v1], value: corr });
    });
  });

  const margin = { top: 50, right: 20, bottom: 50, left: 50 };
  const size = 70;
  const width = size * vars.length;
  const height = size * vars.length;

  const svg = d3.select(containerId)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand().domain(vars.map(v => labels[v])).range([0, width]);
  const y = d3.scaleBand().domain(vars.map(v => labels[v])).range([0, height]);
  const color = d3.scaleSequential(d3.interpolateRdYlGn).domain([0, 1]);
  const tooltip = criarTooltip(containerId);

  svg.selectAll("rect")
    .data(matrix)
    .enter()
    .append("rect")
    .attr("x", d => x(d.x)).attr("y", d => y(d.y))
    .attr("width", x.bandwidth()).attr("height", y.bandwidth())
    .attr("fill", d => color(d.value))
    .attr("stroke", "white").attr("stroke-width", 2)
    .on("mousemove", (event, d) => {
      tooltip.style("opacity", 1)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px")
        .html(`<strong>${d.y} × ${d.x}</strong><br>Correlação: ${d.value.toFixed(3)}`);
    })
    .on("mouseleave", () => tooltip.style("opacity", 0));

  svg.selectAll(".label-text")
    .data(matrix)
    .enter()
    .append("text")
    .attr("x", d => x(d.x) + x.bandwidth() / 2)
    .attr("y", d => y(d.y) + y.bandwidth() / 2)
    .attr("text-anchor", "middle").attr("dy", ".35em")
    .attr("font-size", "11px")
    .attr("fill", d => d.value > 0.5 ? "white" : "#2C3E50")
    .text(d => d.value.toFixed(2));

  svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).tickSize(0));
  svg.append("g").call(d3.axisLeft(y).tickSize(0));
}

function calcularCorrelacao(x, y) {
  const n = x.length;
  const sumX = d3.sum(x), sumY = d3.sum(y);
  const sumXY = d3.sum(x.map((xi, i) => xi * y[i]));
  const sumX2 = d3.sum(x.map(xi => xi * xi)), sumY2 = d3.sum(y.map(yi => yi * yi));
  const num = n * sumXY - sumX * sumY;
  const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  return den === 0 ? 0 : num / den;
}

// === VIZ 9: Barras Municípios ===
export function renderizarBarrasMunicipios(data) {
  const containerId = "#viz9TopMunicipios";
  d3.select(containerId).selectAll("*").remove();

  const margin = { top: 20, right: 30, bottom: 120, left: 60 };
  const width = 900 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select(containerId)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand().domain(data.map(d => d.municipio)).range([0, width]).padding(0.2);
  const y = d3.scaleLinear().domain([0, d3.max(data, d => Number(d.quantidade))]).nice().range([height, 0]);

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("transform", "rotate(-45)");

  svg.append("g").call(d3.axisLeft(y).tickFormat(d => d3.format(".2s")(d)));

  const tooltip = criarTooltip(containerId);
  const colorScale = d3.scaleSequential(d3.interpolateGreens).domain([0, d3.max(data, d => Number(d.quantidade))]);

  svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => x(d.municipio))
    .attr("y", d => y(Number(d.quantidade)))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(Number(d.quantidade)))
    .attr("fill", d => colorScale(Number(d.quantidade)))
    .on("mousemove", (event, d) => {
      tooltip.style("opacity", 1)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px")
        .html(`<strong>${d.municipio}</strong><br>${Number(d.quantidade).toLocaleString('pt-BR')} participantes`);
    })
    .on("mouseleave", () => tooltip.style("opacity", 0));
}

// === VIZ 10: Mapa RJ ===
export function renderizarMapaRJ(agregado, geojson) {
  const containerId = "#viz10MapaRJ";
  d3.select(containerId).selectAll("*").remove();

  const byId = new Map(agregado.map(d => [String(d.id), d]));
  const values = agregado.map(d => Number(d.media_redacao)).filter(v => isFinite(v));
  const vmin = d3.min(values) || 0;
  const vmax = d3.max(values) || 1000;

  const margin = { top: 10, right: 10, bottom: 10, left: 10 };
  const width = 900 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  const svg = d3.select(containerId)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const projection = d3.geoMercator().fitSize([width, height], geojson);
  const path = d3.geoPath().projection(projection);
  const color = d3.scaleSequential(d3.interpolateYlGnBu).domain([vmin, vmax]);
  const tooltip = criarTooltip(containerId);

  svg.selectAll("path")
    .data(geojson.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", f => {
      const id = String(f.properties.id);
      const d = byId.get(id);
      return d ? color(Number(d.media_redacao)) : '#f0f0f0';
    })
    .attr("stroke", "#666").attr("stroke-width", 0.5)
    .on("mousemove", (event, f) => {
      const id = String(f.properties.id);
      const d = byId.get(id);
      const nome = f.properties.name || id;
      const media = d ? Number(d.media_redacao).toFixed(1) : 'Sem dados';
      tooltip.style("opacity", 1)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px")
        .html(`<strong>${nome}</strong><br>Média Redação: ${media}`);
    })
    .on("mouseleave", () => tooltip.style("opacity", 0));
}