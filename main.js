import { loadDb } from './config.js';
import { renderizarContagemDiaria, renderizarTiposPagamento } from './visualizacoes.js';

const loadBtn = document.getElementById('loadBtn');
const diagnosticoArea = document.getElementById('diagnosticoArea');

// --- Defina os arquivos que estão na sua pasta /parquet/ ---
const ARQUIVOS_PARQUET = [
  'yellow_tripdata_2018-12.parquet',
  'yellow_tripdata_2020-12.parquet',
  'yellow_tripdata_2022-12.parquet',
];

// Converte uma tabela Arrow para um Array de Objetos JS
function arrowTableToJSON(table) {
  return table.toArray().map(Object.fromEntries);
}

// Formata os resultados da query de diagnóstico para exibição
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

// Evento principal de clique no botão
loadBtn.addEventListener('click', async () => {
  loadBtn.disabled = true;
  diagnosticoArea.innerHTML = `<p>Iniciando o DuckDB... (isso pode levar alguns segundos)</p>`;

  try {
    // 1. Carregar o DuckDB (Versão Completa "EH")
    const db = await loadDb();
    diagnosticoArea.innerHTML += `<p>DuckDB carregado. Iniciando conexão...</p>`;
    
    const conn = await db.connect();
    diagnosticoArea.innerHTML += `<p>Conexão estabelecida. Registrando arquivos do servidor...</p>`;

    // 2. MUDANÇA PRINCIPAL: Registrar arquivos via URL
    for (const file of ARQUIVOS_PARQUET) {
      const caminho = `parquet/${file}`; // Caminho relativo à pasta 'public' ou raiz
      await db.registerFileURL(file, caminho);
      diagnosticoArea.innerHTML += `<p>Arquivo '${file}' registrado via URL.</p>`;
    }

    diagnosticoArea.innerHTML += `<p>Arquivos registrados. Criando tabela 'taxis' unificada...</p>`;
    
    // 3. Criar a tabela 'taxis'
    const fileNames = ARQUIVOS_PARQUET.map(f => `'${f}'`);
    const createTableQuery = `
      CREATE TABLE taxis AS 
      SELECT 
        tpep_pickup_datetime,
        payment_type,
        strftime(tpep_pickup_datetime, '%Y') AS ano,
        strftime(tpep_pickup_datetime, '%m-%d') AS dia_mes
      FROM read_parquet([${fileNames.join(', ')}])
      WHERE strftime(tpep_pickup_datetime, '%m') = '12';
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
    
    // 6. Executar Query Analítica 2: Métodos de Pagamento
    diagnosticoArea.innerHTML += `<p>Executando consulta analítica 2 (pagamentos)...</sjp>`;
    const paymentQuery = `
      SELECT 
        ano,
        CASE 
          WHEN payment_type = 1 THEN 'Cartão de Crédito'
          WHEN payment_type = 2 THEN 'Dinheiro'
          ELSE 'Outros' 
        END AS metodo_pagamento,
        COUNT(*) AS num_corridas
      FROM taxis
      GROUP BY ano, metodo_pagamento
      ORDER BY ano, metodo_pagamento;
    `;
    const payResult = await conn.query(paymentQuery);
    const payData = arrowTableToJSON(payResult);

    // 7. Renderizar Visualizações D3.js
    diagnosticoArea.innerHTML += `<p>Renderizando visualizações...</p>`;
    renderizarContagemDiaria(tsData);
    renderizarTiposPagamento(payData);
    diagnosticoArea.innerHTML += `<p>Análise concluída!</p>`;

    // 8. Limpar conexão
    await conn.close();

  } catch (error) {
    diagnosticoArea.innerHTML += `<p style="color: red;"><strong>Erro:</strong> ${error.message}</p>`;
    console.error(error);
  } finally {
    loadBtn.disabled = false;
  }
});