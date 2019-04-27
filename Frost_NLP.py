# Dependencies
import pandas as pd
from flask import Flask, render_template, redirect, jsonify
import sqlite3

# Create a connection to the sqlite database
def create_connection():
        conn = sqlite3.connect("db/Poetry.db")
        return conn

# Create an instance of Flask
app = Flask(__name__)

@app.route('/')
def index():
        title = "Analysing the Poetry of Robert Frost: Using Natural Language Processing"
        return render_template("index.html", title = title)

@app.route('/poems')
def data():
    conn = create_connection()

    # query for title of poems and the text
    sql = "SELECT title, lines FROM Frost;"
    cursor = conn.execute(sql)  

    # gets the column headers in the merged table
    column_names = ["Title", "Text"]  

    # output is a list of dictionaries (key: column header, value: data)
    results = [dict(zip(column_names, row)) for row in cursor.fetchall()]

    # json format for list of dictionaries
    return jsonify (results)

@app.route('/data/<title>')
def importance(title):
    conn = create_connection()

    # query for title of poems, the important words, and their TF-IDF scores
    sql = "SELECT F.title, t.Word, t.'TF-IDF' FROM Frost as F \
           INNER JOIN tfidf as t\
           ON F.'index' = t.PoemNo;"
    cursor = conn.execute(sql)  

    # gets the column headers in the merged table
    column_names = ["Title", "Word", "TF-IDF"]  

    # output is a list of dictionaries (key: column header, value: data)
    results = [dict(zip(column_names, row)) for row in cursor.fetchall()]

    # convert the list of dictionaries into a pandas dataframe
    df = pd.DataFrame(results)

    word_list = df.loc[df["Title"] == title]["Word"].values.tolist()
    tfidf_list = df.loc[df["Title"] == title]["TF-IDF"].values.tolist()

    x = word_list
    y = tfidf_list

    # prepare the data for graphs and JSON
    trace_tfidf = {
            "title": title,
            "word": x,
            "TF-IDF": y
    }     

    # json format
    return jsonify (trace_tfidf)    

if __name__ == "__main__":
        app.run(debug=True)