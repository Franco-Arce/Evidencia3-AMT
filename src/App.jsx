import { useEffect, useState } from 'react';
import axios from 'axios';

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
            <table>
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
                                <span style={{
                                    display: 'inline-block',
                                    width: '25px',
                                    height: '25px',
                                    backgroundColor: item.value >= threshold ? 'green' : 'red',
                                    border: '3px solid white',
                                    borderRadius: '50%',
                                    marginRight: '10px', // Añade espacio entre el círculo y el texto
                                    transition: 'background-color 0.3s'
                                }}></span>
                                {getLedStatus(item.value)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <button onClick={handlePreviousPage} disabled={currentPage === 1}>Anterior</button>
                <button onClick={handleNextPage} disabled={currentPage === totalPages}>Siguiente</button>
            </div>
        </div>
    );
};

export default App;
