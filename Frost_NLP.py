# Dependencies for data manipulation
import pandas as pd
from flask import Flask, render_template, jsonify
from statistics import mean, stdev

# Dependencies for SQL
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from flask_sqlalchemy import SQLAlchemy

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

app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///db/Poetry.db"
db = SQLAlchemy(app)

# Create a database model
Base = automap_base() # Reflect an existing database into a new model
Base.prepare(db.engine, reflect = True) # Prepare the database
Base.classes.keys() # Find all the tables (classes) that automap found

# Save references for each table
Metadata = Base.classes.metadata
Tfidf = Base.classes.tfidf

# Create session query that will load the whole Metadata table (all columns) into a dataframe
qryMetadata = db.session.query(Metadata)
df_Metadata = pd.read_sql(qryMetadata.statement, qryMetadata.session.bind)

# Create a session query to load the whole Tfidf table (all columns) into a dataframe
qryTfidf = db.session.query(Tfidf)
df_Tfidf = pd.read_sql(qryTfidf.statement, qryTfidf.session.bind)

# Create session query that will load the whole Metadata table (all columns) into a dataframe
qryJoin = db.session.query(Metadata.Title, Metadata.Content, Tfidf.Word, Tfidf.TIFDF).join(Tfidf, Metadata.PoemNo == Tfidf.PoemNo)
df_Join = pd.read_sql(qryJoin.statement, qryJoin.session.bind) 


@app.route('/')
def index():
        title = "Studying Poems with Natural Language Processing"
        return render_template("index.html", title = title)

@app.route('/poems')
def data():
    """ Get the Poet, Title, Content columns from the metadata dataframe """

    # output is a list of dictionaries (key: column header, value: data)
    results = df_Metadata[["Poet", "Title", "Content"]].to_dict("records")

    # json format for list of dictionaries
    return jsonify (results)        

@app.route('/metadata')
def meta():
    """ Get the Poet, Title, Length, Sentiment, Publication Year columns from the metadata dataframe """
    # output is a list of dictionaries (key: column header, value: data)
    results = df_Metadata[["Poet", "Title", "Length", "Sentiment", "Pubn_Year"]].to_dict("records")

    # json format for list of dictionaries
    return jsonify (results) 

@app.route('/metadata/<poet>')
def metadata1(poet):
    """ Get metadata information by the poet """
    df = df_Metadata[["Poet", "Title", "Sentiment", "Length", "Lexical_Diversity"]]

    # Create lists of titles, sentiments, lengths, lexical diversities, and lengths
    # Based on the selected poet
    title = df.loc[df["Poet"] == poet]["Title"].values.tolist()
    sentiment = df.loc[df["Poet"] == poet]["Sentiment"].values.tolist()
    length = df.loc[df["Poet"] == poet]["Length"].values.tolist()
    lex_dev = df.loc[df["Poet"] == poet]["Lexical_Diversity"].values.tolist()
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
    df = df_Metadata[["Poet", "Title", "Sentiment", "Length", "Lexical_Diversity", "Pubn_Year"]]

    # Create lists of sentiments, lengths, lexical diversities
    # Based on the selected poet and title
    poet = df[(df["Poet"] == poet) & (df["Title"] == title)]["Poet"].item()
    title = df[(df["Poet"] == poet) & (df["Title"] == title)]["Title"].item()
    poem_length = df[(df["Poet"] == poet) & (df["Title"] == title)]["Length"].item()
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

@app.route('/metadata2')
def meta2():
    """ Get more metadata information for plots """
    df = df_Metadata[["Poet", "Title", "Sentiment", "Length", "Lexical_Diversity", "Pubn_Year"]]

    # Create a list of unique poets
    poets = sorted(list(set(df["Poet"].tolist())))

    # Calculate averages and counts (for sentiments)
    length = round(df.groupby("Poet")["Length"].mean(), 3).tolist()
    lexDiv = round(df.groupby("Poet")["Lexical_Diversity"].mean(), 3).tolist()
    sentiments = df.groupby("Poet")["Sentiment"].apply(list).tolist()
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

@app.route('/data/<title>')
def importance(title):
    """ Extract the keywords by poem title """
    df = df_Join

    # Create lists of values per variable
    word_list = df.loc[df["Title"] == title]["Word"].values.tolist()
    tfidf_list = df.loc[df["Title"] == title]["TIFDF"].values.tolist()
    line_list = df.loc[df["Title"] == title]["Content"].values.tolist()

    # jsonify results
    x = word_list
    y = tfidf_list
    z = line_list[0] # one copy of the poem

    # prepare the data for graphs and JSON
    trace_tfidf = {
        "title": title,
        "word": x,
        "TF-IDF": y,
        "lines": z
    }     

    return jsonify (trace_tfidf)    

if __name__ == "__main__":
        app.run(debug=True)