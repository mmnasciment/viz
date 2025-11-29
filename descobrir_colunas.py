import pandas as pd

csv_files = ['PARTICIPANTES_2024.csv', 'RESULTADOS_2024.csv']

for csv_file in csv_files:
    try:
        # Tenta leituras com encodings e separadores comuns
        for enc in ['utf-8', 'cp1252', 'latin1']:
            for sep in [None, ';', ',']:
                try:
                    df = pd.read_csv(csv_file, encoding=enc, sep=sep, nrows=1)
                    print(f"\n=== {csv_file} (encoding={enc}, sep={sep or 'auto'}) ===")
                    print(f"Colunas ({len(df.columns)}): {list(df.columns)}")
                    break
                except:
                    continue
            else:
                continue
            break
    except Exception as e:
        print(f"Erro ao ler {csv_file}: {e}")