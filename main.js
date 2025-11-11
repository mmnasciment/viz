import { loadDb } from './config.js';
import { 
  renderizarContagemDiaria, 
  renderizarKpisAgregados // Removemos renderizarTiposPagamento e renderizarHeatmap
} from './visualizacoes.js';

const loadBtn = document.getElementById('loadBtn');
const diagnosticoArea = document.getElementById('diagnosticoArea');

const ARQUIVOS_PARQUET = [
  'yellow_tripdata_2018-12.parquet',
  'yellow_tripdata_2020-12.parquet',
  'yellow_tripdata_2022-12.parquet',
];

function arrowTableToJSON(table) {
  return table.toArray().map(Object.fromEntries);
}

function formatarDiagnostico(diagData) {
  if (!diagData || diagData.length === 0) {
    return "<p>Nenhum dado encontrado.</p>";
  }
  const { min_data, max_data, total_corridas, anos_unicos } = diagData[0];
  return `
    <pre>
----------------------------------
|       Diagnóstico dos Dados    |
----------------------------------
Total de Corridas: ${total_corridas.toLocaleString('pt-BR')}
Período Encontrado: ${new Date(min_data).toLocaleDateString('pt-BR')} a ${new Date(max_data).toLocaleDateString('pt-BR')}
Anos na Amostra: ${anos_unicos}
    </pre>
  `;
}

loadBtn.addEventListener('click', async () => {
  loadBtn.disabled = true;
  diagnosticoArea.innerHTML = `<p>Iniciando o DuckDB... (isso pode levar alguns segundos)</p>`;

  try {
    const db = await loadDb();
    diagnosticoArea.innerHTML += `<p>DuckDB carregado. Iniciando conexão...</p>`;
    
    const conn = await db.connect();
    diagnosticoArea.innerHTML += `<p>Conexão estabelecida. Registrando arquivos...</p>`;

    // --- SUA SOLUÇÃO (ÓTIMA!) ---
    for (const file of ARQUIVOS_PARQUET) {
      const resp = await fetch(`/parquet/${file}`);
      const buf = await resp.arrayBuffer();
      await db.registerFileBuffer(file, new Uint8Array(buf));
      diagnosticoArea.innerHTML += `<p>Arquivo '${file}' carregado via Buffer.</p>`;
    }
    // ----------------------------

    diagnosticoArea.innerHTML += `<p>Arquivos registrados. Criando tabela 'taxis' unificada...</p>`;
    
    // 3. Criar a tabela 'taxis' (QUERY MODIFICADA)
    // Selecionamos APENAS as colunas que existem
    const fileNames = ARQUIVOS_PARQUET.map(f => `'${f}'`);
    const createTableQuery = `
      CREATE TABLE taxis AS 
      SELECT 
        tpep_pickup_datetime,
        tpep_dropoff_datetime,
        trip_distance,
        tip_amount,
        strftime(tpep_pickup_datetime, '%Y') AS ano,
        strftime(tpep_pickup_datetime, '%m-%d') AS dia_mes,
        (epoch(tpep_dropoff_datetime) - epoch(tpep_pickup_datetime)) / 60.0 AS duracao_minutos
      FROM read_parquet([${fileNames.join(', ')}])
      WHERE strftime(tpep_pickup_datetime, '%m') = '12'
        AND strftime(tpep_pickup_datetime, '%Y') IN ('2018', '2020', '2022');
    `;
    await conn.query(createTableQuery);
    diagnosticoArea.innerHTML += `<p>Tabela 'taxis' criada com sucesso.</p>`;

    // 4. Executar Query de Diagnóstico
    diagnosticoArea.innerHTML += `<p>Executando diagnóstico...</p>`;
    const diagQuery = `
      SELECT 
        MIN(tpep_pickup_datetime) AS min_data,
        MAX(tpep_pickup_datetime) AS max_data,
        COUNT(*) AS total_corridas,
        string_agg(DISTINCT ano, ', ') AS anos_unicos
      FROM taxis;
    `;
    const diagResult = await conn.query(diagQuery);
    const diagData = arrowTableToJSON(diagResult);
    diagnosticoArea.innerHTML += formatarDiagnostico(diagData);

    // 5. Executar Query Analítica 1: Corridas diárias
    diagnosticoArea.innerHTML += `<p>Executando consulta analítica 1 (corridas diárias)...</p>`;
    const timeSeriesQuery = `
      SELECT 
        ano,
        dia_mes,
        COUNT(*) AS num_corridas
      FROM taxis
      GROUP BY ano, dia_mes
      ORDER BY ano, dia_mes;
    `;
    const tsResult = await conn.query(timeSeriesQuery);
    const tsData = arrowTableToJSON(tsResult);
    
    // 6. QUERY REMOVIDA (paymentQuery)

    // 7. Executar Query Analítica 3: KPIs Agregados (MODIFICADA)
    diagnosticoArea.innerHTML += `<p>Executando consulta analítica 2 (KPIs)...</p>`;
    const queryKPIs = `
      SELECT 
        ano,
        AVG(trip_distance) AS distancia_media,
        AVG(tip_amount) AS gorjeta_media, -- Trocamos 'receita_media' por 'gorjeta_media'
        AVG(duracao_minutos) AS duracao_media
        -- Removemos 'passageiros_media'
      FROM taxis
      WHERE duracao_minutos BETWEEN 1 AND 240
        AND trip_distance < 100
        AND tip_amount BETWEEN 0 AND 1000
      GROUP BY ano
      ORDER BY ano;
    `;
    const kpiResult = await conn.query(queryKPIs);
    const kpiData = arrowTableToJSON(kpiResult);

    // 8. QUERY REMOVIDA (queryHeatmap)

    // 9. Renderizar Visualizações D3.js
    diagnosticoArea.innerHTML += `<p>Renderizando visualizações...</p>`;
    renderizarContagemDiaria(tsData);
    renderizarKpisAgregados(kpiData); // Chamada modificada
    diagnosticoArea.innerHTML += `<p>Análise concluída!</p>`;

    // 10. Limpar conexão
    await conn.close();

  } catch (error) {
    diagnosticoArea.innerHTML += `<p style="color: red;"><strong>Erro:</strong> ${error.message}</p>`;
    console.error(error);
  } finally {
    loadBtn.disabled = false;
  }
});