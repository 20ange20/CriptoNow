import {
  createChart,
  CrosshairMode,
  ISeriesApi,
  IChartApi,
} from 'lightweight-charts';

import React from 'react';
import { cryptoHttp } from '../../http';
import Legend from '../Legend';
import './index.css';

interface ChartProps {
  coin: string;
}

const Chart: React.FC<ChartProps> = ({ coin }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const candleSeriesRef = React.useRef<ISeriesApi<'Candlestick'> | null>(null);
  const chartRef = React.useRef<IChartApi | null>(null);

  const [prices, setPrices] = React.useState<any[]>([]);
  const [chartLoaded, setChartLoaded] = React.useState(false);

  // Atualiza preço atual a cada 1 minuto
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

  // Carrega histórico diário
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

  // Zera preços ao trocar moeda
  React.useEffect(() => {
    setPrices([]);
  }, [coin]);

  // Cria o gráfico
  React.useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      layout: {
        backgroundColor: '#253248',
        textColor: 'rgba(255,255,255,0.9)',
      },
      grid: {
        vertLines: { color: '#334158' },
        horzLines: { color: '#334158' },
      },
      crosshair: { mode: CrosshairMode.Normal },
      timeScale: { borderColor: '#485c7b' },
    });

    chartRef.current = chart;

    // Candle series
    candleSeriesRef.current = chart.addCandlestickSeries({
      upColor: '#4bffb5',
      downColor: '#ff4976',
      borderDownColor: '#ff4976',
      borderUpColor: '#4bffb5',
      wickDownColor: '#838ca1',
      wickUpColor: '#838ca1',
    });

    chart.priceScale('right').applyOptions({
      borderColor: '#485c7b',
    });

    setChartLoaded(true);

    // resize
    const handleResize = () => {
      if (!containerRef.current) return;
      chart.applyOptions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
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

