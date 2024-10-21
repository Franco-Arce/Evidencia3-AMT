import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css'; // Importamos el archivo de estilos CSS

const App = () => {
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage] = useState(15);
    const threshold = 300; // Umbral en centímetros

    const fetchData = async () => {
        try {
            const response = await axios.get('https://evidencia-2-amt-ispc.onrender.com/data');
            setData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
        const intervalId = setInterval(fetchData, 15000); // Refresca cada 15 segundos
        return () => clearInterval(intervalId); // Limpia el intervalo al desmontar el componente
    }, []);

    const getLedStatus = (value) => {
        return value >= threshold ? 'Encendido' : 'Apagado';
    };

    // Calcular métricas
    const calculateMetrics = () => {
        const totalRecords = data.length;
        const totalAboveThreshold = data.filter(item => item.value >= threshold).length;
        const averageHeight = data.reduce((sum, item) => sum + item.value, 0) / totalRecords || 0;

        return {
            totalRecords,
            totalAboveThreshold,
            averageHeight,
            percentageAboveThreshold: (totalAboveThreshold / totalRecords) * 100 || 0
        };
    };

    const { totalRecords, totalAboveThreshold, averageHeight, percentageAboveThreshold } = calculateMetrics();

    // Calcular los índices de los registros a mostrar
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = data.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(data.length / recordsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="container">
            <h1>Datos del Sensor</h1>
            
            {/* Sección de Métricas */}
            <div className="metrics">
                <h2>Métricas</h2>
                <p>Total de Registros: {totalRecords}</p>
                <p>Altura Promedio: {averageHeight.toFixed(2)} cm</p>
                <p>Cantidad por Encima del Umbral: {totalAboveThreshold}</p>
                <p>Porcentaje por Encima del Umbral: {percentageAboveThreshold.toFixed(2)}%</p>
            </div>

            <table className="sensor-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Altura en cm</th>
                        <th>Fecha del Registro</th>
                        <th>Estado del LED</th>
                    </tr>
                </thead>
                <tbody>
                    {currentRecords.map((item) => (
                        <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{item.value}</td>
                            <td>{new Date(item.timestamp).toLocaleString()}</td>
                            <td>
                                <span className={`led-circle ${item.value >= threshold ? 'on' : 'off'}`}></span>
                                {getLedStatus(item.value)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="pagination">
                <button onClick={handlePreviousPage} disabled={currentPage === 1}>Anterior</button>
                <button onClick={handleNextPage} disabled={currentPage === totalPages}>Siguiente</button>
            </div>
        </div>
    );
};

export default App;
