
# 🚀 Guia Rápido de Instalação

## Para usuários que receberam o projeto

### 1️⃣ Pré-requisitos

- Node.js 18+ ([baixar aqui](https://nodejs.org/))
- Git instalado

### 2️⃣ Clone o repositório

```bash
git clone https://github.com/SEU_USUARIO/viz-enem-2024.git
cd viz-enem-2024
```

### 3️⃣ Instale as dependências

```bash
npm install
```

### 4️⃣ Adicione os arquivos Parquet

**Você receberá um arquivo ZIP via WhatsApp contendo:**
- `PARTICIPANTES_2024.parquet`
- `RESULTADOS_2024.parquet`

**Extraia e coloque na pasta:**
```
public/parquet/
```

### 5️⃣ Verifique se está tudo OK

```bash
npm run check
```

**Resposta esperada:**
```
✅ PARTICIPANTES_2024.parquet encontrado (150.5 MB)
✅ RESULTADOS_2024.parquet encontrado (89.2 MB)
✅ Todos os arquivos estão prontos!
```

### 6️⃣ Inicie o projeto

```bash
npm run dev
```

### 7️⃣ Acesse no navegador

Abra: **http://localhost:5173**

Clique em **"Iniciar Análise"** 🎉

---

## ❓ Problemas?

### Erro: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Failed to load parquet"
Certifique-se que os arquivos estão em `public/parquet/`
```bash
npm run check
```

### Página em branco
Limpe o cache: `Ctrl + Shift + R`

---

## 📞 Suporte

Se tiver problemas, entre em contato via WhatsApp enviando:
- Print do erro
- Resultado do comando `npm run check`