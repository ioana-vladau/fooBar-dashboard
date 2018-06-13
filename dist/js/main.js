"use strict";
//https://google-developers.appspot.com/chart/interactive/docs/gallery/piechart

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

    //console.log(output)
    let header = [["beer name", "popularity"]]
    let concatenated = header.concat(output)
    //console.log(concatenated)
    // console.log("beer popularity should change")

    var data =  google.visualization.arrayToDataTable(concatenated);

    var options = {
        title: 'Beer popularity',
        pieHole: 0.4
    };

    var chart = new google.visualization.PieChart(document.getElementById('piechart'));
    chart.draw(data, options);
}



let popul = [];

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

    let data = JSON.parse(FooBar.getData());
    init(data);
    show(data);

    setInterval(()=>{
        //instead of declaring 2 separate variables for getData and parse, 
        //I used only one and converted the text into a JavaScript object
        let data = JSON.parse(FooBar.getData());
        //convert text into a JavaScript object
        show(data);
        google.charts.setOnLoadCallback(drawChart);

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

function show(allData){
    showBarName(allData.bar);
    showBeerLevel(allData.taps);
    showBartenders(allData.bartenders);
    showClosingTime(allData.bar);
    showPeopleInQueue(allData.queue);
    //showCurrentOrder(allData.serving);
    showBeersServedToday(allData.serving);
    showPeopleServedToday(allData.queue);
    showBeerPopularity(allData); //should I refer to the queue also?
    showCustomersServed(allData.queue);
    showStorage(allData.storage);
    showBeerDetails(allData.beertypes);
    showAvgBeersPerCustomer(allData);
}

function showBarName(bar){
    document.querySelector(".bar-name").innerHTML = bar.name;
}

function showBeerLevel(taps){
    //console.log(taps)
    taps.forEach((tap,i)=>{
        let tapLevelNameClass = "tap-" + (i+1) + "-name";
        let percentageLeft = tap.level*100/tap.capacity;
        let percentageLeftClass = "tap-" + (i+1) + "-percentage";
        document.querySelector("." + tapLevelNameClass).innerHTML = `${tap.beer}`;
        document.querySelector("." + percentageLeftClass).innerHTML = `${percentageLeft}% left`;
    });
};

function showBartenders(bartenders){
    bartenders.forEach((bartender,i)=>{
        let bartendersHTMLClass = "bartender" + (i+1);
        document.querySelector("." + bartendersHTMLClass).innerHTML = `${bartender.name}: ${bartender.status}`;
    });
};

function showClosingTime(time){
    //original closing time
    let closingTime = time.closingTime;
    let closingHour = time.closingTime.substr(0,2);
    let closingMinutes = 60;
 
    //time now
    let currentDate = new Date();
    let currentTime = currentDate.getHours() + ":" + currentDate.getMinutes();
    //console.log(currentTime);
   
    let currentHour = currentTime.substring(0, currentTime.length-3);
    let currentMinutes = currentTime.substring(currentTime.length-2, currentTime.length);

    let remainingHours = closingHour - currentHour;
    let remainingMinutes = closingMinutes - currentMinutes;

    document.querySelector(".closing-time").innerHTML = closingTime;
    if(remainingMinutes=>0){
        if(closingHour - currentHour - 1 === 0){
            document.querySelector(".closing-time-hour").innerHTML = "";
        }
        else document.querySelector(".closing-time-hour").innerHTML = closingHour - currentHour - 1 + "hours";
    } else {
        document.querySelector(".closing-time-hour").innerHTML = closingHour - currentHour;
    }
    document.querySelector(".closing-time-minutes").innerHTML = remainingMinutes;
}


function showPeopleInQueue(people){
    document.querySelector(".people-in-queue").innerHTML = people.length;
}


function showBeersServedToday(serving){
    console.log("people currently being SERVED")
    console.log(serving)

    serving.forEach(customer=>{
        //console.log(customer.order.length)
        if(customer.id > lastServedCustomerId){
            beersServedToday += customer.order.length;
        }
    })

    if(serving.length>0){
        lastServedCustomerId=serving[serving.length-1].id;
        console.log(`lastServedCustomerId ${lastServedCustomerId}`);
    }

    console.log(`beersServedToday: ${beersServedToday}`)

    document.querySelector(".beers-served-today").innerHTML = beersServedToday;

    // while(queue.length>0){
    //     beersServedToday+=queue[0].order.length;
    //     document.querySelector(".beers-served-today").innerHTML = beersServedToday;
    //     console.log(beersServedToday);
    //     queue.splice(0,1);
    // }
}

function showPeopleServedToday(queue){
    console.log(`queue length: ${queue.length}`)
    for(let i=0; i<queue[i]; i++){
        if((i + 1) === (queue.length)){
            //console.log("Last iteration with item : ");
        }
    }
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

    // beersServedToday = 0;
    // popul.forEach(beer=>{
    //     //console.log(beer)
    //     beersServedToday += beer.popularity;
    // })
}


function showCustomersServed(customers){
    console.log(customers)

    if(customers[0].id) {
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
        if(keg.amount<2){
            document.querySelector(".keg-amount-bar-" + (i+1)).style.backgroundColor = `red`;
            document.querySelector(".keg-levels-buy").style.backgroundColor = `red`;

        } else {
            document.querySelector(".keg-amount-bar-" + (i+1)).style.backgroundColor = `lightblue`;
            document.querySelector(".keg-levels-enough").style.backgroundColor = `lightblue`;
        }
    })
}

function showBeerDetails(beertypes){
    let beerImgs = ["elhefebottle.png", "fairytalealebottle.png", "githopbottle.png", "hollabackbottle.png", "hoppilyeverafterbottle.png", "mowintimebottle.png", "row26bottle.png", "ruinedchildhoodbottle.png", "sleighridebottle.png", "steampunkbottle.png"];
    let path;
    // console.log(beerImgs)

    for(let i=0; i<beertypes.length; i++){
        //console.log(beertypes[i])
        document.querySelector(".beer-details-name-" + (i+1)).innerHTML = beertypes[i].name;
        document.querySelector(".beer-details-category-" + (i+1)).innerHTML = beertypes[i].category;
        document.querySelector(".beer-details-alcohol-" + (i+1)).innerHTML = beertypes[i].alc;
        document.querySelector(".beer-details-img-" + (i+1)).src = getBeerImage("gfx\/beer-labels\/") + beerImgs[i];
    }

    function getBeerImage(imgPath){
        path = imgPath;
        return path;
    }

}

function showAvgBeersPerCustomer(){
    if(!beersServedToday/customersServedToday){
        document.querySelector(".avg-beers-per-customer").innerHTML = "No beers sold yet";
    } else {
        //take only 1 decimal after comma
        document.querySelector(".avg-beers-per-customer").innerHTML = Math.round( beersServedToday/customersServedToday * 10 ) / 10;;
    }
}





