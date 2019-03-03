
## Robert Frost, meet Natural Language Processing

### Extract the data

# Dependencies to read the SQLite database
import pandas as pd
import sqlite3

# Connect to the poetry database
conn = sqlite3.connect("Poetry.db")

# Load the data into a dataframe
df = pd.read_sql_query("select * from Frost;", conn)
conn.close()

# Choose the relevant columns
df = df[["title", "lines"]]

# Put all letters in lower case
df["lines"] = df["lines"].str.lower()

### Transform the data

# Dependencies
import re, string

import nltk
nltk.download("punkt")
nltk.download('stopwords')
nltk.download('wordnet')

from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer


#### Tokenise, Remove Stop Words, Lemmatise
# Reference for lemmatisation: https://marcobonzanini.com/2015/01/26/stemming-lemmatisation-and-pos-tagging-with-python-and-nltk/

# Remove stop words from the list
stops = stopwords.words("english")
exclude = set(string.punctuation)

# Lemmatise the words in each list to retain their roots
lemmatiser = WordNetLemmatizer()

# Transform the poem in preparation for word counts
words_list = []
preprocessed_text = []
for poem in df["lines"]:
    
    # Create a list of words per poem after the words are converted to lowercase    
    words = word_tokenize(poem)
    
    # Filter to remove stop words and punctuations    
    words2 = [word for word in words if word not in stops and word not in exclude]
    
    # Lemmatise each word (if it's a verb, convert to root verb)
    words3 = [lemmatiser.lemmatize(word, pos = "v") for word in words2]
    
    # Add the filtered list of words (representing each poem)
    words_list.append(words3)
    
    # Convert the list of strings back to one string
    words4 = " ".join(words3)
    
    # Add the filtered list of words (representing each poem)
    preprocessed_text.append(words4)

df["tokens"] = words_list    
df["filteredPoem"] = preprocessed_text

# Create a function that counts the number of words in each poem
def word_count(word_list):
    return len(word_list)

# Determine the length of each filtered poem
lengths = []
for poem in df["tokens"]:
    length = word_count(poem)
    lengths.append(length)

# Add the filtered poem lengths in the df
df["poemLength"] = lengths

# Longest and shortest poems
len_longest_poem = df["poemLength"].max()
len_shortest_poem = df["poemLength"].min()

for i in range(0, len(df["poemLength"])):
    if df["poemLength"][i] == len_longest_poem:
        title_longest_poem = df["title"][i]
        print(f'Longest poem: {title_longest_poem}; Filtered poem length: {df["poemLength"][i]} words')
    if df["poemLength"][i] == len_shortest_poem:
        title_shortest_poem = df["title"][i]
        print(f'Shortest poem: {title_shortest_poem}; Filtered poem length: {df["poemLength"][i]} words')      


### Word importance
# Source: https://stevenloria.com/tf-idf/

# Dependencies
import math
from textblob import TextBlob as tb

# Create a function that calculates term frequency
def tf(word, poem):
    return poem.words.count(word) / len(poem.words)

# Create a function that determines the number of documents that contain a certain word
def n_docs(word, poemlist):
    return sum(1 for poem in poemlist if word in poem.words)

# Create a function that determines the inverse document frequency (IDF)
# IDF = how common a word is among all the documents in poemlist
def idf(word, poemlist):
    return math.log(len(poemlist) / (1 + n_docs(word, poemlist)))

def tdidf(word, poem, poemlist):
    return tf(word, poem) * idf(word, poemlist)

# Create the poemlist from df["lines"]
poemlist = [tb(poem) for poem in df["filteredPoem"]]
poemlist

# Calculate the most important words
impt_words = []
for i, poem in enumerate(poemlist):
    scores = {word: tdidf(word, poem, poemlist) for word in poem.words}
    sorted_words = sorted(scores.items(), key = lambda x: x[1], reverse = True)
    
    for word, score in sorted_words[:20]:
        impt_words.append((i + 1, word, round(score, 5)))

# Create a dataframe of important words per poem
df2 = pd.DataFrame(impt_words, columns = ["PoemNo", "Word", "TD-IDF"])

# Add titles for each poem in df2
titles = []
for i in range(0, len(df)):
    for p in df2.PoemNo:
        if i == p - 1:
            title = df["title"][i]
            titles.append(title) 

df2["PoemTitle"] = titles
print(df2.head())