import os

try:
    import pandas as pd
except ImportError as e:
    raise ImportError("Instale pandas: pip install pandas") from e

CSV_FILES = [
    'PARTICIPANTES_2024.csv',
    'RESULTADOS_2024.csv',
]
OUTPUT_DIR = os.path.join('public', 'parquet')
os.makedirs(OUTPUT_DIR, exist_ok=True)

encodings = ['utf-8', 'utf-8-sig', 'cp1252', 'latin1']
seps = [';', ',', None]  # ENEM usa ";" primeiro

# Descobre engine parquet disponível
engine = None
for eng in ('pyarrow', 'fastparquet'):
    try:
        __import__(eng)
        engine = eng
        break
    except ImportError:
        continue
if engine is None:
    raise ImportError("Instale 'pyarrow' ou 'fastparquet': pip install pyarrow")

for csv_file in CSV_FILES:
    df = None
    last_err = None
    for enc in encodings:
        for sep in seps:
            try:
                df = pd.read_csv(csv_file, encoding=enc, sep=sep, engine='python' if sep is None else 'c')
                print(f"[OK] {csv_file} lido (encoding={enc}, sep={sep or 'auto'})")
                break
            except UnicodeDecodeError as e:
                last_err = e
                continue
            except Exception as e:
                last_err = e
                continue
        if df is not None:
            break

    if df is None:
        df = pd.read_csv(csv_file, encoding='utf-8', errors='replace', sep=';', engine='python')
        print(f"[WARN] {csv_file}: fallback errors='replace'.")

    parquet_name = os.path.splitext(os.path.basename(csv_file))[0] + '.parquet'
    parquet_path = os.path.join(OUTPUT_DIR, parquet_name)

    # Salva Parquet
    df.to_parquet(parquet_path, engine=engine, index=False)
    print(f"[OK] Parquet salvo: {parquet_path} (engine={engine})")

    # Valida lendo de volta
    try:
        _check = pd.read_parquet(parquet_path, engine=engine)
        if _check.empty:
            print(f"[WARN] {parquet_name} está vazio após conversão.")
        else:
            print(f"[OK] {parquet_name} validado: {len(_check)} linhas, {len(_check.columns)} colunas.")
    except Exception as e:
        raise RuntimeError(f"Falha ao validar {parquet_name}: {e}")
