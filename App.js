import React, { useState, useEffect } from 'react';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFutbol } from '@fortawesome/free-solid-svg-icons';

function App() {
    const [players, setPlayers] = useState([]);
    const [name, setName] = useState('');
    const [skill, setSkill] = useState(0);
    const [position, setPosition] = useState('');
    const [isPlaying, setIsPlaying] = useState(true);
    const [editIndex, setEditIndex] = useState(null);
    const [teamA, setTeamA] = useState([]);
    const [teamB, setTeamB] = useState([]);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const storedPlayers = JSON.parse(localStorage.getItem('players')) || [];
        setPlayers(storedPlayers);
    }, []);

    const addOrUpdatePlayer = (e) => {
        e.preventDefault();
        const newPlayer = { name, skill, position, isPlaying };
        let updatedPlayers;

        if (editIndex !== null) {
            updatedPlayers = players.map((player, index) =>
                index === editIndex ? newPlayer : player
            );
            setEditIndex(null);
        } else {
            updatedPlayers = [...players, newPlayer];
        }

        setPlayers(updatedPlayers);
        localStorage.setItem('players', JSON.stringify(updatedPlayers));
        clearForm();
    };

    const clearForm = () => {
        setName('');
        setSkill(0);
        setPosition('');
        setIsPlaying(true);
    };

    const editPlayer = (index) => {
        const playerToEdit = players[index];
        setName(playerToEdit.name);
        setSkill(playerToEdit.skill);
        setPosition(playerToEdit.position);
        setIsPlaying(playerToEdit.isPlaying);
        setEditIndex(index);
    };

    const deletePlayer = (index) => {
        const updatedPlayers = players.filter((_, i) => i !== index);
        setPlayers(updatedPlayers);
        localStorage.setItem('players', JSON.stringify(updatedPlayers));
    };

    const clearPlayers = () => {
        setPlayers([]);
        localStorage.removeItem('players');
    };

    const generateTeams = () => {
        const filteredPlayers = players.filter(player => player.isPlaying);

        // Verificar que haya suficientes jugadores
        if (filteredPlayers.length < 4) {
            alert("Se requieren al menos 4 jugadores que jueguen para formar los equipos.");
            return;
        }

        // Mostrar barra de carga
        setLoading(true);
        setProgress(0);
        
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 33; // Incrementar para completar en 3 segundos
            });
        }, 1000); // Cada segundo

        setTimeout(() => {
            clearInterval(interval);
            setLoading(false);
            createTeams(filteredPlayers);
        }, 3000); // Esperar 3 segundos para mostrar los equipos
    };

    const createTeams = (filteredPlayers) => {
        // Separar arqueros y demás jugadores
        const goalkeepers = filteredPlayers.filter(player => player.position === 'arquero');
        const otherPlayers = filteredPlayers.filter(player => player.position !== 'arquero');

        // Verificar que haya al menos 2 arqueros
        if (goalkeepers.length < 2) {
            alert("Se requieren al menos 2 arqueros para formar los equipos.");
            return;
        }

        // Mezclar aleatoriamente los demás jugadores
        const shuffledOtherPlayers = otherPlayers.sort(() => Math.random() - 0.5);

        // Crear equipos
        const teamA = [goalkeepers[0]];
        const teamB = [goalkeepers[1]];

        // Determinar cuántos jugadores se pueden agregar
        const totalPlayers = filteredPlayers.length - 2; // Restar arqueros
        const playersPerTeam = Math.floor(totalPlayers / 2); // Cantidad de jugadores por equipo

        // Agrupar jugadores restantes por posición
        const positionGroups = {
            defensor: [],
            mediocampista: [],
            atacante: []
        };

        for (const player of shuffledOtherPlayers) {
            positionGroups[player.position].push(player);
        }

        // Ordenar jugadores dentro de cada grupo por habilidad
        for (const position in positionGroups) {
            positionGroups[position].sort((a, b) => b.skill - a.skill);
        }

        // Asignar jugadores equilibradamente por posición
        const teams = [teamA, teamB];

        // Crear un array de todos los jugadores restantes ordenados por habilidad
        const allPlayers = [
            ...positionGroups.defensor,
            ...positionGroups.mediocampista,
            ...positionGroups.atacante
        ];

        // Asignar jugadores a los equipos
        for (let i = 0; i < allPlayers.length; i++) {
            // Alternar entre los equipos para mantener equilibrio
            const teamIndex = i % 2;
            teams[teamIndex].push(allPlayers[i]);

            // Asegurarse de que los equipos no excedan el número de jugadores permitido
            if (teams[0].length > playersPerTeam + 1 || teams[1].length > playersPerTeam + 1) {
                break;
            }
        }

        // Validar que ambos equipos tengan la misma cantidad de jugadores
        if (teams[0].length !== teams[1].length) {
            alert("Los equipos no están equilibrados.");
            return;
        }

        setTeamA(teams[0]);
        setTeamB(teams[1]);
    };

    return (
        <div className="container">
            <h1 className="my-4 text-center">Generador de Equipos de Fútbol</h1>
            <div className="row">
                <div className="col-md-4">
                    <form onSubmit={addOrUpdatePlayer} className="mb-4">
                        <div className="mb-3">
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="form-control"
                                placeholder="Nombre del Jugador"
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <select value={position} onChange={(e) => setPosition(e.target.value)} className="form-select" required>
                                <option value="">Selecciona Posición</option>
                                <option value="arquero">Arquero</option>
                                <option value="defensor">Defensor</option>
                                <option value="mediocampista">Mediocampista</option>
                                <option value="atacante">Atacante</option>
                            </select>
                        </div>
                        <div className="mb-3">
                            <span>Habilidad:</span>
                            <div className="d-flex align-items-center">
                                {[1, 2, 3].map((num) => (
                                    <span
                                        key={num}
                                        onClick={() => setSkill(num)}
                                        className={`icon-skill ${num <= skill ? 'active' : ''}`}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <FontAwesomeIcon icon={faFutbol} size="2x" />
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="mb-3 form-check">
                            <input
                                type="checkbox"
                                checked={isPlaying}
                                onChange={(e) => setIsPlaying(e.target.checked)}
                                className="form-check-input"
                                id="isPlaying"
                            />
                            <label className="form-check-label" htmlFor="isPlaying">
                                Juega
                            </label>
                        </div>
                        <button type="submit" className="btn btn-primary mt-2">
                            {editIndex !== null ? 'Actualizar Jugador' : 'Agregar Jugador'}
                        </button>
                    </form>
                </div>

                <div className="col-md-8">
                    <h2>Jugadores:</h2>
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Habilidad</th>
                                <th>Posición</th>
                                <th>Juega</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {players.map((player, index) => (
                                <tr key={index}>
                                    <td>{player.name}</td>
                                    <td>
                                        {[...Array(player.skill)].map((_, i) => (
                                            <FontAwesomeIcon key={i} icon={faFutbol} size="1x" className="text-success" />
                                        ))}
                                    </td>
                                    <td>{player.position}</td>
                                    <td>
                                        <FontAwesomeIcon
                                            icon={faFutbol}
                                            size="1x"
                                            className={player.isPlaying ? 'text-success' : 'text-danger'}
                                        />
                                    </td>
                                    <td>
                                        <button className="btn btn-warning btn-sm me-2" onClick={() => editPlayer(index)}>Editar</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => deletePlayer(index)}>Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {loading && (
                <div className="mb-4 text-center">
                    <h3>Cargando Equipos...</h3>
                    <div className="progress">
                        <div className="progress-bar" style={{ width: `${progress}%` }}>
                            {[...Array(3)].map((_, i) => (
                                <FontAwesomeIcon key={i} icon={faFutbol} size="1x" className="text-success" />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {!loading && (
                <div>
                    <h2 className="mt-4">Equipos Generados</h2>
                    <div className="row">
                        <div className="col-md-6">
                            <h3>Equipo A</h3>
                            <ul className="list-group mb-4">
                                {teamA.map((player, index) => (
                                    <li key={index} className="list-group-item">
                                        {player.name} - 
                                        {[...Array(player.skill)].map((_, i) => (
                                            <FontAwesomeIcon key={i} icon={faFutbol} size="1x" className="text-success" />
                                        ))}
                                        - {player.position}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="col-md-6">
                            <h3>Equipo B</h3>
                            <ul className="list-group mb-4">
                                {teamB.map((player, index) => (
                                    <li key={index} className="list-group-item">
                                        {player.name} - 
                                        {[...Array(player.skill)].map((_, i) => (
                                            <FontAwesomeIcon key={i} icon={faFutbol} size="1x" className="text-success" />
                                        ))}
                                        - {player.position}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            <div className="text-center my-4">
                <button className="btn btn-success me-2" onClick={generateTeams}>Generar Equipos</button>
                <button className="btn btn-secondary" onClick={clearPlayers}>Limpiar Lista</button>
            </div>
        </div>
    );
}

export default App;
