import { useState } from "react";

interface ControlCityProps {
  setCiudad: (ciudad: string) => void;
}

export default function ControlCity({ setCiudad }: ControlCityProps) {
  const [inputCiudad, setInputCiudad] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCiudad.trim() !== "") {
      setCiudad(inputCiudad);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="ciudadinput" className="form-label">Ingrese una ciudad</label>
        <input
          type="text"
          className="form-control"
          id="ciudadinput"
          value={inputCiudad}
          onChange={(e) => setInputCiudad(e.target.value)}
        />
      </div>
      <button type="submit" className="btn btn-primary">Buscar</button>
    </form>
  );
}
