const { response, json } = require('express');
const express = require('express');
const { readFile } = require('fs');
const { request } = require('http');
const app = express();
const pug = require('pug');
const mysql = require('mysql');
const { type } = require('os');

app.use(express.static('./static'))

var con = mysql.createConnection({
    database: "flask_eprod",
    host: "localhost",
    user: "root",
    password: ""
  });

const CompiledIndex = pug.compileFile('./templates/index.pug');
const CompiledSviKorisnici = pug.compileFile('./templates/svi_proizvodi.pug');

app.get("/", (request, response) => {

    response.send(CompiledIndex({moje_ime : "Aleksandar"}))

});

app.get('/svi_proizvodi', (request, response) => {
    
    sql = "SELECT * FROM proizvod"

    let svi_korisnici = []

    con.query(sql, function(err, result){
        if (err) throw err;         

        for (let i = 0;i < result.length; i++){            
            proizvod = {
                "naziv" : result[i].naziv_proizvoda,
                "cena" : JSON.stringify(result[i].proizvod_cena)
            }            
            svi_korisnici.push(proizvod)
        }

        console.log(svi_korisnici)
        response.send(CompiledSviKorisnici({
            coveci : svi_korisnici
        }))    
    })                
})

app.listen(process.env.PORT || 5000, () => console.log("Aplikacija se izvrsava na http://localhost:5000"))