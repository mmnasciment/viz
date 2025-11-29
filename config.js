import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm_mvp from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';

const MANUAL_BUNDLES = {
  mvp: {
    mainModule: duckdb_wasm_mvp,    // string URL
    mainWorker: mvp_worker,         // string URL
    pthreadWorker: undefined,       // MVP não usa threads
  },
  eh: {
    mainModule: duckdb_wasm_eh,     // string URL
    mainWorker: eh_worker,          // string URL
    pthreadWorker: undefined,       // duckdb-browser-eh.worker já embute pthread
  },
};

export async function loadDb() {
  // Escolhe automaticamente o melhor bundle (EH se possível, senão MVP)
  const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
  const logger = new duckdb.ConsoleLogger();

  // Worker precisa do URL resolvido relativo ao módulo atual
  const worker = new Worker(new URL(bundle.mainWorker, import.meta.url), { type: 'module' });

  const db = new duckdb.AsyncDuckDB(logger, worker);

  // Passe string URLs (não objetos URL) para instantiate
  const mainModuleUrl = new URL(bundle.mainModule, import.meta.url).toString();
  const pthreadUrl = bundle.pthreadWorker
    ? new URL(bundle.pthreadWorker, import.meta.url).toString()
    : undefined;

  await db.instantiate(mainModuleUrl, pthreadUrl);
  return db;
}