# 📊 ENEM 2024 - Análise Interativa de Dados

Visualizações interativas dos microdados do ENEM 2024 usando D3.js e DuckDB-WASM.

## 🎯 Características

- ✨ **10 visualizações diferentes**: pizza, barras, histograma, box plot, heatmap e mapa coroplético
- 🎭 **Storytelling em 3 atos**: narrativa visual profissional
- 🚀 **Processamento client-side**: DuckDB-WASM (sem backend necessário)
- 🎨 **Design responsivo**: paleta de cores acessível e tooltips interativos

## 🛠️ Tecnologias

- [Vite](https://vitejs.dev/) - Build tool moderno
- [D3.js](https://d3js.org/) - Visualizações de dados
- [DuckDB-WASM](https://duckdb.org/docs/api/wasm) - SQL no navegador
- Vanilla JavaScript (ES6+)

---

## 📥 Como Rodar o Projeto (Passo a Passo)

### **Pré-requisitos**

- Node.js **18+** instalado ([download aqui](https://nodejs.org/))
- Git instalado

### **Passo 1: Clone o Repositório**

```bash
git clone https://github.com/SEU_USUARIO/viz-enem-2024.git
cd viz-enem-2024
```

### **Passo 2: Instale as Dependências**

```bash
npm install
```

### **Passo 3: Baixe os Arquivos Parquet**

Os arquivos `.parquet` não estão no repositório devido ao tamanho. 

**📦 Opção A: Baixar via WhatsApp** (recomendado)
- Solicite os arquivos `PARTICIPANTES_2024.parquet` e `RESULTADOS_2024.parquet` via WhatsApp
- Extraia o ZIP recebido
- Coloque os arquivos na pasta `public/parquet/`

**📦 Opção B: Baixar do INEP**
- Acesse: [Microdados ENEM 2024 - INEP](https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/enem)
- Baixe os microdados 2024
- Converta para Parquet (se necessário) ou use os fornecidos

**Estrutura esperada:**
```
public/
└── parquet/
    ├── PARTICIPANTES_2024.parquet  ← coloque aqui
    └── RESULTADOS_2024.parquet      ← coloque aqui
```

### **Passo 4: Verifique a Instalação**

Execute o script de verificação:

```bash
npm run check
```

Você verá algo como:
```
✅ PARTICIPANTES_2024.parquet encontrado (150.5 MB)
✅ RESULTADOS_2024.parquet encontrado (89.2 MB)
✅ Todos os arquivos estão prontos!
```

### **Passo 5: Inicie o Servidor**

```bash
npm run dev
```

Abra o navegador em: **http://localhost:5173**

🎉 **Pronto! Clique em "Iniciar Análise" para ver as visualizações.**

---

## 📊 Visualizações Disponíveis

### **Ato I - Quem São os Participantes?**
1. 🥧 **Pizza**: Distribuição por gênero
2. 📊 **Barras**: Faixa etária dos candidatos  
3. 📈 **Barras horizontais**: Top 15 estados

### **Ato II - Como Foi o Desempenho?**
4. 📊 **Barras coloridas**: Médias por área de conhecimento
5. 📊 **Barras agrupadas**: Desempenho por gênero
6. 📉 **Histograma**: Distribuição de notas de redação
7. 📦 **Box Plot**: Dispersão e outliers
8. 🔥 **Heatmap**: Correlação entre áreas

### **Ato III - Diferenças Regionais**
9. 📊 **Barras**: Top 10 municípios do RJ
10. 🗺️ **Mapa coroplético**: Média de redação por município (RJ)

---

## 📂 Estrutura do Projeto

```
viz-enem-2024/
├── index.html              # Página principal com estrutura dos 3 atos
├── main.js                 # Lógica de carregamento e queries SQL
├── visualizacoes.js        # 10 funções D3.js para gráficos
├── config.js               # Configuração do DuckDB-WASM
├── style.css               # Estilos e paleta de cores
├── package.json            # Dependências e scripts
├── public/
│   ├── parquet/           # Coloque os arquivos .parquet aqui
│   │   └── .gitkeep       # (mantém pasta no Git)
│   └── geo/               # GeoJSON para mapas
│       └── rj-municipios.json
└── scripts/
    └── check-setup.js     # Script de verificação
```

---

## 🎨 Paleta de Cores

```css
--cor-masculino: #3498DB    /* Azul */
--cor-feminino: #E74C3C     /* Vermelho */
--cor-cn: #9B59B6           /* Roxo - Ciências Natureza */
--cor-ch: #F39C12           /* Laranja - Ciências Humanas */
--cor-lc: #1ABC9C           /* Verde-água - Linguagens */
--cor-mt: #E67E22           /* Laranja escuro - Matemática */
--cor-redacao: #34495E      /* Cinza escuro - Redação */
```

---

## 🐛 Solução de Problemas

### ❌ Erro: "Cannot find module 'd3'"
```bash
npm install
```

### ❌ Erro: "Failed to load parquet file"
Verifique se os arquivos `.parquet` estão em `public/parquet/`
```bash
npm run check
```

### ❌ Visualizações não aparecem
1. Abra o Console do navegador (F12)
2. Verifique erros
3. Certifique-se que clicou em "Iniciar Análise"

### ❌ Página em branco
Limpe o cache: `Ctrl + Shift + R` (Windows) ou `Cmd + Shift + R` (Mac)

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/NovaVizualizacao`
3. Commit: `git commit -m 'Adiciona visualização X'`
4. Push: `git push origin feature/NovaVizualizacao`
5. Abra um Pull Request

---

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

## 👥 Autor

**Seu Nome**
- GitHub: [@SEU_USUARIO](https://github.com/SEU_USUARIO)
- LinkedIn: [Seu Perfil](https://linkedin.com/in/seu-perfil)

---

## 🙏 Agradecimentos

- **INEP** pelos microdados públicos do ENEM
- **D3.js Community** pelas incríveis bibliotecas de visualização
- **DuckDB Labs** pelo DuckDB-WASM

---

## 📝 Notas

- Os arquivos `.parquet` não estão versionados no Git (arquivo grande)
- Solicite os arquivos via WhatsApp ou baixe do INEP
- Projeto desenvolvido para fins educacionais e análise de dados públicos

---

**⭐ Se este projeto te ajudou, deixe uma estrela no GitHub!**