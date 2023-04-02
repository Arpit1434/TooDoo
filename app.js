const express = require('express')
const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.set("view engine", "ejs")
app.listen(5000)

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res)=>{
    res.render("index")
})

app.get('/signin', (req, res)=>{
    res.render("signin")
})

app.get('/signup', (req, res)=>{
    res.render("signup")
})

app.post('/validate', (req, res)=>{
    res.redirect("notes")
})

app.get('/notes', (req, res)=>{
    res.render("notes")
})

app.use((req, res)=>{
    res.render("notfound")
})