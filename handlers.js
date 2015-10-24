"use strict"

var path            = require("path")
var nedb            = require("nedb")
  , _               = require("lodash")

var db = new nedb({
    filename: path.join("data", "todos.db"),
    autoload: true
})

db.remove({}, { multi: true }, function (err, count) {
    var dumRecs = [
        {
            desc: "Woo yeah",
            done: false,
            timestamp: Date.now()
        },
        {
            desc: "We are so totally done ok",
            done: true,
            timestamp: Date.now()
        },
        {
            desc: "Woo no",
            done: false,
            timestamp: Date.now()
        }
    ]

    console.log(`Deleted ${count} records`)

    db.insert(dumRecs, function (err, docs) {
        if (err) throw err
        console.log(docs)
    })
})

module.exports.get = function get (req, res, next) {
    db.find({}, function (err, docs) {
        if (err) return next(err)
        return res.json(docs)
    })
}

module.exports.post = function post (req, res, next) {
    let todoProps = _.pick(req.query, ["desc", "done"])
    todoProps.timestamp = Date.now()
    todoProps.done = todoProps.done === "true" ? true : false

    db.insert(todoProps, function (err, doc) {
        if (err) return next(err)
        return res.json(doc)
    })
}

module.exports.put = function put (req, res, next) {
    let todoId      = req.query._id

    if (!todoId) {
        var err = new Error("Please pass a todo _id")
        err.statusCode = 400
        return next(err)
    }

    db.findOne({_id: todoId}, function (err, todo) {
        if (err) return next(err)

        if (todo === null) {
            let error = new Error("Doc not found)")
            error.statusCode = 404
            return next(error)
        }

        let update = _.extend(todo, _.pick(req.query, ["desc", "done"]))
        console.log(update)

        db.update({_id: todo._id}, update, {}, function (err, count) {
            if (err) return next(err)

            if (count === 0) {
                // we updated nothing
                return res.json({message: "Nothing updated", statusCode: "i dunno"})
            }

            db.findOne({_id: todoId}, function (err, doc) {
                if (err) return next(err)
                return res.json(doc)
            })
        })
    })
}

module.exports.delete = function del (req, res, next) {
    let todoId = req.query._id

    db.remove({_id: todoId}, function (err, count) {
        if (err) return next(err)
        return res.json({removedId: todoId, count: count})
    })
}
