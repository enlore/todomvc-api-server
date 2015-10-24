"use strict"

var path            = require("path")

var bPars           = require("body-parser")
  , express         = require("express")
  , app             = express()
  , morgan          = require("morgan")


var handlers        = require("./handlers")

app.use(bPars.json())
app.use(morgan('dev'))

//db.ensureIndex({fieldName: "", unique: true})

// db.find().limit(2).sort({field: -1||1}).exec(cb)
// db.findOne()
// db.remove()

function Todo (opts) {
    this.timestamp  = Date.now()
    this.desc       = opts.desc
    this.done       = opts.done
}

Todo.prototype.toJSON = function toJSON () {
    return JSON.stringify({
        desc: this.desc,
        done: this.done,
        timestamp: this.timestamp,
        _id: this._id || "no soul"
    })
}

app.get("/api/todos", function (req, res, next) {
    console.log(req.query)

    var verbList = ["get", "put", "post", "delete"]

    if (!req.query.method) {
        let error = new Error("Please pass a method param")
        error.statusCode = 400
        return next(error)

    } else if (verbList.indexOf(req.query.method.toLowerCase()) === -1) {
        let count = 0
        let error = new Error(`Method ${req.query.method} not allowed, yo. Only ${verbList.join(" or ")}`)
        error.statusCode = 400
        return next(error)

    } else {
        return handlers[req.query.method](req, res, next)
    }
})

app.post("/api/todos", function (req, res, next) { next(new Error("Not implemented")) })
app.put("/api/todos", function (req, res, next) { next(new Error("Not implemented")) })
app.delete("/api/todos", function (req, res, next) { next(new Error("Not implemented")) })

app.use(function (err, req, res, next) {
    console.log(err)
    var error = {
        stack: err.stack,
        statusCode: err.statusCode || 500,
        message: err.message
    }

    return res.json(error)
})

module.exports = function start () {
    var port = process.env.PORT || 3000

    app.listen(port, function () {
        let msg = `Listening on ${port}`
        console.log(msg)
    })
}
