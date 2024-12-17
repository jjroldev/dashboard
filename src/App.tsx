import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid2';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

import './App.css';
import IndicatorWeather from './components/IndicatorWeather';
import TableWeather from './components/TableWeather';
import SearchAppBar from './components/SearchAppBar';
import LineChartWeather from './components/LineChartWeather';
import Item from './interface/Item';

interface Indicator {
  title?: String;
  subtitle?: String;
  value?: String;
}

function App() {
  const [detalleClima, setDetalleClima] = useState<{
    descripcion: string;
    icono: string;
    temperatura: string;
  } | null>(null);

  const [dataClima, setDataClima] = useState<string>('');
  const [items, setItems] = useState<Item[]>([]);
  const [variableGrafico, setVariableGrafico] = useState<string>('temperature');
  const [ciudad, setCiudad] = useState('Guayaquil');
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const API_KEY = '8db1c4c45b52bde6dc037c92fba3cd7b';

  useEffect(() => {
    const fetchDataWeather = async (ciudad: string) => {
      try {
        const savedData = localStorage.getItem("openWeatherMap");
        const expiringTime = localStorage.getItem("expiringTime");
  
        const nowTime = new Date().getTime();
  
        if (expiringTime && nowTime < parseInt(expiringTime) && savedData) {
          setDataClima(savedData);
          console.log("Usando datos del Local Storage");
          return;
        }
  
        console.log("Solicitando datos de la API...");
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${ciudad}&mode=xml&appid=${API_KEY}`
        );
  
        if (!response.ok) throw new Error("Error en la solicitud");
  
        const savedTextXML = await response.text();
  
        // Almacenar en el Local Storage con tiempo de expiración
        const hours = 1; // Tiempo de expiración en horas
        const delay = hours * 3600000; // Convertir horas a milisegundos
        const newExpiringTime = nowTime + delay;
  
        localStorage.setItem("openWeatherMap", savedTextXML);
        localStorage.setItem("expiringTime", newExpiringTime.toString());
  
        setDataClima(savedTextXML);
      } catch (error) {
        console.error("Error al obtener el clima:", error);
        setDataClima("");
      }
    };
  
    fetchDataWeather(ciudad);
  }, [ciudad]);

  useEffect(() => {
    if (!dataClima) return;

    const parser = new DOMParser();
    const xml = parser.parseFromString(dataClima, 'application/xml');

    const symbol = xml.querySelector('forecast > time > symbol');
    const temperature = xml.querySelector('forecast > time > temperature');

    const descripcion = symbol?.getAttribute('name') || 'N/A';
    const icono = symbol?.getAttribute('var') || 'N/A';
    const tempKelvin = temperature?.getAttribute('value') || '0';
    const tempCelsius = (parseFloat(tempKelvin) - 273.15).toFixed(2);

    setDetalleClima({
      descripcion,
      icono,
      temperatura: `${tempCelsius}°C`,
    });

    let location = xml.getElementsByTagName("location")[1]
    let latitude = location.getAttribute("latitude") || ""

    let longitude = location.getAttribute("longitude") || ""
    let altitude = location.getAttribute("altitude") || ""
    const humidity = xml.querySelector('forecast > time > humidity')?.getAttribute('value') || 'N/A';
    const windSpeed = xml.querySelector('forecast > time > windSpeed')?.getAttribute('mps') || 'N/A';
    const pressure = xml.querySelector('forecast > time > pressure')?.getAttribute('value') || 'N/A';

    const dataToIndicators: Indicator[] = [
      { title: 'Location', subtitle: 'Latitude', value: latitude },
      { title: 'Location', subtitle: 'Longitude', value: longitude },
      { title: 'Location', subtitle: 'Altitude', value: altitude },
      { title: 'Weather', subtitle: 'Humidity', value: `${humidity}%` },
      { title: 'Weather', subtitle: 'Wind Speed', value: `${windSpeed} m/s` },
      { title: 'Weather', subtitle: 'Pressure', value: `${pressure} hPa` },
    ];

    setIndicators(dataToIndicators);

    const times = xml.getElementsByTagName('time');
    const dataToItems: Item[] = [];

    for (let i = 0; i < Math.min(times.length, 6); i++) {
      const time = times[i];
      const dateStart = time.getAttribute('from') || '';
      const dateEnd = time.getAttribute('to') || '';
      const precipitation = time.querySelector('precipitation')?.getAttribute('probability') || '0';
      const humidity = time.querySelector('humidity')?.getAttribute('value') || '0';
      const clouds = time.querySelector('clouds')?.getAttribute('all') || '0';

      dataToItems.push({
        dateStart,
        dateEnd,
        precipitation,
        humidity,
        clouds,
      });
    }

    setItems(dataToItems);

  }, [dataClima, variableGrafico]);

  const renderIndicators = () =>
    indicators.map((indicator, idx) => (
      <Grid key={idx} size={{ xs: 12, xl: 3 }}>
        <IndicatorWeather
          title={indicator.title}
          subtitle={indicator.subtitle}
          value={indicator.value}
        />
      </Grid>
    ));

  return (
    <>
      <SearchAppBar setCiudad={setCiudad} />
      <div className="contenedorPrincipal">
        {ciudad && detalleClima && (
          <div className="contenedorDetalles" style={{marginTop:"70px"}}>
            <h2>{ciudad}</h2>
            <p>Descripción: {detalleClima.descripcion}</p>
            <p>Temperatura: {detalleClima.temperatura}</p>
            <img
              src={`https://openweathermap.org/img/wn/${detalleClima.icono}@2x.png`}
              alt={detalleClima.descripcion}
            />
          </div>
        )}
        <section>
          <h2>Indicadores</h2>
          <Grid container spacing={0} sx={{ gap: '12px', placeContent: 'center' }}>
            {renderIndicators()}
          </Grid>
        </section>
        <section className="tabla">
          <h2>Tabla</h2>
          <TableWeather itemsIn={items} />
        </section>
        <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2>Gráfico</h2>
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="select-variable-label">Variable</InputLabel>
            <Select
              labelId="select-variable-label"
              value={variableGrafico}
              onChange={(e) => setVariableGrafico(e.target.value)}
              label="Variable"
            >
              <MenuItem value="temperature">Temperatura</MenuItem>
              <MenuItem value="humidity">Humedad</MenuItem>
              <MenuItem value="windspeed">Velocidad del Viento</MenuItem>
            </Select>
          </FormControl>
          <LineChartWeather weatherDataXML={dataClima} />
        </section>
      </div>
    </>
  );
}

export default App;
