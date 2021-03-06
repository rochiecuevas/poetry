// Set the urls and default values
var urlMetadata = "/metadata"
var urlMeta = "/metadata2"
var urlPoem = "/data"
var defaultPoet = "Robert Frost";
var defaultPoem = "October";

// Fill the landing page with information from the default
// poet and poem
d3.json(urlMetadata).then(function(trace){
    var data = [trace][0];
    console.log(data);

    // Create a variable for poets
    poetName = d3.select("#poet");

    // Create a list of poet options
    var poetOptions = [];
    var poets = [];
    for (var i = 0; i < data.length; i ++){
        poets[i] = data[i]["Poet"];
        poetOptions = new Set(poets);
        poetOptions = Array.from(poetOptions);
    };
    console.log(poetOptions);

    // Populate the poet options dropdown
    var options1 = poetName
        .selectAll("#title")
        .data(poetOptions).enter()
        .append("option")
        .text(function(title){
            return title;
        })
        .attr("type", "names");
    
    // Fill the first spot in the dropdown menu with the default poet
    options1.property("selected", function(d){
        return d === defaultPoet
        });    

    // Use the default poet to create a subset of poem titles for the title options list
    var urlMetadata1 = `/metadata/${defaultPoet}`;
    console.log(urlMetadata1);

    // Extract metadata for the (default) selected poem of the selected poet
    var urlMetadata2 = `/metadata/${defaultPoet}/${defaultPoem}`;
    console.log(urlMetadata2);

    // Create a plot of keywords for the default poem
    var urlPoem = `/data/${defaultPoem}`;
    console.log(urlPoem);

    extractTitles(urlMetadata1);

    //  Change the poet
    poetName.on("change", handleChangePoet);
});

// Put static graphs comparing lexical diversity and poem length among the poets
d3.json(urlMeta).then(function(trace){
    var data = [trace][0];
    console.log(data);

    // Construct the poem length bar plot
    data["type"] = "bar";
    data["x"] = data["poet"];
    data["y"] = data["poem_length"];

    var layout = {
        showlegend: false,
        xaxis: {title: "Poet"},
        yaxis: {title: "Mean Poem Length (number of words)"}
    };

    Plotly.newPlot("bar2", [data], layout);

    // Construct the lexical diversity bar plot
    data["type"] = "bar";
    data["x"] = data["poet"];
    data["y"] = data["lexical_diversity"];

    var layout = {
        showlegend: false,
        xaxis: {title: "Poet"},
        yaxis: {title: "Mean Lexical Diversity"}
    };

    Plotly.newPlot("bar3", [data], layout);

    // Construct the sentiments bar plot
    var positive = [];
    var negative = [];
    var neutral = [];
    var poets = data["poet"];

    console.log(data["sentiment"])
    for (var i = 0; i < data["sentiment"].length; i ++){
        positive.push(data["sentiment"][i]["positive"]);
        negative.push(data["sentiment"][i]["negative"]);
        neutral.push(data["sentiment"][i]["neutral"]);
    };
    console.log(positive);
    console.log(negative);
    console.log(neutral);
    console.log(poets);

    trace_pos = {
        type: "bar",
        x: poets,
        y: positive,
        name: "positive"
    };

    trace_neg = {
        type: "bar",
        x: poets,
        y: negative,
        name: "negative"
    };

    trace_neu = {
        type: "bar",
        x: poets,
        y: neutral,
        name: "neutral"
    };
    
    var data2 = [trace_pos, trace_neg, trace_neu];

    var layout = {
        barmode: "group",
        xaxis: {title: "Poet"},
        yaxis: {title: "Sentiment Count"}
    };

    Plotly.newPlot("bar4", data2, layout);

});

////////////////////////
// Functions defined //
///////////////////////
function extractTitles(url){
    d3.json(url).then(function(trace){
        var data = [trace][0];
        console.log(data);
        document.getElementById('name').innerHTML = data["poet"];
        document.getElementById('poemlength_mean').innerHTML = `${data["length_mean"]} words`;
        document.getElementById('lexdiv_mean').innerHTML = `${data["lexdev_mean"]} ± ${data["lexdev_sd"]}`;

        // When a selection has been made
        var poemTitle = d3.select("#poem");
        var optionsList = [];
        for (i = 0; i < data["title"].length; i ++){
            optionsList[i] = data["title"][i];
        };
        console.log(optionsList);

        // Remove existing items in the options dropdown list
        document.getElementById('poem').innerHTML = "";

        // Populate the select field with poem titles
        var options = poemTitle
            .selectAll("#title")
            .data(optionsList).enter()
            .append("option")
            .text(function(title){
                return title;
            })
            .attr("class", "poem");

        // Use the default poet
        options.property("selected", function(d){
            return d === optionsList[0]
            });  
            
        // Get the metadata for the table
        var selection = poetName.property("value");
        var selection1 = poemTitle.property("value");
        var url = `/metadata/${selection}/${selection1}`;

        extractMeta(selection1, url);
        
        // Change poems
        function handleChangePoem(){
            selection1 = poemTitle.property("value");
            url = `/metadata/${selection}/${selection1}`;
            console.log(url);

            extractMeta(selection1, url);
        };
        poemTitle.on("change", handleChangePoem);
    });     
};

function extractMeta(poem, url){
    // Fill the metadata table with information of the default poem
    console.log(poem);
    console.log(url);
    document.getElementById("title").innerHTML = poem;

    d3.json(url).then(function(trace){
        var data = [trace][0];
        console.log(data);

        // (5.3.1) Get the values that match the keys of each item in the array
        var tdLength = d3.select("#poem_length");
        var tdYear = d3.select("#publication_year");
        var tdSentiment = d3.select("#sentiment");
        var tdLexDiv = d3.select("#lex_div")

        var tdList = [tdLength, tdYear, tdSentiment, tdLexDiv];
        var catList = ["poem_length", "publication_year", "sentiment", "lexical_diversity"];

        // (5.3.2) Populate the HTML table with the metadata for each poem
        for (var i = 0; i < tdList.length; i ++){
            tdList[i].text(data[catList[i]])
        };

        var poemTitle = d3.select("#poem");
        var selection1 = poemTitle.property("value");
        var url2 = urlPoem + `/${selection1}`;
        extractPoem(url2);
    });
};

function extractPoem(url){
    console.log(url);
    d3.json(url).then(function(trace){
        var data = [trace][0];
        var res = data["lines"];
        console.log(res);
        document.getElementById("lines").innerHTML = res;
        // var messagetoSend = document.getElementById("lines").value.replace(/\n/g, "<br>");
        // alert(messagetoSend);

        // Construct the TF-IDF bar plot
        data["type"] = "bar";
        data["x"] = data["word"];
        data["y"] = data["TF-IDF"];

        var layout = {
            title: "TF-IDF of the five most important words",
            showlegend: false,
            xaxis: {title: "Word"},
            yaxis: {title: "Word importance (TF-IDF)"}
        };

        Plotly.newPlot("bar", [data], layout);
    });
};

function handleChangePoet(){
    
    selection = poetName.property("value");
    console.log(selection);

    var urlMetadata1 = `/metadata/${selection}`;
    console.log(urlMetadata1);
    extractTitles(urlMetadata1);

};