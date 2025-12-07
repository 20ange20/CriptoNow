# CryptoNow

## 🔎 Sobre o Projeto  
CryptoNow é um aplicativo mobile (React Native + Expo) para monitoramento em tempo real de criptomoedas: Bitcoin e Litecoin.
Ele permite acompanhar preços, ver gráficos históricos, e comparar dados de diferentes moedas, tudo de forma prática — ideal para quem quer acompanhar o mercado cripto sem complicação.

## 🛠 Tecnologias Utilizadas  
- **React Native** — framework para desenvolvimento mobile multiplataforma  
- **Expo** — simplifica o setup e execução do app no iOS / Android  
- **TypeScript** — escrita de código com tipagem, para maior segurança e robustez  

## 📚 Bibliotecas / Módulos Importados  
(supondo uso típico — adapte conforme seu `package.json`)  
- `lightweight-charts` — fornece os gráficos de preço e candle, responsável pela renderização dos gráficos históricos.  
- `axios` (ou módulo HTTP equivalente) — para fazer requisições HTTP à API pública de dados de criptomoedas.  
- `react-navigation` (ou similar) — para navegação entre telas, Drawer, Tabs e Modais.  
- `expo-status-bar` / `expo-app-loading` (ou módulos do Expo usados) — para controle da barra de status e tela de splash de carregamento.  
- `react-native-gesture-handler` / `react-native-safe-area-context` (ou dependências do Expo/React Native necessárias) — para lidar com gestos, safe-area (notch, bordas) e bom funcionamento em diferentes dispositivos.

## 🌐 API Consumida  
O app consome uma API pública de criptomoedas CryptoCompare via HTTP — buscando dados históricos (candle, open/high/low/close, volume), preço atual, e variações. Esses dados alimentam os gráficos e as atualizações ao vivo no app.

## 📂 Estrutura de Navegação  
- **Drawer Navigation** — menu lateral principal onde o usuário pode acessar diferentes seções do app (por exemplo: lista de moedas, favoritos, configurações).  
- **Tabs** — dentro do Drawer, há pelo menos duas abas (Tabs) para alternar entre diferentes visões, como “Resumo / Preço Atual” e “Histórico / Gráfico”.  
- **Modal** — usado para diálogos, como seleção de moeda, filtros, alertas, ou exibição de detalhes extras da moeda.  

## ✅ Funcionalidades Principais  
- Exibição de preços de criptomoedas em tempo real  
- Gráficos históricos (candlestick: open / high / low / close + volume)  
- Seleção de diferentes moedas  
- Atualização automática de preços a cada minuto

## 🚀 Como Executar o Projeto  

```bash
# clone este repositório
git clone https://github.com/20ange20/CryptoNow.git

# entre na pasta do projeto
cd CryptoNow

# instale as dependências
npm install
# ou
yarn install

# Iniciar
npm run dev

📝 Observações
O app não exige chaves privadas nem wallet — é apenas de visualização/monitoramento.


O uso de TypeScript + tipagens ajuda a reduzir erros e facilitar manutenção.

Angélica ✨