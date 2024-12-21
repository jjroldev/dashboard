import { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import { LineChart } from '@mui/x-charts/LineChart';
import ControlWeather from './ControlWeather';

interface DataPoint {
    time: string;
    temperature: number;
    humidity: number;
    windSpeed: number;
}

export default function LineChartWeather({ weatherDataXML }: { weatherDataXML: string }) {
    const [selectedVariableIndex, setSelectedVariableIndex] = useState(0);
    const [chartData, setChartData] = useState<number[]>([]);
    const [xLabels, setXLabels] = useState<string[]>([]);

    const items = [
        { name: "Temperatura", description: "Medida de cuán caliente o frío está el ambiente en grados Celsius (°C)." },
        { name: "Humedad", description: "Porcentaje de vapor de agua presente en el aire." },
        { name: "Velocidad del Viento", description: "Rapidez con la que el viento se desplaza en metros por segundo (m/s)." },
    ];

    const variablesMap = ["temperature", "humidity", "windSpeed"];

    useEffect(() => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(weatherDataXML, "application/xml");

        const times = xml.getElementsByTagName("time");
        let extractedData: DataPoint[] = [];

        for (let i = 0; i < 8; i++) {
            const time = times[i];
            if (!time) continue;

            const timeLabel = time.getAttribute("from") || '';
            const tempKelvin = time.querySelector('temperature')?.getAttribute('value');
            const humidity = time.querySelector('humidity')?.getAttribute('value');
            const windSpeed = time.querySelector('windSpeed')?.getAttribute('mps');

            if (!tempKelvin || !humidity || !windSpeed) continue;

            extractedData.push({
                time: timeLabel,
                temperature: parseFloat((parseFloat(tempKelvin) - 273.15).toFixed(2)),
                humidity: parseFloat(humidity),
                windSpeed: parseFloat(windSpeed),
            });
        }

        setXLabels(extractedData.map(item => item.time.split("T")[1]?.slice(0, 5) || ''));
        if (selectedVariableIndex >= 0) {
            updateChartData(extractedData, selectedVariableIndex);
        }
    }, [weatherDataXML, selectedVariableIndex]);

    const updateChartData = (data: DataPoint[], variableIndex: number) => {
        const variable = variablesMap[variableIndex];
        const mappedData = data.map(item => item[variable as keyof DataPoint] as number);
        setChartData(mappedData);
    };

    return (
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <ControlWeather
                items={items}
                onVariableChange={(index) => setSelectedVariableIndex(index)}
            />

            {/* Gráfico de línea */}
            {selectedVariableIndex >= 0 && (
                <LineChart
                    width={600}
                    height={400}
                    series={[
                        {
                            data: chartData,
                            label: items[selectedVariableIndex].name,
                        },
                    ]}
                    xAxis={[
                        {
                            scaleType: 'point',
                            data: xLabels,
                        },
                    ]}
                />
            )}
        </Paper>
    );
}
