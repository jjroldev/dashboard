import { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import { LineChart } from '@mui/x-charts/LineChart';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

interface DataPoint {
    time: string;
    temperature: number;
    humidity: number;
    windSpeed: number;
}

export default function LineChartWeather({ weatherDataXML }: { weatherDataXML: string }) {
    const [selectedVariable, setSelectedVariable] = useState('temperature');
    const [chartData, setChartData] = useState<number[]>([]);
    const [xLabels, setXLabels] = useState<string[]>([]);

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

            if (!tempKelvin || !humidity || !windSpeed) {
                console.warn('Missing data for time node:', time);
                continue;
            }

            extractedData.push({
                time: timeLabel,
                temperature: parseFloat((parseFloat(tempKelvin) - 273.15).toFixed(2)),
                humidity: parseFloat(humidity),
                windSpeed: parseFloat(windSpeed),
            });
        }

        setXLabels(extractedData.map(item => item.time.split("T")[1]?.slice(0, 5) || ''));
        updateChartData(extractedData, selectedVariable);
    }, [weatherDataXML, selectedVariable]);

    const updateChartData = (data: DataPoint[], variable: string) => {
        const mappedData = data.map(item => item[variable as keyof DataPoint] as number);
        setChartData(mappedData);
    };

    const handleChange = (event: any) => {
        setSelectedVariable(event.target.value);
    };

    return (
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <FormControl fullWidth>
                <InputLabel id="variable-select-label">Variable</InputLabel>
                <Select
                    labelId="variable-select-label"
                    value={selectedVariable}
                    label="Variable"
                    onChange={handleChange}
                >
                    <MenuItem value="temperature">Temperatura (°C)</MenuItem>
                    <MenuItem value="humidity">Humedad (%)</MenuItem>
                    <MenuItem value="windSpeed">Velocidad del Viento (m/s)</MenuItem>
                </Select>
            </FormControl>

            <LineChart
                width={500}
                height={300}
                series={[{
                    data: chartData,
                    label: selectedVariable
                }]}
                xAxis={[{
                    scaleType: 'point',
                    data: xLabels
                }]}
            />
        </Paper>
    );
}
