from flask import Flask,render_template

app = Flask(__name__)

@app.route("/")
def hello_world():
    return render_template("index.html")

@app.route("/categoricalData")
def allDataAsCategoricalData():
    return render_template("categorical.html")

@app.route("/continuousData")
def allDataAsContinuousData():
    return render_template("continuous.html")

@app.route("/interaction")
def interaction():
    return render_template("interaction.html")
