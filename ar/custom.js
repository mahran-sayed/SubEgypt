import Stations from '/classes/Stations.js';

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
const swapBtn = document.querySelector(".swapBtn");

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
let selectStr = `<optgroup label="الخط الأول" style="font-family: 'IBM Plex Sans Arabic', sans-serif;">`
allStations.forEach((stat)=>{
    if(stationsObj.getLine(stat) != line){
        switch (stationsObj.getLine(stat)){
            case 2:
                selectStr += `</optgroup><optgroup label="الخط الثاني" style="font-family: 'IBM Plex Sans Arabic', sans-serif;">`;
                break;
            case 3:
                selectStr += `</optgroup><optgroup label="الخط الثالث" style="font-family: 'IBM Plex Sans Arabic', sans-serif;">`;
                break;

        }
        
        line = stationsObj.getLine(stat);
    }
    selectStr += `<option value='${stat}'>${stationsObj.getArabicName(stat)}</option>`;
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
    startStation.innerHTML = stationsObj.getArabicName(start);
    endStation.innerHTML = stationsObj.getArabicName(end);
    infoStart.innerHTML = `<a href='https://www.google.com/maps/search/?api=1&query=${stationsObj.getLocation(start)}'>الموقع</a>`;
    infoEnd.innerHTML = `<a href='https://www.google.com/maps/search/?api=1&query=${stationsObj.getLocation(end)}'>الموقع</a>`;
    stationOutput.innerHTML = stationsObj.stationsCounter(start, end);
    priceOutput.innerHTML = stationsObj.ticketPrice(start, end, pricesMap) + " جنيه مصري";
    timeOutput.innerHTML = stationsObj.getTimeBetween(start, end) + " دقيقة";
}



function disableOption(toStat, options){
    
    for(let stat of options){
        if(stat.value == toStat) {
            stat.disabled = true;
        }else{
            stat.disabled = false;
        }
    }
}

function swapOptions(){
    let start = fromSelect.value,
        end = toSelect.value;
    fromSelect.value = end;
    toSelect.value = start;
    getInfo();
}

swapBtn.addEventListener("click",swapOptions)

function showPath(start, end){
    let pathStr = `<div class="path-container">`;
    const stations = stationsObj.getStationsBetween(start,end);
    stations.forEach((path)=>{
        
        pathStr += `<div class = 'line${path.line}'><h3>${path.line == 1?"الخط الأول":(path.line == 2 ? "الخط الثاني" : "الخط الثالث")}</h3> <ul class = 'line'>`
        path.stations.forEach(stat=>{
            let isInterchange = stationsObj.getInterchange(stat);
            pathStr += `<li ${isInterchange?"class='interchange'":""}>${stationsObj.getArabicName(stat)}</li>`
        })
        pathStr += `</ul></div>`
    })
    pathStr += `</div>`;
    path.innerHTML = pathStr;
}



