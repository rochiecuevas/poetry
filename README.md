# Keyword extraction and sentiment analysis of poems
## Introduction
Robert Frost, Rudyard Kipling, and William Butler Yeats are some of the poets I've encountered in high school, either in literature class or when I was reading poetry during my spare time (trying to appreciate the literary form). Some poems are easy enough to understand, like Frost's <i>Stopping by Woods on a Snowy Evening</i> but other poems are more complicated; I typically get lost when people go in-depth about poetry.

There must be a way to distill a poem into its keywords and use that to construct my interpretation of a poem. Yes, this may as well lessen my appreciation of the imagery and symbolism found in a poem... <i>but</i> by first understanding the literal underlying message, I can then focus on finding a deeper meaning in the poem.

Armed with natural language processing skills, I thus embarked on a short poetic journey. 

## Data collection and ETL
Python's BeautifulSoup was used to webscrape the internet and collect over 500 poems, covering the works of these three poets (mostly Kipling). After initial clean-up, these poems were loaded onto a SQLite database. 

## Data cleaning
Using Python's Natural Language Toolkit (NLTK), I  "cleaned" the poems to:
-  remove <i>stop words</i>, pronouns, and most people's proper names (e.g., Jane Austen); 
- lemmatise words, which means that I reduced words to their roots (e.g., converting plural nouns to their singular forms; verbs into their present tenses and roots).

<i>NB: This is a work in progress because I still see some words in the keywords list that should have been filtered out.</i>

## Natural language processing
Once the data was clean, I used Python modules to analyse the text:
- NLTK. Keywords extraction based on their importance (measured by a metric called <i>Term Frequency-Inverse Document Frequency (TF-IDF)</i>);
- TextBlob. "Unsupervised" sentiment prediction. This technique aimed to predict whether a poem has a positive or a negative sentiment based on the words that the author used. It's unsupervised because I did not do previous model training using labelled data.

Additionally, I calculated for lexical diversity (expressed as proportion of unique words to the whole poem, after removing stop words, pronouns, and people's proper names).

## Data visualisation
I created a Flask app that generated APIs containing JSON objects for the information extracted from the poems and the poets. The data presented in these APIs were plotted using JavaScript's d3 and Plotly.js libraries. Additionally, I constructed a keyword co-occurrence matrix that I visualised into a keyword network through Gephi.

I deployed the app using Heroku. The data visualisation can now be seen on <a href = "https://young-bastion-43943.herokuapp.com/">https://young-bastion-43943.herokuapp.com/</a>. It allows the reader to select among the poets and their works. Metadata information (about the poet and the poem selected) are displayed in a table while the poem's keywords are plotted onto a bar graph of TF-IDF. The poem selected is displayed as well. Static graphs, comparing the poets, and the keyword matrix are also shown.

For an in-depth explanation of the code, go to the project <a href ="https://github.com/rochiecuevas/poetry/wiki">wiki</a> page.





