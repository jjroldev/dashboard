// Grid version 2
import Grid from '@mui/material/Grid2'
import './App.css'
import IndicatorWeather from './components/IndicatorWeather';
import TableWeather from './components/TableWeather';
import ControlWeather from './components/ControlWeather';
import LineChartWeather from './components/LineChartWeather';
import SearchAppBar from './components/SearchAppBar';
import Item from './interface/Item'
{/* Hooks */ }
import { useEffect, useState } from 'react';
import ControlCity from './components/ControlCity';

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

  let [dataClima, setDataClima] = useState<string>('');
  let [items, setItems] = useState<Item[]>([])

  const [ciudad, setCiudad] = useState('Guayaquil');
  let [indicators, setIndicators] = useState<Indicator[]>([])
  let [owm, setOWM] = useState(localStorage.getItem("openWeatherMap"))
  let API_KEY = "8db1c4c45b52bde6dc037c92fba3cd7b"

  const fetchDataWeather = async (ciudad: String) => {
    try {
      let response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${ciudad}&mode=xml&appid=${API_KEY}`)
      let savedTextXML = await response.text();
      setDataClima(savedTextXML);
    } catch {
      console.log("error");
    }
  }

  useEffect(() => {
    fetchDataWeather(ciudad);
    const parser = new DOMParser();
    const xml = parser.parseFromString(dataClima, "application/xml");

    let dataToIndicators: Indicator[] = [];
    const symbol = xml.querySelector('forecast > time > symbol');
    const temperature = xml.querySelector('forecast > time > temperature');

    const descripcion = symbol?.getAttribute('name') || 'N/A';
    const icono = symbol?.getAttribute('var') || 'N/A';
    const tempKelvin = temperature?.getAttribute('value') || '0';
    const tempCelsius = (parseFloat(tempKelvin) - 273.15).toFixed(2); // Convertir a Celsius


    setDetalleClima({
      descripcion,
      icono,
      temperatura: `${tempCelsius}°C`,
    });

    // Obtener latitud y longitud
    const location = xml.getElementsByTagName("location")[1];
    const latitude = location?.getAttribute("latitude") || "N/A";
    const longitude = location?.getAttribute("longitude") || "N/A";
    const altitude = location?.getAttribute("altitude") || "N/A";

    const humidity = xml.querySelector('forecast > time > humidity')?.getAttribute('value') || "N/A";
    const windSpeed = xml.querySelector('forecast > time > windSpeed')?.getAttribute('mps') || "N/A";
    const pressure = xml.querySelector('forecast > time > pressure')?.getAttribute('value') || "N/A";

    dataToIndicators.push({ title: "Location", subtitle: "Latitude", value: latitude });
    dataToIndicators.push({ title: "Location", subtitle: "Longitude", value: longitude });
    dataToIndicators.push({ title: "Location", subtitle: "Altitude", value: altitude });
    dataToIndicators.push({ title: "Weather", subtitle: "Humidity", value: `${humidity}%` });
    dataToIndicators.push({ title: "Weather", subtitle: "Wind Speed", value: `${windSpeed} m/s` });
    dataToIndicators.push({ title: "Weather", subtitle: "Pressure", value: `${pressure} hPa` });


    // Actualizamos el estado con los indicadores
    setIndicators(dataToIndicators);

    const dataToItems: Item[] = [];

    const times = xml.getElementsByTagName("time");

    for (let i = 0; i < Math.min(times.length, 6); i++) {
      const time = times[i];
      const dateStart = time.getAttribute("from") || "";
      const dateEnd = time.getAttribute("to") || "";

      const precipitation = time.getElementsByTagName("precipitation")[0]?.getAttribute("probability") || "0";
      const humidity = time.getElementsByTagName("humidity")[0]?.getAttribute("value") || "0";
      const clouds = time.getElementsByTagName("clouds")[0]?.getAttribute("all") || "0";

      dataToItems.push({
        dateStart,
        dateEnd,
        precipitation,
        humidity,
        clouds,
      });
    }

    setItems(dataToItems);

  }, [dataClima, ciudad]);

  // {/* Hook: useEffect */ }
  // useEffect(() => {
  //   let request = async () => {
  //     {/* Referencia a las claves del LocalStorage: openWeatherMap y expiringTime */ }
  //     let savedTextXML = localStorage.getItem("openWeatherMap") || "";
  //     let expiringTime = localStorage.getItem("expiringTime");

  //     {/* Obtenga la estampa de tiempo actual */ }
  //     let nowTime = (new Date()).getTime();

  //     {/* Verifique si es que no existe la clave expiringTime o si la estampa de tiempo actual supera el tiempo de expiración */ }
  //     if (expiringTime === null || nowTime > parseInt(expiringTime)) {
  //       {/* Request */ }
  //       let API_KEY = "8db1c4c45b52bde6dc037c92fba3cd7b"
  //       let response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${ciudad}&mode=xml&appid=${API_KEY}`)
  //       let savedTextXML = await response.text();
  //       console.log(savedTextXML);
  //       {/* Tiempo de expiración */ }
  //       let hours = 0.01
  //       let delay = hours * 3600000
  //       let expiringTime = nowTime + delay


  //       {/* En el LocalStorage, almacene el texto en la clave openWeatherMap, estampa actual y estampa de tiempo de expiración */ }
  //       localStorage.setItem("openWeatherMap", savedTextXML)
  //       localStorage.setItem("expiringTime", expiringTime.toString())
  //       localStorage.setItem("nowTime", nowTime.toString())

  //       {/* DateTime */ }
  //       localStorage.setItem("expiringDateTime", new Date(expiringTime).toString())
  //       localStorage.setItem("nowDateTime", new Date(nowTime).toString())

  //       {/* Modificación de la variable de estado mediante la función de actualización */ }
  //       setOWM(savedTextXML)
  //     }

  //     {/* Valide el procesamiento con el valor de savedTextXML */ }
  //     if (savedTextXML) {

  //       {/* XML Parser */ }

  //       {/* Arreglo para agregar los resultados */ }

  //       let dataToIndicators: Indicator[] = new Array<Indicator>();

  //       {/* 
  //          Análisis, extracción y almacenamiento del contenido del XML 
  //          en el arreglo de resultados
  //      */}


  //       //console.log(dataToIndicators)

  //       {/* Modificación de la variable de estado mediante la función de actualización */ }
  //       setIndicators(dataToIndicators)


  //     }
  //   }

  //   request();
  // }, [ciudad,owm])

  let renderIndicators = () => {
    return indicators
      .map(
        (indicator, idx) => (
          <Grid key={idx} size={{ xs: 12, xl: 3 }}>
            <IndicatorWeather
              title={indicator["title"]}
              subtitle={indicator["subtitle"]}
              value={indicator["value"]} />
          </Grid>
        )
      )
  }

  return (
    <>
      <SearchAppBar setCiudad={setCiudad} />
      <div className="contenedorPrincipal">
        {ciudad && detalleClima && (
          <div className="contenedorDetalles">
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
          <Grid container spacing={0} sx={{
            gap: "12px", placeContent: "center"
          }}>
            {renderIndicators()}
          </Grid>
        </section>
        <section className='tabla'>
          <h2>Tabla</h2>
          <TableWeather itemsIn={items} />
        </section>
      </div>
    </>
  );
}

export default App
