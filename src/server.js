const express = require('express')
const path = require('path')

const app = express()

const exec = require('child_process').exec;

const PORT = process.env.PORT || 3000

app.use(express.static(path.join(__dirname, "../dist")))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "../dist", "index.html"))
})

app.get('/api/java/:program/:cmd', (req, res) => {
    const { program, cmd } = req.params
    let result
    const bashCmd = `java -jar ${path.join(__dirname, '../jar')}/${req.params.program}.jar ${cmd}`
    const testCmd = `node ${path.join(__dirname, '../jar')}/${req.params.program}.js ${cmd}`
    let child = exec(testCmd, (error, stdout, stderr) => {
        if(error){
            console.log(error)
        }
        console.log(stderr)
        console.log(stdout)
        res.send(stdout)
    })
})

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`)
})