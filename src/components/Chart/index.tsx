import { createChart, CrosshairMode, ISeriesApi } from 'lightweight-charts';
import React from 'react';
import { cryptoHttp } from '../../http';
import Legend from '../Legend';
import './index.css';

interface ChartProps {
  coin: string;
}

const Chart: React.FC<ChartProps> = ({ coin }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const candleSeriesRef = React.useRef<ISeriesApi<"Candlestick">>();
  const chartRef = React.useRef<any>();

  const [prices, setPrices] = React.useState<any[]>([]);
  const [chartLoaded, setChartLoaded] = React.useState(false);

  // ============================
  // 1) Atualiza preço atual a cada 1 minuto
  // ============================
  React.useEffect(() => {
    if (!chartLoaded) return;

    const interval = setInterval(() => {
      cryptoHttp
        .get(`histominute?fsym=${coin}&tsym=BRL&limit=1`)
        .then((response) => {
          const price = response.data.Data[1];
          const newPrice = {
            time: price.time,
            low: price.low,
            high: price.high,
            open: price.open,
            close: price.close,
            volume: price.volumefrom,
          };

          candleSeriesRef.current?.update(newPrice);

          setPrices((prev) => [...prev, newPrice]);
        });
    }, 60000);

    return () => clearInterval(interval);
  }, [coin, chartLoaded]);

  // ============================
  // 2) Carrega histórico diário (300 candles)
  // ============================
  React.useEffect(() => {
    if (!chartLoaded) return;

    cryptoHttp
      .get(`histoday?fsym=${coin}&tsym=BRL&limit=300`)
      .then((response) => {
        const mapped = response.data.Data.map((row: any) => ({
          time: row.time,
          low: row.low,
          high: row.high,
          open: row.open,
          close: row.close,
          volume: row.volumefrom,
        }));

        setPrices(mapped);
        candleSeriesRef.current?.setData(mapped);
      });
  }, [coin, chartLoaded]);

  // ============================
  // 3) Reinicia preços ao trocar de moeda
  // ============================
  React.useEffect(() => {
    setPrices([]);
  }, [coin]);

  // ============================
  // 4) Cria o gráfico uma única vez
  // ============================
  React.useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight, // agora a altura virá do CSS fixo
      layout: {
        backgroundColor: '#253248',
        textColor: 'rgba(255,255,255,0.9)',
      },
      grid: {
        vertLines: { color: '#334158' },
        horzLines: { color: '#334158' },
      },
      crosshair: { mode: CrosshairMode.Normal },
      priceScale: { borderColor: '#485c7b' },
      timeScale: { borderColor: '#485c7b' },
    });

    chartRef.current = chart;

    candleSeriesRef.current = chart.addCandlestickSeries({
      upColor: '#4bffb5',
      downColor: '#ff4976',
      borderDownColor: '#ff4976',
      borderUpColor: '#4bffb5',
      wickDownColor: '#838ca1',
      wickUpColor: '#838ca1',
    });

    setChartLoaded(true);

    // ============================
    // resize automático no navegador
    // ============================
    const handleResize = () => {
      chart.applyOptions({
        width: containerRef.current!.clientWidth,
        height: containerRef.current!.clientHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  return (
    <div className="Chart" ref={containerRef}>
      <Legend legend={coin} />
    </div>
  );
};

export default Chart;

