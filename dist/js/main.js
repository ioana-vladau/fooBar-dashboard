"use strict";

//https://google-developers.appspot.com/chart/interactive/docs/gallery/piechart

// function getImage(imgPath){
//     return imgPath;
// }

// Load the Visualization API and the piechart package.
google.charts.load('current', {'packages':['corechart']});

// Set a callback to run when the Google Visualization API is loaded.
function drawChart() {
//source https://stackoverflow.com/questions/22477612/converting-array-of-objects-into-array-of-arrays
    let output = popul.map(function(obj) {
        return Object.keys(obj).sort().map(function(key) { 
            return obj[key];
        });
    });

    let header = [["beer name", "popularity"]]
    let concatenated = header.concat(output);
    //console.log(concatenated)
    // console.log("beer popularity should change")

    var data =  google.visualization.arrayToDataTable(concatenated);

    var options = {
        legend: { position: 'right', alignment: 'start' },
        pieSliceText: 'label',
        pieHole: 0.4,
        legend: {
            position: 'right', 
            marginTop: "150px",
            textStyle: {color: 'blue', fontSize: 14}
        },
        // slices: {  
        //     2: {offset: 0.2},
        //     4: {offset: 0.1},
        //     6: {offset: 0.05},
        //     8: {offset: 0.3},
        // },
        chartArea:
            {
                width:'80%',height:'100%'
            }
    };

    var chart = new google.visualization.PieChart(document.getElementById('piechart'));
    chart.draw(data, options);
}

function drawBasic() {
    
    //headerTaps=[];

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



let popul = [];

let tapGraphArray = [];

let beerImgsArray = [];

let lastCustomerId = -1;
let customersServedToday = 0;
let lastServedCustomerId = -1;

let beersServedToday = 0;
let totalNumberOfBeers = 0;



//on DOMContentLoaded, run a setInterval function that fetches the data once X seconds
window.addEventListener("DOMContentLoaded", ()=>{

    navigationLinks();
    google.charts.setOnLoadCallback(drawChart);
    google.charts.setOnLoadCallback(drawBasic);

    let data = JSON.parse(FooBar.getData());
    init(data);

    buildData(data);
    refreshData(data);

    setInterval(()=>{
        //instead of declaring 2 separate variables for getData and parse, 
        //I used only one and converted the text into a JavaScript object
        let data = JSON.parse(FooBar.getData());
        //convert text into a JavaScript object
        refreshData(data);
        //interval show
        google.charts.setOnLoadCallback(drawChart);
        google.charts.setOnLoadCallback(drawBasic);
        //console.log(data)
    }, 7000);  
});

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
        })
    }
}

function init(data){
    initBeerPopularity(data);
}

function initBeerPopularity(data){
    //console.log(data.beernames)
    for(let i=0; i<data.beertypes.length; i++){
        popul[i] = {
            name: data.beertypes[i].name,
            popularity: data.beertypes[i].popularity
        }
    }
    //console.log("array of popularity")
    //console.log(popul)
}

function buildData(allData){
    showBarName(allData.bar);
    showClosingTime(allData.bar);
}

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

function showBarName(bar){
    document.querySelector(".w3-bar-item").innerHTML = bar.name;
}

let headerTaps = [];

function showBeerLevel(taps){
    //console.log(taps)
    // headerTaps[0] = [["Beer name", "Percentage Left"]];

    headerTaps= [["Beer", "% left"]]

    taps.forEach((tap,i)=>{
        //let tapLevelNameClass = "tap-" + (i+1) + "-name";
        let percentageLeft = tap.level*100/tap.capacity;
        //let percentageLeftClass = "tap-" + (i+1) + "-percentage";
        //let barClass = "tap-" + (i+1) + "-bar";
        // document.querySelector("." + tapLevelNameClass).innerHTML = `${tap.beer}`;
        // document.querySelector("." + percentageLeftClass).innerHTML = `${percentageLeft}% left`;
        // document.querySelector("." + barClass).style.height = `${percentageLeft}px`;

        headerTaps.push([tap.beer, percentageLeft])

    });

    //console.log(headerTaps)
};

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
        document.querySelector("." + bartenderImg).src = "gfx\/bartenders\/" + bartenderImgs[i];
        // document.querySelector(".beer-details-img-" + (i+1)).src = getImage("gfx\/beer-labels\/") + beerImgs[i];

    });
};

function showClosingTime(time){
    // console.log(time.closingTime)
    //original closing time
    let closingTime = time.closingTime;
    let closingHour = closingTime.substr(0,2);
    // let closingMinutes = 60;
   
    let currentHour = new Date().getHours();
    let currentMinutes = new Date().getMinutes();

    let remainingHours = closingHour.substr(0,2) - currentHour;
    let remainingMinutes = 60 - currentMinutes;

    document.querySelector(".closing-time").innerHTML = closingTime;
    document.querySelector(".closing-time-minutes").innerHTML = remainingMinutes;

    if(remainingMinutes>=0){
        if(closingHour - currentHour - 1 === 0){
            document.querySelector(".closing-time-hour").innerHTML = "";
        }
        else {
            document.querySelector(".closing-time-hour").innerHTML = closingHour - currentHour - 1;
        }
    } else {
        document.querySelector(".closing-time-hour").innerHTML = closingHour - currentHour;
    }
}


function showPeopleInQueue(people){
    document.querySelector(".people-in-queue").innerHTML = people.length;
}


function showBeersServedToday(serving){
    //console.log("people currently being SERVED")
    //console.log(serving)

    serving.forEach(customer=>{
        //console.log(customer.order.length)
        if(customer.id > lastServedCustomerId){
            beersServedToday += customer.order.length;
        }
    })

    if(serving.length>0){
        lastServedCustomerId=serving[serving.length-1].id;
    }

    document.querySelector(".beers-served-today").innerHTML = beersServedToday;
}


function showBeerPopularity(data){
    
    for(let i=0; i<data.queue.length; i++){
        const customer = data.queue[i];
        if(lastCustomerId < customer.id){
            //console.log(customer.order)
            for(let j=0; j<customer.order.length; j++){
                //.log("add +1 to popul at beer " + customer.order[j]);
                const popObj = popul.find(obj=>
                    //if it's true then it will return it in the popul
                    obj.name === customer.order[j]    
                );
                popObj.popularity++;
               // popul.name = data.queue[i].order[j];
               // popul.popularity++;
            }

            lastCustomerId = customer.id;
        }
    }
}


function showCustomersServed(customers){
    if(customers.length > 0 && customers[0].id) {
        let lastCustomerId = customers[customers.length-1].id + 1;
        customersServedToday =  customers[0].id;
        //console.log(customers[0].id)
    }
    document.querySelector(".customers-served-today").innerHTML = customersServedToday;
}

function showStorage(storage){
    // I WON'T USE TEMPLATE BECAUSE I WILL JUST UPDATE THE STORAGE AND NOTE CLONE CONTINUOUSLY
    // document.querySelector("#kegs-list").innerHTML="";

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
    })
}

function showBeerDetails(beertypes){
    let beerImgs = ["elhefebottle.png", "fairytalealebottle.png", "githopbottle.png", "hollabackbottle.png", "hoppilyeverafterbottle.png", "mowintimebottle.png", "row26bottle.png", "ruinedchildhoodbottle.png", "sleighridebottle.png", "steampunkbottle.png"];
    // console.log(beerImgs)
    let alc;

    for(let i=0; i<beertypes.length; i++){
        alc=beertypes[i].alc;
        console.log(beertypes[i].description.overallImpression)

        //console.log(beertypes[i])
        document.querySelector(".beer-details-name-" + (i+1)).innerHTML = beertypes[i].name;
        document.querySelector(".beer-details-category-" + (i+1)).innerHTML = beertypes[i].category;
        document.querySelector(".beer-details-alcohol-" + (i+1)).innerHTML = alc + " %";
        if(alc>=4 && alc <=6){
            document.querySelector(".beer-details-alcohol-" + (i+1)).style.backgroundColor = "#9BC3EF";
        } else if(alc>6 && alc <=8){
            document.querySelector(".beer-details-alcohol-" + (i+1)).style.backgroundColor = "#78ccb3";
        } else if(alc>8 && alc <=9){
            document.querySelector(".beer-details-alcohol-" + (i+1)).style.backgroundColor = "#FABB71";
        } else{
            document.querySelector(".beer-details-alcohol-" + (i+1)).style.backgroundColor = "#F06B50";
        }
        
        document.querySelector(".beer-details-img-" + (i+1)).src = "gfx\/beer-labels\/" + beerImgs[i];
        document.querySelector(".beer-description-" + (i+1)).innerHTML = beertypes[i].description.overallImpression;
    }

}

function showAvgBeersPerCustomer(){
    if(!beersServedToday/customersServedToday){
        document.querySelector(".avg-beers-per-customer").innerHTML = 0;
    } else {
        //take only 1 decimal after comma
        document.querySelector(".avg-beers-per-customer").innerHTML = Math.round( beersServedToday/customersServedToday * 10 ) / 10;;
    }
}