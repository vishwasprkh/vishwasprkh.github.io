const IPINFO_API = "https://ipinfo.io/json?token=ded7e92a5b9299";
const GEOCODE_KEY = "AIzaSyDM8hn7BgNIIjOLPUxfGtIeOamc7vBb5To";
const WEATHERCODE_DATA = {
    1000: {
        description: "Clear",
        url: "Images/Weather Symbols for Weather Codes/clear_day.svg"
    },
    1100: {
        description: "Mostly Clear",
        url: "Images/Weather Symbols for Weather Codes/mostly_clear_day.svg"
    },
    1101: {
        description: "Partly Cloudy",
        url: "Images/Weather Symbols for Weather Codes/partly_cloudy_day.svg"
    },
    1102: {
        description: "Mostly Cloudy",
        url: "Images/Weather Symbols for Weather Codes/mostly_cloudy.svg"
    },
    1001: {
        description: "Cloudy",
        url: "Images/Weather Symbols for Weather Codes/cloudy.svg"
    },
    2100: {
        description: "Light Fog",
        url: "Images/Weather Symbols for Weather Codes/fog_light.svg"
    },
    2000: {
        description: "Fog",
        url: "Images/Weather Symbols for Weather Codes/fog.svg"
    },
    4000: {
        description: "Drizzle",
        url: "Images/Weather Symbols for Weather Codes/drizzle.svg"
    },
    4200: {
        description: "Light Rain",
        url: "Images/Weather Symbols for Weather Codes/rain_light.svg"
    },
    4001: {
        description: "Rain",
        url: "Images/Weather Symbols for Weather Codes/rain.svg"
    },
    4201: {
        description: "Heavy Rain",
        url: "Images/Weather Symbols for Weather Codes/rain_heavy.svg"
    },
    5001: {
        description: "Flurries",
        url: "Images/Weather Symbols for Weather Codes/flurries.svg"
    },
    5100: {
        description: "Light Snow",
        url: "Images/Weather Symbols for Weather Codes/snow_light.svg"
    },
    5000: {
        description: "Snow",
        url: "Images/Weather Symbols for Weather Codes/snow.svg"
    },
    5101: {
        description: "Heavy Snow",
        url: "Images/Weather Symbols for Weather Codes/snow_heavy.svg"
    },
    6000: {
        description: "Freezing Drizzle",
        url: "Images/Weather Symbols for Weather Codes/freezing_drizzle.svg"
    },
    6200: {
        description: "Light Freezing Drizzle",
        url: "Images/Weather Symbols for Weather Codes/freezing_rain_light.svg"
    },
    6001: {
        description: "Freezing Rain",
        url: "Images/Weather Symbols for Weather Codes/freezing_rain.svg"
    },
    6201: {
        description: "Heavy Freezing Rain",
        url: "Images/Weather Symbols for Weather Codes/freezing_rain_heavy.svg"
    },
    7102: {
        description: "Light Ice Pellets",
        url: "Images/Weather Symbols for Weather Codes/ice_pellets_light.svg"
    },
    7000: {
        description: "Ice Pellets",
        url: "Images/Weather Symbols for Weather Codes/ice_pellets.svg"
    },
    7101: {
        description: "Heavy Ice Pellets",
        url: "Images/Weather Symbols for Weather Codes/ice_pellets_heavy.svg"
    },
    8000: {
        description: "Thunderstorm",
        url: "Images/Weather Symbols for Weather Codes/tstorm.svg"
    },
    1: {
        description: "Mostly Clear",
        url: "Images/Weather Symbols for Weather Codes/mostly_clear_day.svg"
    }
}

const PRECIPITATION = {
    0: "N/A",
    1: "Rain",
    2: "Snow",
    3: "Freezing Rain",
    4: "Ice Pellets"
}

document.addEventListener('DOMContentLoaded', function () {

    window.onload = function() {
        clearForm();
    }

    let globalWeekData, globalHourlyData;

    let chartVisible = false;
    const toggleButton = document.getElementById('toggleButton');
    const weatherCharts = document.getElementById('weatherCharts');

    toggleButton.addEventListener('click', () => {
        chartVisible = !chartVisible;

        if (chartVisible) {
            weatherCharts.style.display = "block";
            fillTemperatureChart(globalWeekData);
            fillHourlyData(globalHourlyData);
            toggleButton.src = 'Images/point-up-512.png'; 
        } else {
            weatherCharts.style.display = "none";
            toggleButton.src = 'Images/point-down-512.png';
        }
    });

    const resetButton = document.getElementById('clear-button');
    resetButton.addEventListener('click', () => {
        clearForm();
    })

    const autoCheck = document.getElementById('autoCheck');
    autoCheck.addEventListener('change', () => {
        clearAllOtherFields();
    })

    const weatherForm = document.getElementById('weather-form');
    weatherForm.addEventListener('submit', function(event) {
        event.preventDefault();
        getDetails();
    });

    async function getDetails(){
        const selfDetect = document.getElementById("autoCheck").checked;
        let latitude;
        let longitude;
        clearAllCharts();
        if(selfDetect) {
            try {
                const ipInfo = await fetch(IPINFO_API); 
                const data = await ipInfo.json();
                if(data && data.loc) {
                    latitude = data.loc.split(",")[0];
                    longitude = data.loc.split(",")[1];
                    const address = data.city + ", " + data.region + ", " + data.country;
                    await fetchDataFromPythonServer(latitude, longitude, address);
                }
            } catch(error) {
                clearEverthingExceptNoResults();
                return;
            }
        } else {
            const street = document.getElementById("street").value;
            const city = document.getElementById("city").value;
            const state = document.getElementById("state").value;
            var address = `${street}, ${city}, ${state}`;
            try {
                const geoCode = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GEOCODE_KEY}`);
                const stateSpecificGeoCode = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(state)}&key=${GEOCODE_KEY}`);
                var data = await geoCode.json();
                if(data.status!=="OK"){
                    data = await stateSpecificGeoCode.json();
                }
                const location = data.results[0].geometry.location;
                latitude = location.lat;
                longitude = location.lng;
                await fetchDataFromPythonServer(latitude, longitude, data.results[0].formatted_address);
            } catch(error) {
                clearEverthingExceptNoResults();
                return;
            }
        }
    }

    async function fetchDataFromPythonServer(latitude, longitude, address){
        try {
            const hourDataUrl = `https://csci-571-436400.uw.r.appspot.com/get_json?latitude=${latitude}&longitude=${longitude}&type=hour`;
            const weekDataUrl = `https://csci-571-436400.uw.r.appspot.com/get_json?latitude=${latitude}&longitude=${longitude}&type=day`;
            const weekDataResponse = await fetch(weekDataUrl);
            const hourDataResponse = await fetch(hourDataUrl);
            if (!weekDataResponse.ok || !hourDataResponse.ok) {
                clearEverthingExceptNoResults();
                return;
            }
            const weekData = await weekDataResponse.json();
            const hourData = await hourDataResponse.json();
            fillDayData(weekData, address);
            document.getElementById("dayDataOuter").style.display = "block";
            fillWeekData(weekData);
            document.getElementById("weeklyDataOuter").style.display = "block";
            globalWeekData = weekData;
            globalHourlyData = hourData;
        } catch (error){
            clearEverthingExceptNoResults();
            return;
        }
    }

    function fillDayData(currentData, address){
        const weatherData = currentData.data.timelines[0].intervals[0].values;
        const temperature = weatherData.temperature;
        const humidity = weatherData.humidity;
        const pressure = weatherData.pressureSeaLevel;
        const windSpeed = weatherData.windSpeed;
        const visibility = weatherData.visibility;
        const cloudCover = weatherData.cloudCover;
        const uvIndex = weatherData.uvIndex;
        var weatherCode = weatherData.weatherCode;

        document.getElementById('location').innerText = address;
        document.getElementById('day-temperature').innerText = `${Math.round(temperature)}°`;
        document.getElementById('day-humidity').innerText = `${humidity}%`;
        document.getElementById('day-pressure').innerText = `${pressure.toFixed(2)}inHg`;
        document.getElementById('day-wind').innerText = `${windSpeed}mph`;
        document.getElementById('day-visibility').innerText = `${visibility}mi`;
        document.getElementById('day-cloud-cover').innerText = `${cloudCover}%`;
        document.getElementById('day-uv').innerText = uvIndex;
        if(!(weatherCode in WEATHERCODE_DATA)) weatherCode=1;
        document.getElementById('day-weather-icon').src = WEATHERCODE_DATA[weatherCode].url;
        document.getElementById('day-weather-description').innerText = WEATHERCODE_DATA[weatherCode].description;
    }

    function fillWeekData(weekData){
        const tableBody = document.getElementById("weeklyWeatherData");
        tableBody.innerHTML = "";
        const dailyData = weekData.data.timelines[0].intervals;
        dailyData.forEach(day => {
            const values = day.values;
            const weatherCode = values.weatherCode;
            const tempMin = values.temperatureMin;
            const tempMax = values.temperatureMax;
            const windSpeed = values.windSpeed;

            if(!(weatherCode in WEATHERCODE_DATA)) weatherCode=1;

            const row = document.createElement("tr");
            const dateCell = document.createElement("td");
            dateCell.textContent = dayAndDate(day.startTime);
            row.appendChild(dateCell);

            const statusCell = document.createElement("td");
            statusCell.classList.add("status-cell");
            const icon = document.createElement("img");
            icon.src = WEATHERCODE_DATA[weatherCode].url;
            icon.classList.add("status-icon");
            statusCell.appendChild(icon);
            const statusText = document.createTextNode(WEATHERCODE_DATA[weatherCode].description);
            statusCell.appendChild(statusText);
            row.appendChild(statusCell);

            const tempMaxCell = document.createElement("td");
            tempMaxCell.textContent = tempMax.toFixed(2);
            row.appendChild(tempMaxCell);

            const tempMinCell = document.createElement("td");
            tempMinCell.textContent = tempMin.toFixed(2);
            row.appendChild(tempMinCell);

            const windSpeedCell = document.createElement("td");
            windSpeedCell.textContent = windSpeed.toFixed(2);
            row.appendChild(windSpeedCell);

            tableBody.appendChild(row);
            row.addEventListener("click", () => displayDetails(day));
        });
    }

    function fillHourlyData(hourData){

        const temperatures = [];
        const humidity = [];
        const winds = [];
        const pressures = [];

        const timeline = hourData.data.timelines[0].intervals;
        var count = 0;
        var total = 0;
        timeline.forEach(interval => {
            count++;
            total+=interval.values.pressureSeaLevel;
        })

        timeline.forEach(interval => {
            const time = Date.parse(interval.startTime);
            const values = interval.values;
            temperatures.push({ x: time, y: Math.trunc(values.temperature) });
            humidity.push({ x: time, y: Math.trunc(values.humidity) });
            winds.push({ x: time, value: values.windSpeed, direction: values.windDirection });
            pressures.push({ x: time, y: Math.trunc(total/count) });
        });

        Highcharts.chart('hourlyWeatherChart', {
            chart: {
                marginBottom: 70,
                marginRight: 50,
                marginLeft: 50,
                marginTop: 50,
                spacingLeft: 0,
                spacingRight: 0,
                plotBorderWidth: 1,
                height: 400,
                alignTicks: false,
                scrollablePlotArea: {
                    minWidth: 720
                }
            },
            title: {
                text: 'Hourly Weather (For Next 5 Days)',
                align: 'center',
                style: {
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis'
                }
            },
            tooltip: {
                shared: true,
                useHTML: true,
                headerFormat: '<small>{point.x:%A, %b %e, %H:%M}</small><br>'
            },
            xAxis: [{ 
                type: 'datetime',
                minPadding: 0,
                maxPadding: 0,
                tickInterval: 3600 * 2000,
                minorTickInterval: 3600 * 1000,
                gridLineWidth: 1,
                minorGridLineWidth: 1,
                tickLength: 0,
                gridLineColor: 'rgba(128, 128, 128, 0.2)',
                labels: {
                    format: '{value:%H}'
                },
                crosshair: true,
                title: {
                    text: null 
                }
            }, { 
                linkedTo: 0,  
                type: 'datetime', 
                tickInterval: 24 * 36e5, 
                labels: {
                    format: '{value:%a %b %e}',  
                },
                opposite: true,  
                title: {
                    text: null 
                }
            }],
            yAxis: [{ 
                title: {
                    text: null
                },
                tickInterval: 5,
                labels: {
                    format: '{value}°',
                    style: {
                        fontSize: '10px'
                    },
                    x: -3
                },
                gridLineColor: 'rgba(128, 128, 128, 0.1)'
            }, { 
                title: {
                    text: '',
                },
                labels: {
                    enabled: false
                },
                opposite: true,
                gridLineWidth: 0
            }, { 
                title: {
                    text: ''
                },
                labels: {
                    format: '{value}',
                    style: {
                        fontSize: '10px',
                        color: '#EFAD3C'
                    }
                },
                opposite: true,
                gridLineWidth: 0
            }],
            legend: {
                enabled: false 
            },
            series: [{
                name: 'Temperature',
                data: temperatures,
                type: 'spline',
                marker: {
                    enabled: false,
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.y}°C</b><br/>'
                },
                zIndex: 1,
                color: '#F13638'
            }, {
                name: 'Humidity',
                data: humidity,
                type: 'column',
                color: '#87CCFE',
                yAxis: 1,
                pointPadding: 0,
                groupPadding: 0,
                tooltip: {
                    valueSuffix: ' %'
                },
                dataLabels: {
                    enabled: true, 
                    inside: false, 
                    style: {
                        fontSize: '10px',
                        fontWeight: 'bold',
                        color: '#000000' 
                    }
                }
            }, {
                name: 'Air Pressure',
                data: pressures,
                type: 'spline',
                color: '#EFAD3C',
                dashStyle: 'dot',
                marker: {
                    enabled: false
                },
                yAxis: 2, 
                tooltip: {
                    valueSuffix: ' hPa'
                }
            }, {
                name: 'Wind',
                type: 'windbarb',
                id: 'windbarbs',
                color: '#524EBB',
                lineWidth: 1.5,
                data: winds.filter((_, i) => i % 2 === 0),
                vectorLength: 8,
                yOffset: 7,
                tooltip: {
                    valueSuffix: ' m/s'
                }
            }]
        });
    }

    function fillTemperatureChart(weekData){
        const dayData = weekData.data.timelines[0].intervals;
        const modifiedData = generateDates(dayData);
        Highcharts.chart('temperatureRangeChart', {
            chart: {
                type: 'arearange',
                zooming: {
                    type: 'x'
                }
            },
            title: {
                text: 'Temperature Ranges (Min, Max)'
            },
            xAxis: {
                type: 'category',
                categories: modifiedData,
                tickLength: 10,
                tickWidth: 1
            },
            yAxis: {
                title: {
                    text: null
                }
            },
            legend: {
                enabled: false
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                valueSuffix: '°F',
                pointFormat: '<b>Temperature: {point.low} - {point.high} °F</b>'
            },
            series: [{
                name: '',
                data: generateData(dayData),
                color: {
                    linearGradient: {x1: 0, x2: 0, y1: 0, y2: 1},
                    stops: [[0, '#f8a829'], [1, '#cce8fc']]
                },
                marker: {
                    enabled: true,
                    fillColor: '#2caefc',
                    radius: 4
                },
                lineColor: '#f7a824',
                lineWidth: 2,
                states: {
                    hover: {
                        marker: {
                            enabled: true,
                            fillColor: '#2caefc' 
                        }
                    }
                }
            }]
        });
    }

    function displayDetails(dayData){
        const detailsDiv = document.getElementById("dailyWeatherDetails");

        const values = dayData.values;
        const weatherCode = values.weatherCode;
        const tempMin = values.temperatureMin;
        const tempMax = values.temperatureMax;
        const windSpeed = values.windSpeed;
        const precipitation = values.precipitationType;
        const chanceOfRain = values.precipitationProbability;
        const visibility = values.visibility;
        const humidity = values.humidity;
        const sunrise = values.sunriseTime;
        const sunset = values.sunsetTime;

        const dayDate = dayAndDate(dayData.startTime);
        if(!(weatherCode in WEATHERCODE_DATA)) weatherCode=1;

        detailsDiv.innerHTML = `
            <div class="dailyWeatherDetailsText">
                <div class="dailyWeatherDetailsHeaders">
                    <p>${dayDate}</p>
                    <p>${WEATHERCODE_DATA[weatherCode].description}</p>
                    <h2><strong>${tempMax}°F/${tempMin}°F</strong></h2>
                </div>
                <img src="${WEATHERCODE_DATA[weatherCode].url}" class="dailyWeatherImage" />
            </div>
            <div class="dailyWeatherDetailsSubText">
                <p><span class="detailsLabel">Precipitation: </span> <span class="detailsValues"> ${PRECIPITATION[precipitation] || 'N/A'} </span> </p>
                <p><span class="detailsLabel">Chance of Rain: </span> <span class="detailsValues"> ${chanceOfRain}% </span> </p>
                <p><span class="detailsLabel">Wind Speed: </span> <span class="detailsValues"> ${windSpeed} mph </span> </p>
                <p><span class="detailsLabel">Humidity: </span> <span class="detailsValues"> ${humidity}% </span> </p>
                <p><span class="detailsLabel">Visibility: </span> <span class="detailsValues"> ${visibility} mi </span> </p>
                <p><span class="detailsLabel">Sunrise/Sunset: </span> <span class="detailsValues"> ${timeIn12h(sunrise)}/${timeIn12h(sunset)} </span> </p>
            </div>
        `;

        document.getElementById("secondPageHeaders1").style.display = "block";
        document.getElementById("secondPageHeaders2").style.display = "block";
        document.getElementById("dividingLine1").style.display = "block";
        document.getElementById("dividingLine2").style.display = "block";
        document.getElementById("dailyWeatherDetails").style.display = "block";
        document.getElementById("dayDataOuter").style.display = "none";
        document.getElementById("weeklyDataOuter").style.display = "none";
        toggleButton.style.display = "block";
    }

    function generateDates(dayData){
        const data = [];
        dayData.forEach(day => {
            data.push(dateOnly(day.startTime));
        })
        return data;
    }

    function generateData(dayData) {
        return dayData.map(day => [day.values.temperatureMin, day.values.temperatureMax]);
    }

    function dateOnly(dateTime){
        const date = new Date(dateTime);
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const day = date.getDate();
        const month = months[date.getMonth()];
        return `${day} ${month}`;
    }

    function timeIn12h(dateTime){
        const date = new Date(dateTime);
        var hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours>=12 ? 'PM' : 'AM';
        hours = hours%12;
        hours = hours!=0 ? hours : 12;
        const minutesStr = minutes<10 ? '0'+minutes : minutes;
        return `${hours}:${minutesStr} ${ampm}`;
    }

    function dayAndDate(dateTime){
        const date = new Date(dateTime);
        const options = { day: 'numeric', month: 'short', year: 'numeric', weekday: 'long' };
        const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);
        const [weekday, month, day, year] = formattedDate.replace(',', '').split(' ');
        return `${weekday}, ${day} ${month} ${year}`;
    }

    function clearAllCharts(){
        document.getElementById("dayDataOuter").style.display = "none";
        document.getElementById("weeklyDataOuter").style.display = "none";
        document.getElementById("dailyWeatherDetails").style.display = "none";
        document.getElementById("secondPageHeaders1").style.display = "none";
        document.getElementById("secondPageHeaders2").style.display = "none";
        document.getElementById("dividingLine1").style.display = "none";
        document.getElementById("dividingLine2").style.display = "none";
        document.getElementById("noResults").style.display = "none";
        chartVisible = false;
        weatherCharts.style.display = "none";
        toggleButton.src = 'Images/point-down-512.png';
        toggleButton.style.display = "none";
    }

    function clearEverthingExceptNoResults(){
        document.getElementById("dayDataOuter").style.display = "none";
        document.getElementById("weeklyDataOuter").style.display = "none";
        document.getElementById("dailyWeatherDetails").style.display = "none";
        document.getElementById("secondPageHeaders1").style.display = "none";
        document.getElementById("secondPageHeaders2").style.display = "none";
        document.getElementById("dividingLine1").style.display = "none";
        document.getElementById("dividingLine2").style.display = "none";
        document.getElementById("noResults").style.display = "block";
        chartVisible = false;
        weatherCharts.style.display = "none";
        toggleButton.src = 'Images/point-down-512.png';
        toggleButton.style.display = "none";
    }

    function clearForm(){
        document.getElementById("autoCheck").checked = false;
        clearAllOtherFields();
        document.getElementById("dayDataOuter").style.display = "none";
        document.getElementById("weeklyDataOuter").style.display = "none";
        document.getElementById("dailyWeatherDetails").style.display = "none";
        document.getElementById("secondPageHeaders1").style.display = "none";
        document.getElementById("secondPageHeaders2").style.display = "none";
        document.getElementById("dividingLine1").style.display = "none";
        document.getElementById("dividingLine2").style.display = "none";
        document.getElementById("noResults").style.display = "none";
        chartVisible = false;
        weatherCharts.style.display = "none";
        toggleButton.src = 'Images/point-down-512.png';
        toggleButton.style.display = "none";
    }

    function clearAllOtherFields() {
        const selfDetect = document.getElementById("autoCheck").checked;
        const street = document.getElementById("street");
        const city = document.getElementById("city");
        const state = document.getElementById("state");
        if(selfDetect) {
            street.disabled=true;
            city.disabled=true;
            state.disabled=true;
            street.value="";
            city.value="";
            state.value="";
        } else {
            street.disabled=false;
            city.disabled=false;
            state.disabled=false;
        }
    }
})