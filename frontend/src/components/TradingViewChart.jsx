import React, { useEffect, useRef, useMemo } from 'react';
import { createChart, CrosshairMode, CandlestickSeries, HistogramSeries } from 'lightweight-charts';

const THEME = {
  bg: '#131722', // Real TradingView dark background
  textColor: '#d1d4dc', // Real TradingView text color
  gridColor: '#2a2e39', // Real TradingView grid lines
  crosshairColor: 'rgba(156, 163, 175, 0.4)', // Real TradingView crosshair color
  upColor: '#089981', // Real TradingView green
  downColor: '#f23645', // Real TradingView red
  volumeUp: 'rgba(8, 153, 129, 0.35)', // Real TradingView volume green
  volumeDown: 'rgba(242, 54, 69, 0.35)', // Real TradingView volume red
  borderColor: '#2a2e39', // Real TradingView border color
  wickUpColor: '#089981',
  wickDownColor: '#f23645',
};

export default function TradingViewChart({ data, onCrosshairMove }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const resizeObserverRef = useRef(null);

  const chartOptions = useMemo(() => ({
    layout: {
      background: { type: 'solid', color: THEME.bg },
      textColor: THEME.textColor,
      fontSize: 10,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    },
    grid: {
      vertLines: { color: THEME.gridColor, style: 1 },
      horzLines: { color: THEME.gridColor, style: 1 },
    },
    crosshair: {
      mode: CrosshairMode.Normal,
      vertLine: {
        color: THEME.crosshairColor,
        width: 1,
        style: 2,
        labelBackgroundColor: '#1c2030',
      },
      horzLine: {
        color: THEME.crosshairColor,
        width: 1,
        style: 2,
        labelBackgroundColor: '#1c2030',
      },
    },
    rightPriceScale: {
      borderColor: THEME.borderColor,
      scaleMargins: { top: 0.05, bottom: 0.25 },
      borderVisible: true,
      visible: true,
      autoScale: true,
    },
    timeScale: {
      borderColor: THEME.borderColor,
      timeVisible: true,
      secondsVisible: false,
      borderVisible: true,
      visible: true,
      rightOffset: 4,
      barSpacing: 6,
      minBarSpacing: 2,
      fixLeftEdge: true,
      lockVisibleTimeRangeOnResize: true,
    },
    handleScroll: { vertTouchDrag: false },
    handleScale: { axisPressedMouse: { time: true, price: true } },
  }), []);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      ...chartOptions,
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    });

    chartRef.current = chart;

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: THEME.upColor,
      downColor: THEME.downColor,
      borderUpColor: THEME.upColor,
      borderDownColor: THEME.downColor,
      wickUpColor: THEME.wickUpColor,
      wickDownColor: THEME.wickDownColor,
      priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
    });
    candleSeriesRef.current = candleSeries;

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });
    volumeSeriesRef.current = volumeSeries;

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    chart.subscribeCrosshairMove((param) => {
      if (onCrosshairMove && param.time) {
        const candleData = param.seriesData?.get(candleSeries);
        const volData = param.seriesData?.get(volumeSeries);
        onCrosshairMove({ candle: candleData, volume: volData, time: param.time });
      } else if (onCrosshairMove) {
        onCrosshairMove(null);
      }
    });

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          chart.applyOptions({ width, height });
        }
      }
    });
    observer.observe(containerRef.current);
    resizeObserverRef.current = observer;

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, [chartOptions, onCrosshairMove]);

  useEffect(() => {
    if (!candleSeriesRef.current || !data || data.length === 0) return;

    candleSeriesRef.current.setData(data);
    volumeSeriesRef.current.setData(
      data.map((d) => ({
        time: d.time,
        value: d.volume,
        color: d.close >= d.open ? THEME.volumeUp : THEME.volumeDown,
      }))
    );
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  return (
    <div ref={containerRef} className="w-full h-full" />
  );
}