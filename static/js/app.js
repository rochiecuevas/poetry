// Set the urls and default values
var urlMetadata = "/metadata"
var urlPoem = "/data"
var defaultPoet = "Robert Frost";
var defaultPoem = "October";

// Define variables to be used in the functions
// var poemTitle;
// var poetName;
// var selection;

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

    // Populate the poet options
    var options1 = poetName
        .selectAll("#title")
        .data(poetOptions).enter()
        .append("option")
        .text(function(title){
            return title;
        })
        .attr("title", "options");
    
    // Use the default poet
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

// Functions defined
function extractTitles(url){
    d3.json(url).then(function(trace){
        var data = [trace][0];
        console.log(data);

        // When a selection has been made
        var poemTitle = d3.select("#poem");
        var optionsList = [];
        for (i = 0; i < data["title"].length; i ++){
            optionsList[i] = data["title"][i];
        };
        console.log(optionsList);

        // Populate the select field with poem titles
        var options = poemTitle
            .selectAll("#title")
            .data(optionsList).enter()
            .append("option")
            .text(function(title){
                return title;
            })
            .attr("title", "options");

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


// //     // (5.1) Select a sample
// //     function handleChange(){
// //         var selection = poemTitle.property("value");
// //         console.log(selection);

// //         // (5.2) Change the metadata url to include the selection
// //         var urlMetadata1 = `/metadata/${selection}`;
// //         console.log(urlMetadata1);

// //         // (5.3) Use the new url to update the table with metadata
// //         d3.json(urlMetadata1).then(function(trace){
// //             var data = [trace][0];
// //             console.log(data);

// //             // (5.3.1) Get the values that match the keys of each item in the array
// //             var tdLength = d3.select("#poem_length");
// //             var tdYear = d3.select("#publication_year");
// //             var tdSentiment = d3.select("#sentiment");
// //             var tdLexDiv = d3.select("#lex_div")

// //             var tdList = [tdLength, tdYear, tdSentiment, tdLexDiv];
// //             var catList = ["poem_length", "publication_year", "sentiment", "lexical_diversity"];

// //             // (5.3.2) Populate the HTML table with the metadata for each poem
// //             for (var i = 0; i < tdList.length; i ++){
// //                 tdList[i].text(data[catList[i]])
// //             };
// //         });
// //         // (5.4) Change the data url to include the selection
// //         var urlPoem1 = `/data/${selection}`;
// //         console.log(urlPoem1);
// //         document.getElementById("title").innerHTML = selection;

// //         // (5.5) Use the new url to get the lines of the poem
// //         d3.json(urlPoem1).then(function(trace){
// //             var data = [trace][0]["lines"];
// //             var res = data.split(/\n/).join("<br>")
// //             console.log(res);
// //             document.getElementById("lines").innerHTML = res;

// //             // (5.6) Create a bar chart using TF-IDF
// //             var data2 = [trace][0];
// //             console.log(data2);
// //             data2["type"] = "bar";
// //             data2["x"] = data2["word"];
// //             data2["y"] = data2["TF-IDF"];

// //             var layout = {
// //                 title: "TF-IDF of the five most important words",
// //                 showlegend: false,
// //                 xaxis: {title: "Word"},
// //                 yaxis: {title: "Word importance (TF-IDF)"}
// //             };

// //             Plotly.newPlot("bar", [data2], layout);
// //         });
// //     };
// //     poemTitle.on("change", handleChange);
// // });
