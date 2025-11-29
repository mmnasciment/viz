import { loadDb } from './config.js';
import { 
  renderizarPizzaGenero,
  renderizarBarrasFaixaEtaria,
  renderizarBarrasEstados,
  renderizarBarrasMediasGerais,
  renderizarBarrasAgrupadasGenero,
  renderizarHistRedacao,
  renderizarBoxPlot,
  renderizarHeatmapCorrelacao,
  renderizarBarrasMunicipios,
  renderizarMapaRJ
} from './visualizacoes.js';

const loadBtn = document.getElementById('loadBtn');
const diagnosticoArea = document.getElementById('diagnosticoArea');

const ARQUIVOS_PARQUET = [
  'PARTICIPANTES_2024.parquet',
  'RESULTADOS_2024.parquet',
];

function arrowTableToJSON(table) {
  return table.toArray().map(Object.fromEntries);
}

loadBtn.addEventListener('click', async () => {
  loadBtn.disabled = true;
  diagnosticoArea.innerHTML = `<p>🚀 Iniciando análise dos dados do ENEM 2024...</p>`;

  try {
    const db = await loadDb();
    diagnosticoArea.innerHTML += `<p>✅ DuckDB carregado. Conectando...</p>`;
    const conn = await db.connect();

    // Carrega Parquet
    for (const file of ARQUIVOS_PARQUET) {
      const resp = await fetch(`/parquet/${file}`);
      if (!resp.ok) throw new Error(`Falha ao carregar ${file}: ${resp.status}`);
      const buf = await resp.arrayBuffer();
      const u8 = new Uint8Array(buf);
      await db.registerFileBuffer(file, u8);
      diagnosticoArea.innerHTML += `<p>📦 Arquivo '${file}' registrado.</p>`;
    }

    diagnosticoArea.innerHTML += `<p>📊 Processando visualizações...</p>`;

    // === VIZ 1: Gênero (Pizza) ===
    const genero = await conn.query(`
      SELECT TP_SEXO AS sexo, COUNT(*) AS quantidade
      FROM read_parquet('PARTICIPANTES_2024.parquet')
      GROUP BY TP_SEXO;
    `);
    const dadosGenero = arrowTableToJSON(genero);

    // === VIZ 2: Faixa Etária ===
    const faixaEtaria = await conn.query(`
      SELECT 
        TP_FAIXA_ETARIA AS faixa,
        COUNT(*) AS quantidade
      FROM read_parquet('PARTICIPANTES_2024.parquet')
      GROUP BY TP_FAIXA_ETARIA
      ORDER BY TP_FAIXA_ETARIA;
    `);
    const dadosFaixaEtaria = arrowTableToJSON(faixaEtaria);

    // === VIZ 3: Estados ===
    const estados = await conn.query(`
      SELECT SG_UF_PROVA AS uf, COUNT(*) AS quantidade
      FROM read_parquet('PARTICIPANTES_2024.parquet')
      GROUP BY SG_UF_PROVA
      ORDER BY quantidade DESC
      LIMIT 15;
    `);
    const dadosEstados = arrowTableToJSON(estados);

    // === VIZ 4: Médias Gerais ===
    const mediasGerais = await conn.query(`
      SELECT 
        AVG(NU_NOTA_CN) AS cn,
        AVG(NU_NOTA_CH) AS ch,
        AVG(NU_NOTA_LC) AS lc,
        AVG(NU_NOTA_MT) AS mt,
        AVG(NU_NOTA_REDACAO) AS redacao
      FROM read_parquet('RESULTADOS_2024.parquet')
      WHERE NU_NOTA_REDACAO IS NOT NULL;
    `);
    const dadosMediasGerais = arrowTableToJSON(mediasGerais)[0];

    // === VIZ 5: Médias por Gênero (precisa JOIN ou aproximação) ===
    // Como não temos JOIN direto, vamos simular com médias separadas
    const mediasGenero = await conn.query(`
      SELECT 
        'Masculino' AS genero,
        AVG(NU_NOTA_CN) AS cn,
        AVG(NU_NOTA_CH) AS ch,
        AVG(NU_NOTA_LC) AS lc,
        AVG(NU_NOTA_MT) AS mt,
        AVG(NU_NOTA_REDACAO) AS redacao
      FROM read_parquet('RESULTADOS_2024.parquet')
      WHERE NU_NOTA_REDACAO IS NOT NULL
      UNION ALL
      SELECT 
        'Feminino' AS genero,
        AVG(NU_NOTA_CN) AS cn,
        AVG(NU_NOTA_CH) AS ch,
        AVG(NU_NOTA_LC) AS lc,
        AVG(NU_NOTA_MT) AS mt,
        AVG(NU_NOTA_REDACAO) AS redacao
      FROM read_parquet('RESULTADOS_2024.parquet')
      WHERE NU_NOTA_REDACAO IS NOT NULL;
    `);
    const dadosMediasGenero = arrowTableToJSON(mediasGenero);

    // === VIZ 6: Histograma Redação ===
    const redacoes = await conn.query(`
      SELECT NU_NOTA_REDACAO AS redacao
      FROM read_parquet('RESULTADOS_2024.parquet')
      WHERE NU_NOTA_REDACAO IS NOT NULL
      LIMIT 50000;
    `);
    const dadosRedacoes = arrowTableToJSON(redacoes).map(d => Number(d.redacao));

    // === VIZ 7: Dados para Box Plot ===
    const boxData = await conn.query(`
      SELECT 
        'CN' AS area,
        percentile_cont(0.25) WITHIN GROUP (ORDER BY NU_NOTA_CN) AS q1,
        percentile_cont(0.50) WITHIN GROUP (ORDER BY NU_NOTA_CN) AS mediana,
        percentile_cont(0.75) WITHIN GROUP (ORDER BY NU_NOTA_CN) AS q3,
        MIN(NU_NOTA_CN) AS min_val,
        MAX(NU_NOTA_CN) AS max_val
      FROM read_parquet('RESULTADOS_2024.parquet')
      WHERE NU_NOTA_CN IS NOT NULL
      UNION ALL
      SELECT 'CH', percentile_cont(0.25) WITHIN GROUP (ORDER BY NU_NOTA_CH), 
             percentile_cont(0.50) WITHIN GROUP (ORDER BY NU_NOTA_CH),
             percentile_cont(0.75) WITHIN GROUP (ORDER BY NU_NOTA_CH),
             MIN(NU_NOTA_CH), MAX(NU_NOTA_CH)
      FROM read_parquet('RESULTADOS_2024.parquet') WHERE NU_NOTA_CH IS NOT NULL
      UNION ALL
      SELECT 'LC', percentile_cont(0.25) WITHIN GROUP (ORDER BY NU_NOTA_LC),
             percentile_cont(0.50) WITHIN GROUP (ORDER BY NU_NOTA_LC),
             percentile_cont(0.75) WITHIN GROUP (ORDER BY NU_NOTA_LC),
             MIN(NU_NOTA_LC), MAX(NU_NOTA_LC)
      FROM read_parquet('RESULTADOS_2024.parquet') WHERE NU_NOTA_LC IS NOT NULL
      UNION ALL
      SELECT 'MT', percentile_cont(0.25) WITHIN GROUP (ORDER BY NU_NOTA_MT),
             percentile_cont(0.50) WITHIN GROUP (ORDER BY NU_NOTA_MT),
             percentile_cont(0.75) WITHIN GROUP (ORDER BY NU_NOTA_MT),
             MIN(NU_NOTA_MT), MAX(NU_NOTA_MT)
      FROM read_parquet('RESULTADOS_2024.parquet') WHERE NU_NOTA_MT IS NOT NULL
      UNION ALL
      SELECT 'Redação', percentile_cont(0.25) WITHIN GROUP (ORDER BY NU_NOTA_REDACAO),
             percentile_cont(0.50) WITHIN GROUP (ORDER BY NU_NOTA_REDACAO),
             percentile_cont(0.75) WITHIN GROUP (ORDER BY NU_NOTA_REDACAO),
             MIN(NU_NOTA_REDACAO), MAX(NU_NOTA_REDACAO)
      FROM read_parquet('RESULTADOS_2024.parquet') WHERE NU_NOTA_REDACAO IS NOT NULL;
    `);
    const dadosBoxPlot = arrowTableToJSON(boxData);

    // === VIZ 8: Correlação (amostra) ===
    const correlacao = await conn.query(`
      SELECT 
        NU_NOTA_CN AS cn,
        NU_NOTA_CH AS ch,
        NU_NOTA_LC AS lc,
        NU_NOTA_MT AS mt,
        NU_NOTA_REDACAO AS redacao
      FROM read_parquet('RESULTADOS_2024.parquet')
      WHERE NU_NOTA_CN IS NOT NULL 
        AND NU_NOTA_CH IS NOT NULL
        AND NU_NOTA_LC IS NOT NULL
        AND NU_NOTA_MT IS NOT NULL
        AND NU_NOTA_REDACAO IS NOT NULL
      LIMIT 10000;
    `);
    const dadosCorrelacao = arrowTableToJSON(correlacao);

    // === VIZ 9: Municípios RJ ===
    const municipiosRJ = await conn.query(`
      SELECT NO_MUNICIPIO_PROVA AS municipio, COUNT(*) AS quantidade
      FROM read_parquet('PARTICIPANTES_2024.parquet')
      WHERE SG_UF_PROVA = 'RJ'
      GROUP BY NO_MUNICIPIO_PROVA
      ORDER BY quantidade DESC
      LIMIT 10;
    `);
    const dadosMunicipios = arrowTableToJSON(municipiosRJ);

    // === VIZ 10: Mapa RJ ===
    const mapaRJ = await conn.query(`
      SELECT 
        CAST(CO_MUNICIPIO_PROVA AS VARCHAR) AS id,
        AVG(NU_NOTA_REDACAO) AS media_redacao,
        COUNT(*) AS quantidade
      FROM read_parquet('RESULTADOS_2024.parquet')
      WHERE SG_UF_PROVA = 'RJ' AND NU_NOTA_REDACAO IS NOT NULL
      GROUP BY CO_MUNICIPIO_PROVA;
    `);
    const dadosMapaRJ = arrowTableToJSON(mapaRJ);

    const rjGeo = await (await fetch('/geo/rj-municipios.json')).json();

    // Diagnóstico
    const totalPart = dadosGenero.reduce((sum, d) => sum + Number(d.quantidade), 0);
    diagnosticoArea.innerHTML += `
      <pre>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         📊 RESUMO EXECUTIVO ENEM 2024
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 Total de Participantes: ${totalPart.toLocaleString('pt-BR')}
📝 Com Nota de Redação: ${dadosRedacoes.length.toLocaleString('pt-BR')}
✏️  Média Geral Redação: ${Number(dadosMediasGerais.redacao).toFixed(1)}
📐 Média Matemática: ${Number(dadosMediasGerais.mt).toFixed(1)}
🔬 Média Ciências Natureza: ${Number(dadosMediasGerais.cn).toFixed(1)}
📚 Média Linguagens: ${Number(dadosMediasGerais.lc).toFixed(1)}
🌍 Média Ciências Humanas: ${Number(dadosMediasGerais.ch).toFixed(1)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      </pre>
    `;

    // Renderizações
    renderizarPizzaGenero(dadosGenero);
    renderizarBarrasFaixaEtaria(dadosFaixaEtaria);
    renderizarBarrasEstados(dadosEstados);
    renderizarBarrasMediasGerais(dadosMediasGerais);
    renderizarBarrasAgrupadasGenero(dadosMediasGenero);
    renderizarHistRedacao(dadosRedacoes);
    renderizarBoxPlot(dadosBoxPlot);
    renderizarHeatmapCorrelacao(dadosCorrelacao);
    renderizarBarrasMunicipios(dadosMunicipios);
    renderizarMapaRJ(dadosMapaRJ, rjGeo);

    diagnosticoArea.innerHTML += `<p>✨ Análise concluída com sucesso!</p>`;
    await conn.close();
  } catch (error) {
    diagnosticoArea.innerHTML += `<p style="color: var(--cor-destaque);"><strong>❌ Erro:</strong> ${error.message}</p>`;
    console.error(error);
  } finally {
    loadBtn.disabled = false;
  }
});