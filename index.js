const { response, json } = require('express');
const express = require('express');
const bodyParser = require('body-parser');
const { readFile } = require('fs');
const { request } = require('http');
const app = express();
const pug = require('pug');
const mysql = require('mysql');
const { type } = require('os');


app.use(express.static('./static'));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json())

var con = mysql.createConnection({
    database: "flask_eprod",
    host: "localhost",
    user: "root",
    password: ""
  });

const CompiledIndex = pug.compileFile('./templates/index.pug');
const CompiledSviKorisnici = pug.compileFile('./templates/svi_proizvodi.pug');
const CompiledDodajKorisnika = pug.compileFile('./templates/dodaj_proizvod.pug');
const CompiledUpdate = pug.compileFile('./templates/update_proizvod.pug');

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
                "id" : JSON.stringify(result[i].idProizvod),
                "naziv" : result[i].naziv_proizvoda,
                "cena" : JSON.stringify(result[i].proizvod_cena),
                "opis" : result[i].opis_proizvoda
            }            
            svi_korisnici.push(proizvod)
        }

        console.log(svi_korisnici)
        response.send(CompiledSviKorisnici({
            coveci : svi_korisnici
        }))    
    })                
})

app.get('/dodaj_proizvod', (request, response) => {
    id_korisnik = request.params
    console.log(id_korisnik)
    response.send(CompiledDodajKorisnika());
})

app.post('/dodaj_proizvod', (request, response) => {
    naziv = request.body.naziv
    cena = request.body.cena
    opis = request.body.opis
    slika = request.body.slika
    stanje = request.body.stanje
    prodavac = request.body.prodavac

    sql = "INSERT INTO proizvod VALUES (null,?,?,?,?,?,?,0)"

    con.query(sql, [naziv,cena,opis,slika,stanje,prodavac], (result, err) => {
        if (err) console.log("bulja");
        response.redirect('/svi_proizvodi');
        console.log(result)
        console.log('bulja')
    })    
})

app.get('/update_proizvod/:user_id', (request, response) => {
    
    id_korisnik = request.params.user_id
    console.log(id_korisnik)
    sql = "SELECT * FROM proizvod WHERE idProizvod=?"

    con.query(sql, [id_korisnik],(result, err)=>{
        // if (err) console.log(err);
        proizvod_iz_baze = {
            "naziv" : result.naziv_proizvoda,
            "cena" : result.cena,
            "opis" : result.opis_proizvoda
        }              

        response.send(CompiledDodajKorisnika({
            korisnik: proizvod_iz_baze
        }))
    })
})

app.listen(process.env.PORT || 5000, () => console.log("Aplikacija se izvrsava na http://localhost:5000"))