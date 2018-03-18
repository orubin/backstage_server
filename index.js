// index.js
const path = require('path')
const exphbs = require('express-handlebars')

const express = require('express')
const app = express()
const port = 3000

app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'views/layouts')
}))
app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'views'))

app.get('/', (request, response) => {
    response.render('layouts/home', {
      name: 'Backstage Server'
    })
  })
  
app.listen(process.env.PORT || 5000, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`server is listening on ${port}`)
})