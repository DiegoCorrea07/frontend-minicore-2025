import React, { useState } from 'react';
import './App.css';

function App() {
    // Estados para las fechas, los resultados, mensajes de error y carga
    const [fechaInicio, setFechaInicio] = useState('2025-06-01');
    const [fechaFin, setFechaFin] = useState('2025-06-30');
    const [comisiones, setComisiones] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [hasResults, setHasResults] = useState(false);

    const API_BASE_URL = 'https://minicoredc-2025.onrender.com';

    const handleCalculateComisiones = async () => {
        setError(null);
        setLoading(true);
        setHasResults(false);

        if (!fechaInicio || !fechaFin) {
            setError("Por favor, selecciona tanto la fecha de inicio como la fecha de fin.");
            setLoading(false);
            return;
        }

        if (new Date(fechaInicio) > new Date(fechaFin)) {
            setError("La fecha de inicio no puede ser posterior a la fecha de fin.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/comisiones?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error en la solicitud: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            setComisiones(data);
            setHasResults(Object.keys(data).length > 0);
        } catch (err) {
            console.error('Error al obtener las comisiones:', err);
            setError(`No se pudieron cargar las comisiones: ${err.message}`);
            setComisiones({});
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h1>Calcular Comisiones de Vendedores</h1>

            <div className="input-group">
                <label htmlFor="fechaInicio">Seleccione Fecha de Inicio:</label>
                <input
                    type="date"
                    id="fechaInicio"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                />
            </div>
            
            <div className="input-group">
                <label htmlFor="fechaFin">Seleccione Fecha de Fin:</label>
                <input
                    type="date"
                    id="fechaFin"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                />
            </div>
            
            <button onClick={handleCalculateComisiones} disabled={loading}>
                {loading ? 'Calculando...' : 'Calcular Comisiones'}
            </button>

            <div className="resultados">
                <h2>Resultados:</h2>
                {error && <p className="error-message">{error}</p>}
                
                {!loading && Object.keys(comisiones).length === 0 && !error && !hasResults && (
                    <p className="no-results-message">
                        No se encontraron comisiones para el rango de fechas seleccionado.
                    </p>
                )}

                {!loading && Object.keys(comisiones).length > 0 && (
                    <table id="tablaComisiones">
                        <thead>
                            <tr>
                                <th>Vendedor</th>
                                <th>Total Ventas</th>
                                <th>Comisión Calculada</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(comisiones).map(([vendedorNombre, data]) => (
                                <tr key={vendedorNombre}>
                                    <td>{vendedorNombre}</td>
                                    <td>${data.total_ventas.toFixed(2)}</td>
                                    <td>${data.comision.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default App;