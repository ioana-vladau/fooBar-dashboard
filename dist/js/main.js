"use strict";
//https://google-developers.appspot.com/chart/interactive/docs/gallery/piechart
// Load the Visualization API and the piechart package.
google.charts.load('current', {'packages':['corechart']});

//global variables, used in more than one function
let popul = [];
let tapGraphArray = [];
let beerImgsArray = [];
let lastCustomerId = -1;
let customersServedToday = 0;
let beersServedToday = 0;
let totalNumberOfBeers = 0;

//on DOMContentLoaded, run a setInterval function that fetches the data once 7 seconds
window.addEventListener("DOMContentLoaded", ()=>{
    navigationLinks();

    let data = JSON.parse(FooBar.getData());
    init(data);

    buildData(data);
    refreshData(data);

    google.charts.setOnLoadCallback(drawChart);
    google.charts.setOnLoadCallback(drawBasic);

    setInterval(()=>{
        let data = JSON.parse(FooBar.getData());
        refreshData(data);
        google.charts.setOnLoadCallback(drawChart);
        google.charts.setOnLoadCallback(drawBasic);
    }, 7000);  
});

//depending on which HTML element the user clicks, hide the other mains
//single page website - like
function navigationLinks(){
    let navigationLinks = ["dashboard", "storage", "beer"];

    for(let i=0; i<navigationLinks.length; i++){
        document.querySelector("#" + "navigate-to-" + navigationLinks[i]).addEventListener("click", e=>{
            e.preventDefault();
            //console.log("you clicked " + navigationLinks[i]);
            document.querySelector("#" + "main-" + navigationLinks[i]).classList.remove("hidden");
            document.querySelector("#" + "navigate-to-" + navigationLinks[i]).classList.add("active-link");

            if(i===0){
                document.querySelector("#" + "main-" + navigationLinks[i+1]).classList.add("hidden");
                document.querySelector("#" + "main-" + navigationLinks[i+2]).classList.add("hidden");
                document.querySelector("#" + "navigate-to-" + navigationLinks[i+1]).classList.remove("active-link");
                document.querySelector("#" + "navigate-to-" + navigationLinks[i+2]).classList.remove("active-link");

            } else if(i===1){
                document.querySelector("#" + "main-" + navigationLinks[i+1]).classList.add("hidden");
                document.querySelector("#" + "main-" + navigationLinks[i-1]).classList.add("hidden");
                document.querySelector("#" + "navigate-to-" + navigationLinks[i+1]).classList.remove("active-link");
                document.querySelector("#" + "navigate-to-" + navigationLinks[i-1]).classList.remove("active-link");

            } else if(i===2){
                document.querySelector("#" + "main-" + navigationLinks[i-1]).classList.add("hidden");
                document.querySelector("#" + "main-" + navigationLinks[i-2]).classList.add("hidden");
                document.querySelector("#" + "navigate-to-" + navigationLinks[i-1]).classList.remove("active-link");
                document.querySelector("#" + "navigate-to-" + navigationLinks[i-2]).classList.remove("active-link");
            }
        });
    }
}

// init function does not make a lot of sense now because it contains only one function, but 
// if I had more init functions, it would definitely help keep them together
function init(data){
    initBeerPopularity(data);
}

// data shown on first load
function buildData(allData){
    showBarName(allData.bar);
    showClosingTime(allData.bar);
}

// data that refreshes every 7 seconds
function refreshData(allData){
    showBeerLevel(allData.taps);
    showBartenders(allData.bartenders);
    showClosingTime(allData.bar);
    showPeopleInQueue(allData.queue);
    showBeersServedToday(allData.serving);
    showBeerPopularity(allData);
    showCustomersServed(allData.queue);
    showStorage(allData.storage);
    showBeerDetails(allData.beertypes);
    showAvgBeersPerCustomer(allData);
}

// initialize beer popularity object with the initial popularities that are 1 and the beer names
function initBeerPopularity(data){
    //console.log(data.beernames)
    for(let i=0; i<data.beertypes.length; i++){
        popul[i] = {
            name: data.beertypes[i].name,
            popularity: data.beertypes[i].popularity
        }
    }
}

// function to display bar name
function showBarName(bar){
    document.querySelector(".w3-bar-item").innerHTML = bar.name;
}


// declared the variable here because it helped me visualize better while working on the function
// calculate the beer level left
let headerTaps = [];
function showBeerLevel(taps){
    headerTaps= [["Beer", "% left"]]

    taps.forEach((tap,i)=>{
        let percentageLeft = tap.level*100/tap.capacity;

        headerTaps.push([tap.beer, percentageLeft])
    });
};

// add here the image names + extensions that will be concatenated to the src
let bartenderImgs = ["peter.png", "jonas.png", "martin.png"];
function showBartenders(bartenders){
    bartenders.forEach((bartender,i)=>{
        let bartenderName = "bartender-name-" + (i+1);
        let bartenderStatus = "bartender-status-" + (i+1);
        let bartenderImg = "bartender-img-" + (i+1);
        let bartenderStatusColor = "bartender-status-" + (i+1);
        document.querySelector("." + bartenderName).innerHTML = `${bartender.name}`;

        if(bartender.status === "READY"){
            document.querySelector("." + bartenderImg).classList.add("grayscale");
            document.querySelector("." + bartenderImg).classList.add("grayscale");
            document.querySelector("." + bartenderStatusColor).style.color = "#FABB71";
        } else {
            document.querySelector("." + bartenderImg).classList.remove("grayscale");
            document.querySelector("." + bartenderStatusColor).style.color = "#78ccb3";
        }

        document.querySelector("." + bartenderStatus).innerHTML = `${bartender.status}`;
        // change here if path is different
        document.querySelector("." + bartenderImg).src = "gfx\/bartenders\/" + bartenderImgs[i];
    });
};

// calculate how much time is left until bar closes
function showClosingTime(time){

    let closingTime = time.closingTime;
    let closingHour = closingTime.substr(0,2);
   
    let currentHour = new Date().getHours();
    let currentMinutes = new Date().getMinutes();

    let remainingHours = closingHour.substr(0,2) - currentHour;
    let remainingMinutes = 60 - currentMinutes;

    let openingHour = 10;

    document.querySelector(".closing-time").innerHTML = closingTime.substr(0,5);
    if(new Date().getMinutes()<10){
        document.querySelector(".current-time").innerHTML =  new Date().getHours() + ":" + "0" + new Date().getMinutes();
    } else {
        document.querySelector(".current-time").innerHTML =  new Date().getHours() + ":" + new Date().getMinutes();
    }

    //it's not triple equal because typeOf(closingHour) is string and currentHour is number
    if(closingHour - currentHour == 0){
            document.querySelector(".closing-status").innerHTML = "the bar just closed"
    } else if(closingHour>currentHour){
        document.querySelector(".closing-status").innerHTML = `${closingHour - currentHour - 1}h ${remainingMinutes}mins`;
    } else{
        document.querySelector(".closing-status").innerHTML = "the bar is CLOSED";
    }
}

// grab the data for how many people there are in queue at every fetch
function showPeopleInQueue(people){
    document.querySelector(".people-in-queue").innerHTML = people.length;
}

//lastServedCustomerId is -1 because the first time it loops, customer.id will be 0
let lastServedCustomerId = -1;
function showBeersServedToday(serving){
    serving.forEach(customer=>{
        // add the beers only if the customer has not been already served
        if(customer.id > lastServedCustomerId){
            beersServedToday += customer.order.length;
        }
    });

    // if there are beers in the order, the lastServedCustomerId will be grabbed from the last customer
    // serving.length-1 because array starts from 0
    if(serving.length>0){
        lastServedCustomerId=serving[serving.length-1].id;
    }

    document.querySelector(".beers-served-today").innerHTML = beersServedToday;
}


// one of the hardest functions to make
function showBeerPopularity(data){
    for(let i=0; i<data.queue.length; i++){
        const customer = data.queue[i];
        // if the customer has not already been there
        if(lastCustomerId < customer.id){
            //for each customer and for each beer
            for(let j=0; j<customer.order.length; j++){
                //.log("add +1 to popul at beer " + customer.order[j]);
                // populate popObj with the name of the beer
                const popObj = popul.find(obj=>
                    //if it's true then it will return it in the popul
                    obj.name === customer.order[j]    
                );
                // add popularity to that beer
                popObj.popularity++;
               // popul.name = data.queue[i].order[j];
               // popul.popularity++;
            }

            lastCustomerId = customer.id;
        }
    }
}

// a little hard to make as well, would not work if the ids would not be consecutive numbers
function showCustomersServed(customers){
    // the if is just there to avoid throwing an error because there are no people in queue
    if(customers.length > 0 && customers[0].id) {
        let lastCustomerId = customers[customers.length-1].id + 1;
        // customersServedToday will become the id of the first person in queue
        customersServedToday =  customers[0].id;
    }
    document.querySelector(".customers-served-today").innerHTML = customersServedToday;
}

function showStorage(storage){
    // I will not use a template, as I know the exact number of kegs 
    // (Peter recommended to do in html, rather than js)

    storage.forEach((keg,i)=>{
        document.querySelector(".keg-name-" + (i+1)).innerHTML = keg.name;
        document.querySelector(".keg-amount-" + (i+1)).innerHTML = keg.amount;
        document.querySelector(".keg-amount-bar-" + (i+1)).style.width = "5vw";
        document.querySelector(".keg-amount-bar-" + (i+1)).style.height = `${keg.amount*2}em`;
        
        if(keg.amount<3){
            document.querySelector(".keg-amount-bar-" + (i+1)).style.backgroundColor = `#F06B50`;
            document.querySelector(".keg-levels-buy").style.backgroundColor = `#F06B50`;
        } else {
            document.querySelector(".keg-amount-bar-" + (i+1)).style.backgroundColor = `#9BC3EF`;
            document.querySelector(".keg-levels-enough").style.backgroundColor = `#9BC3EF`;
        }
    });
}

function showBeerDetails(beertypes){
    let beerImgs = ["elhefebottle.png", "fairytalealebottle.png", "githopbottle.png", "hollabackbottle.png", "hoppilyeverafterbottle.png", "mowintimebottle.png", "row26bottle.png", "ruinedchildhoodbottle.png", "sleighridebottle.png", "steampunkbottle.png"];
    let alc;

    for(let i=0; i<beertypes.length; i++){
        alc = beertypes[i].alc;

        document.querySelector(".beer-details-name-" + (i+1)).innerHTML = beertypes[i].name;
        document.querySelector(".beer-details-category-" + (i+1)).innerHTML = beertypes[i].category;
        document.querySelector(".beer-details-alcohol-" + (i+1)).innerHTML = alc + " %";

        // depending on the amount of alcohol, show different label colors
        if(alc>=4 && alc <=6){
            document.querySelector(".beer-details-alcohol-" + (i+1)).style.backgroundColor = "#9BC3EF"; //blue
        } else if(alc>6 && alc <=8){
            document.querySelector(".beer-details-alcohol-" + (i+1)).style.backgroundColor = "#78ccb3"; //green
        } else if(alc>8 && alc <=9){
            document.querySelector(".beer-details-alcohol-" + (i+1)).style.backgroundColor = "#FABB71"; //orange
        } else{
            document.querySelector(".beer-details-alcohol-" + (i+1)).style.backgroundColor = "#F06B50"; //red
        }
        
        // change here if path is different
        document.querySelector(".beer-details-img-" + (i+1)).src = "gfx\/beer-labels\/" + beerImgs[i];
        document.querySelector(".beer-description-" + (i+1)).innerHTML = beertypes[i].description.overallImpression;
    }

}

function showAvgBeersPerCustomer(){
    // if no beers served
    if(!beersServedToday/customersServedToday){
        document.querySelector(".avg-beers-per-customer").innerHTML = 0;
    } else {
        //take only 1 decimal after comma
        document.querySelector(".avg-beers-per-customer").innerHTML = Math.round( beersServedToday/customersServedToday * 10 ) / 10;;
    }
}

function drawChart() {
    //source https://stackoverflow.com/questions/22477612/converting-array-of-objects-into-array-of-arrays
    let output = popul.map(function(obj) {
        return Object.keys(obj).sort().map(function(key) { 
            return obj[key];
        });
    });

    let header = [["beer name", "popularity"]];
    let concatenated = header.concat(output); // to have google's structure

    var data =  google.visualization.arrayToDataTable(concatenated);

    var options = {
        legend: { position: 'right', alignment: 'start' },
        pieSliceText: 'label',
        pieHole: 0.4,
        legend: {
            position: 'right', 
            marginTop: "150px",
            textStyle: {color: '#23282D', fontSize: 14}
        },
        chartArea:{
            width:'80%',height:'100%'
        }
    };

    var chart = new google.visualization.PieChart(document.getElementById('piechart'));
    chart.draw(data, options);
}

function drawBasic() {
    // ORIGINAL STRUCTURE

    // var data = google.visualization.arrayToDataTable([
    //   ['Beer', 'Percentage Left'],
    //   ['New York City, NY', 8175000],
    //   ['Los Angeles, CA', 3792000],
    //   ['Chicago, IL', 2695000],
    //   ['Houston, TX', 2099000],
    //   ['Philadelphia, PA', 1526000]
    // ]);

    var data = google.visualization.arrayToDataTable(headerTaps);

    var options = {
      title: '% Left in Taps',
      chartArea: {width: '50%'},
      colors: ['#78ccb3'],
      bar: {groupWidth: "80%"},
      height: 400,      
      hAxis: {
        title: 'Percentage Left',
        minValue: 0
      },
      vAxis: {
        title: 'Beer Tap'
      }
    };

    var chart = new google.visualization.BarChart(document.getElementById('chart_div'));

    chart.draw(data, options);
  }