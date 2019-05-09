// Set the urls
var urlMetadata = "/metadata"
var urlPoem = "/data"

// Use the metadata
d3.json(urlMetadata).then(function(trace){
    var data = [trace][0];
    console.log(data);

    // When a selection has been made
    // (1) Create a variable for poem title
    var poemTitle = d3.select("#poem");

    // (2) Create a list of options
    var optionsList = [];
    for (i = 0; i < data.length; i ++){
        optionsList[i] = data[i]["Title"];
    };
    console.log(optionsList);

    // (3) Populate the select field with poem titles
    var options = poemTitle
        .selectAll("#title")
        .data(optionsList).enter()
        .append("option")
        .text(function(title){
            return title;
        })
        .attr("title", "options");
       

    // (4) Default selection = "October"
    var defaultx = "October";
    options.property("selected", function(d){
        return d === defaultx
    }); 

    // (5) Fill in the table based on the default selected poem
    var urlMetadata2 = `/metadata/${defaultx}`;
    console.log(urlMetadata2);

    var urlPoem2 = `/data/${defaultx}`;
    console.log(urlPoem2)
    document.getElementById("title").innerHTML = defaultx;

    // DEFAULT: Use the default url to fill the table with metadata
    d3.json(urlMetadata2).then(function(trace){
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
    });

    // DEFAULT: Use the default url to print the poem
    d3.json(urlPoem2).then(function(trace){
        var data = [trace][0]["lines"];
        var res = data.split(/\n/).join("<br>")
        console.log(res);
        document.getElementById("lines").innerHTML = res;

        // DEFAULT: Create a bar chart using TF-IDF
            var data2 = [trace][0];
            console.log(data2);
            data2["type"] = "bar";
            data2["x"] = data2["word"];
            data2["y"] = data2["TF-IDF"];

            var layout = {
                title: "TF-IDF of the five most important words",
                showlegend: false,
                xaxis: {title: "Word"},
                yaxis: {title: "Word importance (TF-IDF)"}
            };

            Plotly.newPlot("bar", [data2], layout);
        });


    // (5.1) Select a sample
    function handleChange(){
        var selection = poemTitle.property("value");
        console.log(selection);

        // (5.2) Change the metadata url to include the selection
        var urlMetadata1 = `/metadata/${selection}`;
        console.log(urlMetadata1);

        // (5.3) Use the new url to update the table with metadata
        d3.json(urlMetadata1).then(function(trace){
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
        });
        // (5.4) Change the data url to include the selection
        var urlPoem1 = `/data/${selection}`;
        console.log(urlPoem1);
        document.getElementById("title").innerHTML = selection;

        // (5.5) Use the new url to get the lines of the poem
        d3.json(urlPoem1).then(function(trace){
            var data = [trace][0]["lines"];
            var res = data.split(/\n/).join("<br>")
            console.log(res);
            document.getElementById("lines").innerHTML = res;

            // (5.6) Create a bar chart using TF-IDF
            var data2 = [trace][0];
            console.log(data2);
            data2["type"] = "bar";
            data2["x"] = data2["word"];
            data2["y"] = data2["TF-IDF"];

            var layout = {
                title: "TF-IDF of the five most important words",
                showlegend: false,
                xaxis: {title: "Word"},
                yaxis: {title: "Word importance (TF-IDF)"}
            };

            Plotly.newPlot("bar", [data2], layout);
        });
    };
    poemTitle.on("change", handleChange);
});
