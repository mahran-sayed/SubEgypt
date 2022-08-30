import Stations from './classes/Stations.js';

// Declaring Variables
const selectElemDiv = document.querySelectorAll(".destination-box select");
const fromSelect = selectElemDiv[0];
const toSelect = selectElemDiv[1];
const stationOutput = document.querySelector("#stations-output");
const priceOutput = document.querySelector("#price-output");
const timeOutput = document.querySelector("#time-output");
let stationsJSON = await readJSON('/stations.json');
const startStation = document.querySelector("#start-station .station-name");
const endStation = document.querySelector("#end-station .station-name");
const infoStart = document.querySelector("#start-station .info");
const infoEnd = document.querySelector("#end-station .info");
const path = document.querySelector(".path")
// pricesMap = [number of stations, price]
let pricesMap = new Map([
    [9,6],
    [16,8],
    [23,11],
    [29,14],
    [39,19]
])


async function readJSON(file){
    return fetch(file).then((res)=>{
        return res.json().then((json)=>{
            return json;
        }).catch((err) => {
            console.log(err);
        }) 
    });
}





const stationsObj = new Stations(stationsJSON[0]);

const allStations = Object.keys(stationsJSON[0]);
allStations.splice(-2);
let line = 1;
let selectStr = `<optgroup label="Line 1">`
allStations.forEach((stat)=>{
    if(stationsObj.getLine(stat) != line){
        selectStr += `</optgroup><optgroup label="Line ${stationsObj.getLine(stat)}">`;
        line = stationsObj.getLine(stat);
    }
    selectStr += `<option value='${stat}'>${stat.includes("_")?stat.split("_")[0]:stat}</option>`;
})
selectStr += `</optgroup>`;
selectElemDiv.forEach(el => el.innerHTML = selectStr);

fromSelect.value = "New El-Marg";
toSelect.value = "Adly Mansour";

// Declaring from and to options variables
const fromOptions = document.querySelectorAll("#fromList option");
const toOptions = document.querySelectorAll("#toList option");


getInfo();
selectElemDiv.forEach(el => el.addEventListener("change",getInfo));

function getInfo(){
    let start = fromSelect.value,
        end = toSelect.value;
    disableOption(end, fromOptions);
    disableOption(start, toOptions);
    showPath(start, end);
    startStation.innerHTML = start;
    endStation.innerHTML = end;
    infoStart.innerHTML = `<a href='https://www.google.com/maps/search/?api=1&query=${stationsObj.getLocation(start)}'>Location</a>`;
    infoEnd.innerHTML = `<a href='https://www.google.com/maps/search/?api=1&query=${stationsObj.getLocation(end)}'>Location</a>`;
    stationOutput.innerHTML = stationsObj.stationsCounter(start, end);
    priceOutput.innerHTML = stationsObj.ticketPrice(start, end, pricesMap) + " EGP";
    timeOutput.innerHTML = stationsObj.getTimeBetween(start, end) + " Min";
}



function disableOption(toStat, options){
    
    for(let stat of options){
        if(stat.value == toStat) {
            stat.disabled = true;
            break;
        }
    }
}



function showPath(start, end){
    let pathStr = `<div class="path-container">`;
    const stations = stationsObj.getStationsBetween(start,end);
    console.log(stations)
    stations.forEach((path)=>{
    
        pathStr += `<div class = 'line${path.line}'><h3>Line ${path.line}</h3> <ul class = 'line'>`
        path.stations.forEach(stat=>{
            let isInterchange = stationsObj.getInterchange(stat);
            pathStr += `<li ${isInterchange?"class='interchange'":""}>${isInterchange?stat.split("_")[0]:stat}</li>`
        })
        pathStr += `</ul></div>`
    })
    pathStr += `</div>`;
    path.innerHTML = pathStr;
}




