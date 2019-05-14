# Dependencies
import pandas as pd
from flask import Flask, render_template, redirect, jsonify
import sqlite3
from statistics import mean, stdev

# Create a connection to the sqlite database
def create_connection():
        conn = sqlite3.connect("db/Poetry.db")
        return conn

# Create a function that extracts data from a list of dictionaries
def extractData(dict_list, poet, variable):
        x = [obj[variable] for obj in dict_list if obj["Poet"] == poet]
        return (x) 

# Create a function that counts words
def WordCount(lst):
        """ Create a dictionary """
        word_dict = {}
        for word in lst:
                if word in word_dict:
                        word_dict[word] += 1
                else:
                        word_dict[word] = 1
        return word_dict

# Create an instance of Flask
app = Flask(__name__)

@app.route('/')
def index():
        title = "Studying Poems with Natural Language Processing"
        return render_template("index.html", title = title)

@app.route('/poems')
def data():
    conn = create_connection()

    # query for title of poems and the text
    sql = "SELECT Poet, Title, Content FROM metadata;"
    cursor = conn.execute(sql)  

    # gets the column headers in the merged table
    column_names = ["Poet", "Title", "Content"]  

    # output is a list of dictionaries (key: column header, value: data)
    results = [dict(zip(column_names, row)) for row in cursor.fetchall()]

    # json format for list of dictionaries
    return jsonify (results)

@app.route('/data/<title>')
def importance(title):
    conn = create_connection()

    # query for title of poems, the important words, and their TF-IDF scores
    sql = "SELECT m.Title, m.Content, t.Word, t.'TF-IDF' FROM metadata as m \
           INNER JOIN tfidf as t\
           ON m.PoemNo = t.PoemNo;"
    cursor = conn.execute(sql)  

    # gets the column headers in the merged table
    column_names = ["Title", "Content", "Word", "TF-IDF"]  

    # output is a list of dictionaries (key: column header, value: data)
    results = [dict(zip(column_names, row)) for row in cursor.fetchall()]

    # convert the list of dictionaries into a pandas dataframe
    df = pd.DataFrame(results)

    word_list = df.loc[df["Title"] == title]["Word"].values.tolist()
    tfidf_list = df.loc[df["Title"] == title]["TF-IDF"].values.tolist()
    line_list = df.loc[df["Title"] == title]["Content"].values.tolist()

    x = word_list
    y = tfidf_list
    z = line_list[0]

    # prepare the data for graphs and JSON
    trace_tfidf = {
            "title": title,
            "word": x,
            "TF-IDF": y,
            "lines": z
    }     

    # json format
    return jsonify (trace_tfidf)    

@app.route('/metadata')
def meta():
        conn = create_connection()

        # query for title of poems and the text
        sql = "SELECT Poet, Title, Length, Sentiment, Pubn_Year FROM metadata;"
        cursor = conn.execute(sql)  

        # gets the column headers in the merged table
        column_names = ["Poet", "Title", "Length", "Sentiment", "Publication_Year"]  

        # output is a list of dictionaries (key: column header, value: data)
        results = [dict(zip(column_names, row)) for row in cursor.fetchall()]

        # json format for list of dictionaries
        return jsonify (results)

@app.route('/metadata2')
def meta2():
        conn = create_connection()

        # query for title of poems and the text
        sql = "SELECT Poet, Title, Length, Sentiment, Lexical_Diversity, Pubn_Year FROM metadata;"
        cursor = conn.execute(sql)  

        # gets the column headers in the merged table
        column_names = ["Poet", "Title", "Length", "Sentiment", "Lexical_Diversity", "Publication_Year"]  

        # output is a list of dictionaries (key: column header, value: data)
        results = [dict(zip(column_names, row)) for row in cursor.fetchall()]

        # create a list of unique poets
        poets = list(set([result["Poet"] for result in results]))

        # create a list of average lexical diversity,poem length,  (nested by poet)
        lexDiv = [round(mean(extractData(results, poet, "Lexical_Diversity")), 2) for poet in poets]    
        length = [int(mean(extractData(results, poet, "Length"))) for poet in poets]    
        sentiments = [extractData(results, poet, "Sentiment") for poet in poets]
        sentiment_count = [WordCount(s) for s in sentiments]


        # json format for the results
        x = poets
        y = lexDiv
        z = length
        w = sentiment_count

        trace_meta = {
                "poet": x,
                "lexical_diversity": y,
                "poem_length": z,
                "sentiment": w
        }
        return jsonify (trace_meta)        

@app.route('/metadata/<poet>')
def metadata1(poet):
        """ Get the titles of the poems by the poet """
        conn = create_connection()

        # query for title of poems, the important words, and their TF-IDF scores
        sql = "SELECT Poet, Title, Sentiment, Length, Lexical_Diversity FROM metadata;"
        cursor = conn.execute(sql)

        # get the column headers
        column_names = ["Poet", "Title", "Sentiment", "PoemLength", "LexDiversity"]
        poems = cursor.fetchall()

        # create a list of dictionaries
        zips = [zip(column_names, row) for row in poems]
        results = [dict(zipped) for zipped in zips]

        # convert the list of dictionaries into a dataframe
        df = pd.DataFrame(results)

        title = df.loc[df["Poet"] == poet]["Title"].values.tolist()
        sentiment = df.loc[df["Poet"] == poet]["Sentiment"].values.tolist()
        length = df.loc[df["Poet"] == poet]["PoemLength"].values.tolist()
        lex_dev = df.loc[df["Poet"] == poet]["LexDiversity"].values.tolist()
        length_mean = mean(length)
        lexdev_mean = mean(lex_dev)
        lexdev_sd = stdev(lex_dev)
        

        # jsonify results
        trace_poetMeta = {
                "poet": poet,
                "title": title,
                "length_mean": int(length_mean),
                "lexdev_mean": round(lexdev_mean, 3),
                "lexdev_sd": round(lexdev_sd, 3),
                "sentiments": sentiment
        }

        return jsonify (trace_poetMeta)

@app.route('/metadata/<poet>/<title>')
def metadata2(poet, title):
        """ Get metadata information about a particular poem """

        conn = create_connection()

        # query for title of poems, the important words, and their TF-IDF scores
        sql = "SELECT Poet, Title, Length, Sentiment, Pubn_Year, Lexical_Diversity FROM metadata;"
        cursor = conn.execute(sql)

        # get the column headers
        column_names = ["Poet", "Title", "PoemLength", "Sentiment", "Pubn_Year", "Lexical_Diversity"]
        poems = cursor.fetchall()

        # create a list of dictionaries
        zips = [zip(column_names, row) for row in poems]
        results = [dict(zipped) for zipped in zips]

        # convert the list of dictionaries into a dataframe
        df = pd.DataFrame(results)

        poet = df[(df["Poet"] == poet) & (df["Title"] == title)]["Poet"].item()
        title = df[(df["Poet"] == poet) & (df["Title"] == title)]["Title"].item()
        poem_length = df[(df["Poet"] == poet) & (df["Title"] == title)]["PoemLength"].item()
        sentiment = df[(df["Poet"] == poet) & (df["Title"] == title)]["Sentiment"].item()
        year = df[(df["Poet"] == poet) & (df["Title"] == title)]["Pubn_Year"].item()
        lex_div = df[(df["Poet"] == poet) & (df["Title"] == title)]["Lexical_Diversity"].item()

        # jsonify results
        trace_title = {
                "poet": poet,
                "title": title,
                "poem_length": poem_length,
                "sentiment": sentiment,
                "publication_year": year,
                "lexical_diversity": lex_div
        }

        return jsonify (trace_title)


if __name__ == "__main__":
        app.run(debug=True)