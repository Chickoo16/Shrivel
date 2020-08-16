const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const request = require("request");
const { Script } = require("vm");
const { post } = require("request");

/*
var jsdom = require('jsdom');
const { JSDOM } = jsdom;

const { document } = (new JSDOM('')).window;
global.document = document;
*/

const app = express();

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
//app.use(new JSDOM("JSDOM"));



app.get("/", function(req, res){
    res.sendFile(__dirname + "/index.html");
});

app.post("/subscribe", function(req, res) {
    res.sendFile(__dirname + "/signup.html");
});

app.post("/signup", function(req, res) {
    const firstname = req.body.fname;
    const lastname = req.body.lname;
    const email = req.body.email; 

    const data = {
        members : [
            {
                email_address: email, 
                status : "subscribed",
                merge_fields : {
                    FNAME : firstname,
                    LNAME : lastname
                }
            }
        ]
    };

    const jsondata = JSON.stringify(data);

    const url = "https://us10.api.mailchimp.com/3.0/lists/802bdda021"; // list id 802bdda021
    const options = {
        method : "POST",
        auth : "chickoo16:562c586daafd0d082a2c7734f9d7a0ae-us10"
    }

    const request = https.request(url, options, function(response) {
        if (response.statusCode === 200){
            res.sendFile(__dirname + "/success.html");

            app.post("/redirect", function(req, res) {
                res.redirect("/")
            })
        }
        else {
            res.sendFile(__dirname + "/failure.html");

            app.post("/failure", function(req, res) {
                res.sendFile(__dirname + "/signup.html")
            })
        }
    })

    request.write(jsondata);
    request.end();
})

app.post("/check", function(req, res){
    const query = req.body.city;
    const apikey = "9a7164293ed399d4920be2b0786a20b3";
    const unit  = "metric";
    const url = "https://api.openweathermap.org/data/2.5/weather?q=" + query +"&appid=" + apikey + "&units=" + unit;
    
    https.get(url, function(response){
        //console.log(response.statusCode);
        if(response.statusCode === 200)
        {
            response.on("data", function(data){
                const weatherData = JSON.parse(data);  // JSON.stringify is used to do the opposite.
    
                const temp = weatherData.main.temp;
                const feelsLike = weatherData.main.feels_like;
                const pressure = weatherData.main.pressure;
                const humidity = weatherData.main.humidity;
                const visibility = weatherData.visibility;
                const windSpeed = weatherData.wind.speed;
                const windDirection = weatherData.wind.deg;
                const cloudPercentage = weatherData.clouds.all;
                //res.write("<h1>The temperature of " + query +" is " + temp + " degree celcius.</h1>");
    
                const weatherDescription = weatherData.weather[0].description;
                const weatherMain = weatherData.weather[0].main;
                //res.write("<h3>The weather is currently " + weatherDescription + ".</h3>");
                //res.write("<br>");
    
                var icon = weatherData.weather[0].icon;
                const imageurl = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
                //res.write("<img src="+ imageurl+">");
                var sunriseSeconds = weatherData.sys.sunrise;
                var sunriseUTC = new Date(0);
                sunriseUTC.setUTCSeconds(sunriseSeconds); // to be rendered
    
                var sunsetSeconds = weatherData.sys.sunset;
                var sunsetUTC = new Date(0);
                sunsetUTC.setUTCSeconds(sunsetSeconds); // to be rendered
    
                //icon = "01d";
    
                const cityName = weatherData.name;
                const longitude = weatherData.coord.lon;
                const lattitude = weatherData.coord.lat;
    
                if(icon === "01d")
                icon = 'images/clearSky.jpg';
                else if (icon === "02d")
                icon = 'images/fewClouds.jpg';
                else if (icon === "03d")
                icon = 'images/scattered.jpg';
                else if (icon === "04d")
                icon = 'images/brokenClouds.jpg';
                else if (icon === "09d")
                icon = 'images/showerRain.jpg';
                else if (icon === "10d")
                icon = 'images/rain.jpg';
                else if (icon === "11d")
                icon = 'images/thunderstorm.jpg';
                else if (icon === "13d")
                icon = 'images/snow.jpg';
                else 
                icon = 'images/mist.jpg';
    
    
               res.render("result", {data: {
                   temperature: temp, 
                   description: weatherDescription,
                   SunRise: sunriseUTC,
                   SunSet: sunsetUTC,
                   Icon: icon,
                   Lattitude: lattitude,
                   Longitude: longitude, 
                   CityName: cityName,
                   FeelsLike: feelsLike,
                   Pressure: pressure,
                   Humidity: humidity,
                   Visibility: visibility,
                   WindSpeed: windSpeed,
                   WindDirection: windDirection,
                   CloudPercentage: cloudPercentage,
                   WeatherMain: weatherMain 
               }})}
            )
            app.post("/redirect", function(req, res) {
                res.redirect("/")
            })
        } // end of if 
            
            else {
                res.render("failure")
                app.post("/failure", function(req, res) {
                    res.redirect("/");
                })
            }
    })
});

app.listen(process.env.PORT || 3000, function() {
    console.log("Server started on port 3000 !");
});
