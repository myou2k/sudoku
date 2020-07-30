const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')

const app = express()
const exec = require('child_process').exec;

const PORT = process.env.PORT || 3000

app.use(express.static(path.join(__dirname, "../dist")))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "../dist", "index.html"))
})

app.post('/api/java/new', (req, res) => {
    const { difficulty, problemNumber } = req.body
    const bashCmd = `java -cp ${path.join(__dirname, '../jar')}/dmsgame9s.jar NetMain 2 ${difficulty}-${problemNumber}`
    console.log("Executing:", bashCmd)
    let child = exec(bashCmd, (error, stdout, stderr) => {
        if(error){
            console.log("error:", error)
            console.log(stderr)
            throw error
            return
        }
        
        console.log(stdout)
        res.json(stdout)
    })
})

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`)
})