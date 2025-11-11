/**
 * NOVO ARQUIVO: visualizacoes.js
 * Contém o código D3.js para renderizar os gráficos.
 */

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

  // Configurações do Gráfico
  const margin = { top: 20, right: 30, bottom: 40, left: 70 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select(containerId)
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  // Agrupa os dados por 'ano'
  const dataAgrupada = d3.group(data, d => d.ano);

  // Define os Eixos
  // Ajuste para parsear o dia_mes (ex: "12-01") para datas
  const x = d3.scaleTime()
    .domain(d3.extent(data, d => d3.timeParse("%m-%d")(d.dia_mes)))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => +d.num_corridas)]) // Garante que num_corridas é número
    .range([height, 0]);

  // Adiciona Eixos ao SVG
  svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(d3.timeDay.every(5)).tickFormat(d3.timeFormat("%d/%m")));

  svg.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y).tickFormat(d => d / 1000 + "k")); // Formata como "100k"

  // Esquema de Cores (um para cada ano)
  const color = d3.scaleOrdinal()
    .domain(dataAgrupada.keys())
    .range(["#0072B2", "#E69F00", "#D55E00"]); // Cores distintas

  // Adiciona as Linhas
  svg.selectAll(".line")
    .data(dataAgrupada)
    .join("path")
      .attr("class", "line")
      .style("stroke", d => color(d[0]))
      .attr("d", d => {
        return d3.line()
          .x(p => x(d3.timeParse("%m-%d")(p.dia_mes)))
          .y(p => y(+p.num_corridas))
          (d[1]) // d[1] é o array de dados para aquele ano
      });

  // Legenda
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
 * Gráfico 2: Gráfico de Barras Agrupadas (Métodos de Pagamento)
 */
export function renderizarTiposPagamento(data) {
  const containerId = "#vizTiposPagamento";
  d3.select(containerId).select("svg").remove(); // Limpa o SVG anterior

  // Configurações do Gráfico
  const margin = { top: 20, right: 20, bottom: 40, left: 70 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3.select(containerId)
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
  // Nomes dos grupos principais (Anos)
  const anos = Array.from(new Set(data.map(d => d.ano))).sort();
  // Nomes dos subgrupos (Métodos de Pagamento)
  const metodos = Array.from(new Set(data.map(d => d.metodo_pagamento))).sort();
  
  // Define os Eixos
  const x0 = d3.scaleBand()
    .domain(anos)
    .rangeRound([0, width])
    .paddingInner(0.1);

  const x1 = d3.scaleBand()
    .domain(metodos)
    .rangeRound([0, x0.bandwidth()])
    .padding(0.05);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => +d.num_corridas)]) // Garante que é número
    .range([height, 0]);

  // Esquema de Cores
  const color = d3.scaleOrdinal()
    .domain(metodos)
    .range(["#1f77b4", "#ff7f0e", "#2ca02c"]); // Cores para Cartão, Dinheiro, Outros

  // Adiciona Eixos
  svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x0));

  svg.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y).tickFormat(d => d / 1000000 + "M")); // Formata como "1.5M"

  // Tooltip
  const tooltip = criarTooltip(containerId);

  // Adiciona as Barras Agrupadas
  svg.append("g")
    .selectAll("g")
    .data(anos)
    .join("g")
      .attr("transform", d => `translate(${x0(d)},0)`)
    .selectAll("rect")
    // Filtra os dados para o ano correto
    .data(ano => data.filter(d => d.ano === ano))
    .join("rect")
      .attr("x", d => x1(d.metodo_pagamento))
      .attr("y", d => y(+d.num_corridas))
      .attr("width", x1.bandwidth())
      .attr("height", d => height - y(+d.num_corridas))
      .attr("fill", d => color(d.metodo_pagamento))
      .on("mouseover", (event, d) => {
        tooltip.style("visibility", "visible")
               .html(`<strong>${d.ano} - ${d.metodo_pagamento}</strong><br>${(+d.num_corridas).toLocaleString('pt-BR')} corridas`);
      })
      .on("mousemove", (event) => {
        tooltip.style("top", (event.pageY - 10) + "px")
               .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      });

  // Legenda
  const legenda = svg.selectAll(".legenda")
    .data(metodos)
    .enter()
    .append("g")
      .attr("class", "legenda")
      .attr("transform", (d, i) => `translate(${width - 150},${i * 20})`);
  
  legenda.append("rect")
    .attr("x", 0)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", color);
  
  legenda.append("text")
    .attr("x", 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "start")
    .text(d => d);
}