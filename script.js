let map, marker, path;
let startTime, endTime, timerInterval;
let distanciaRecorrida = 0;
let watchID;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 15,
    });
    marker = new google.maps.Marker({
        map: map,
        title: 'Tu ubicación actual',
    });
    path = new google.maps.Polyline({
        map: map,
        path: [],
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2,
    });
}

function iniciarCarrera() {
    if (navigator.geolocation) {
        startTime = new Date();
        distanciaRecorrida = 0;
        document.getElementById('feedback').innerHTML = "";
        watchID = navigator.geolocation.watchPosition(updateLocation, handleError, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
        });
        timerInterval = setInterval(updateFeedback, 1000);
    } else {
        alert("La geolocalización no es soportada por este navegador.");
    }
}

function pausarCarrera() {
    clearInterval(timerInterval);
    if (navigator.geolocation) {
        navigator.geolocation.clearWatch(watchID);
    }
}

function finalizarCarrera() {
    endTime = new Date();
    clearInterval(timerInterval);
    if (navigator.geolocation) {
        navigator.geolocation.clearWatch(watchID);
    }
    mostrarResultados();
}

function updateLocation(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const currentPosition = new google.maps.LatLng(lat, lng);
    marker.setPosition(currentPosition);
    map.setCenter(currentPosition);

    const pathArray = path.getPath();
    pathArray.push(currentPosition);
    path.setPath(pathArray);

    if (pathArray.getLength() > 1) {
        const prevPos = pathArray.getAt(pathArray.getLength() - 2);
        const distance = google.maps.geometry.spherical.computeDistanceBetween(prevPos, currentPosition);
        distanciaRecorrida += distance / 1000; // Convertir a kilómetros
    }
}

function handleError(error) {
    console.error("Error en la geolocalización: ", error);
}

function updateFeedback() {
    let currentTime = new Date();
    let elapsedTime = (currentTime - startTime) / 1000; // En segundos
    let ritmoPromedio = (elapsedTime / 60) / distanciaRecorrida;

    document.getElementById('feedback').innerHTML = `
        <p>Ritmo actual: ${(ritmoPromedio).toFixed(2)} min/km</p>
        <p>DR: ${(distanciaRecorrida).toFixed(2)} km</p>
        <p>TT: ${Math.floor(elapsedTime / 3600)} hrs, ${Math.floor((elapsedTime % 3600) / 60)} mins, ${Math.floor(elapsedTime % 60)} segs</p>
    `;
}

function mostrarResultados() {
    let distanciaObjetivo = parseFloat(document.getElementById('distanciaObjetivo').value);
    let tiempoObjetivoHoras = parseInt(document.getElementById('tiempoObjetivoHoras').value) || 0;
    let tiempoObjetivoMinutos = parseInt(document.getElementById('tiempoObjetivoMinutos').value) || 0;
    let tiempoObjetivo = (tiempoObjetivoHoras * 60) + tiempoObjetivoMinutos;
    let tiempoTranscurrido = (endTime - startTime) / 1000 / 60; // En minutos

    let ritmoPromedio = (tiempoTranscurrido) / distanciaRecorrida;
    let logroDistancia = distanciaRecorrida >= distanciaObjetivo ? "Cumplido" : "No Cumplido";
    let logroTiempo = tiempoTranscurrido <= tiempoObjetivo ? "Cumplido" : "No Cumplido";

    let feedback = `
        <p>Ritmo promedio: ${(ritmoPromedio).toFixed(2)} min/km</p>
        <p>DR: ${(distanciaRecorrida).toFixed(2)} km</p>
        <p>TT: ${Math.floor(tiempoTranscurrido / 60)} hrs, ${Math.floor(tiempoTranscurrido % 60)} mins</p>
        <p class="${logroDistancia === 'Cumplido' ? 'achieved' : 'not-achieved'}">Distancia Objetivo: ${logroDistancia}</p>
        <p class="${logroTiempo === 'Cumplido' ? 'achieved' : 'not-achieved'}">Tiempo Objetivo: ${logroTiempo}</p>
    `;
    document.getElementById('feedback').innerHTML = feedback;
}

function exportarGPX() {
    // Aquí iría el código para exportar la ruta GPX
}
