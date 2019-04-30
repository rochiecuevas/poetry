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

    // (4) Disable "Pick a poem."
    document.getElementById("choices").disabled = true;

    // (5) Fill in the table based on the selected poem
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

            var tdList = [tdLength, tdYear, tdSentiment];
            var catList = ["poem_length", "publication_year", "sentiment"];

            // (5.3.2) Populate the HTML table with the metadata for each poem
            for (var i = 0; i < tdList.length; i ++){
                tdList[i].text(data[catList[i]])
            };
        });
        // (5.4) Change the data url to include the selection
        var urlPoem1 = `/data/${selection}`;
        console.log(urlPoem1);

        // (5.5) Use the new url to get the lines of the poem
        d3.json(urlPoem1).then(function(trace){
            var data = [trace][0];
            console.log(data);

            // (5.5.1) Get the values that match the keys of each item in the array
            var pLines = d3.select("#lines");

            var pList = [pLines];
            var pcatList = ["lines"];

            // (5.5.2) Populate the paragraph with the lines of the chosen poem
            for (var i = 0; i < pList.length; i ++){
                pList[i].text(data[pcatList[i]])
            };
        });
    };
    poemTitle.on("change", handleChange);
});
