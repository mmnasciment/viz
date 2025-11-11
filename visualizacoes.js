/**
 * visualizacoes.js
 */

import * as d3 from 'd3';

// Função para criar um tooltip reutilizável
function criarTooltip(container) {
  return d3.select(container)
    .append("div")
    .attr("class", "d3-tooltip")
    .style("opacity", 0);
}

/**
 * Gráfico 1: Gráfico de Linhas Múltiplas (Corridas Diárias)
 */
export function renderizarContagemDiaria(data) {
  const containerId = "#vizContagemDiaria";
  d3.select(containerId).select("svg").remove(); // Limpa o SVG anterior

  const margin = { top: 20, right: 30, bottom: 40, left: 70 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select(containerId)
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const dataAgrupada = d3.group(data, d => d.ano);

  const x = d3.scaleTime()
    .domain(d3.extent(data, d => d3.timeParse("%m-%d")(d.dia_mes)))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => Number(d.num_corridas))]) 
    .range([height, 0]);

  svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(d3.timeDay.every(5)).tickFormat(d3.timeFormat("%d/%m")));

  svg.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y).tickFormat(d => d / 1000 + "k")); 

  const color = d3.scaleOrdinal()
    .domain(dataAgrupada.keys())
    .range(["#0072B2", "#E69F00", "#D55E00"]); 

  svg.selectAll(".line")
    .data(dataAgrupada)
    .join("path")
      .attr("class", "line")
      .style("stroke", d => color(d[0]))
      .attr("d", d => {
        return d3.line()
          .x(p => x(d3.timeParse("%m-%d")(p.dia_mes)))
          .y(p => y(Number(p.num_corridas)))
          (d[1]) 
      });

  const legenda = svg.selectAll(".legenda")
    .data(dataAgrupada.keys())
    .enter()
    .append("g")
      .attr("class", "legenda")
      .attr("transform", (d, i) => `translate(0,${i * 20})`);
  
  legenda.append("rect")
    .attr("x", width - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", color);
  
  legenda.append("text")
    .attr("x", width - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(d => `Ano: ${d}`);
}

/**
 * Gráfico 2: FUNÇÃO REMOVIDA (renderizarTiposPagamento)
 */

/**
 * Gráfico 3: Múltiplos Gráficos de Barras (KPIs) - MODIFICADO
 */
export function renderizarKpisAgregados(data) {
  const containerId = "#vizKPIs";
  d3.select(containerId).selectAll("svg").remove(); 

  // Métricas que queremos plotar (MODIFICADO)
  const metricas = [
    { key: 'distancia_media', label: 'Distância Média (milhas)' },
    { key: 'gorjeta_media', label: 'Gorjeta Média ($)' }, // Trocado
    { key: 'duracao_media', label: 'Duração Média (min)' }
    // Removido: 'passageiros_media'
  ];

  // Cores por ano
  const color = d3.scaleOrdinal()
    .domain(["2018", "2020", "2022"])
    .range(["#0072B2", "#E69F00", "#D55E00"]);

  // Cria um gráfico para cada métrica
  metricas.forEach(metrica => {
    // Configurações de um gráfico pequeno
    const margin = { top: 30, right: 20, bottom: 40, left: 60 };
    // Largura ajustada para 3 gráficos
    const width = 260 - margin.left - margin.right; 
    const height = 250 - margin.top - margin.bottom;

    const svg = d3.select(containerId)
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Título do Gráfico
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text(metrica.label);
      
    // Define os Eixos
    const x = d3.scaleBand()
      .domain(data.map(d => d.ano))
      .range([0, width])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => Number(d[metrica.key])) * 1.1]) 
      .range([height, 0]);

    // Adiciona Eixos
    svg.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".2f"))); 

    // Adiciona as Barras
    svg.selectAll(".bar")
      .data(data)
      .join("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.ano))
        .attr("y", d => y(Number(d[metrica.key])))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(Number(d[metrica.key])))
        .attr("fill", d => color(d.ano));
  });
}

/**
 * Gráfico 4: FUNÇÃO REMOVIDA (renderizarHeatmap)
 */