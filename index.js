const { response, json } = require('express');
const express = require('express');
const bodyParser = require('body-parser');
const { readFile } = require('fs');
const { request } = require('http');
const app = express();
const pug = require('pug');
const mysql = require('mysql');
const { type } = require('os');
const { stringify } = require('querystring');
const session = require('express-session');
const crypto = require('crypto');

app.use(express.static('./static'));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json())

app.use(session({
    secret: 'VERY_HARD_TO_CRACK_KEY',
    resave: false,
    saveUninitialized: true
}))

var con = mysql.createConnection({
    database: "node_db",
    host: "localhost",
    user: "root",
    password: ""
  });

const CompiledIndex = pug.compileFile('./templates/index.pug');
const CompiledSviKorisnici = pug.compileFile('./templates/svi_proizvodi.pug');
const CompiledDodajKorisnika = pug.compileFile('./templates/dodaj_proizvod.pug');
const CompiledUpdate = pug.compileFile('./templates/update_proizvod.pug');
const CompiledLogin = pug.compileFile('./templates/login.pug');
const CompiledRegister = pug.compileFile('./templates/register.pug')

function validiraj_username(username){
    sql = "SELECT * FROM korisnik WHERE korisnicko_ime=?"
    con.query(sql, [username], (err, result) => {
         if (err) throw err;
         korisnik = result[0]         
    })
    if (korisnik.username == username){
        return true
    }
}

function login_check(username, password){
    sql = "SELECT * FROM korisnik WHERE korisnicko_ime=?"
    con.query(sql,[username], (err, result) => {
        if (err) throw err
        pass_baza = result[0]                                    
        
    })  
    if (pass_baza.password == password){
        console.log("jea")
        return true
    }  
    else {
        return false
    }
         
        
}

app.get("/", (request, response) => {

    if (request.session.username){
        moje_ime = request.session.username
    }
    else{
        moje_ime = null
    }

    response.send(CompiledIndex({moje_ime : moje_ime}))    

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
                "cena" : JSON.stringify(result[i].cena),
                "opis" : result[i].opis_proizvoda
            }            
            console.log(proizvod['cena'])
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
    cena = parseFloat(request.body.cena)
    opis = request.body.opis    

    sql = "INSERT INTO proizvod VALUES (null,?,?,?)"

    con.query(sql, [naziv,cena,opis], (result, err) => {
        if (err) console.log("bulja");
        response.redirect('/svi_proizvodi');       
    })    
})

app.get('/update_proizvod/:proizvod_id', (request, response) => {
    
    id_proizvod = request.params.proizvod_id
    console.log(typeof(id_proizvod))    
    sql = "SELECT * FROM proizvod WHERE idProizvod=?"

    con.query(sql, [id_proizvod], function(err, result){
        if (err) console.log("Greska: " + err);
        p_baza = result[0]
        console.log(p_baza.idProizvod)
        proizvod = {
            'id' : (p_baza.idProizvod),
            'naziv' : (p_baza.naziv_proizvoda),
            'cena' : JSON.stringify(p_baza.cena),
            'opis' : (p_baza.opis_proizvoda)
        }
        
        return response.send(CompiledUpdate(
            {
                proizvod : proizvod
            }
        ))
    })    
})

app.post('/update_proizvod', (req, resp) =>{
    id = req.body.id
    naziv = req.body.naziv
    cena = req.body.cena
    opis = req.body.opis
    console.log(id, naziv, cena, opis)
    sql = "UPDATE proizvod SET naziv_proizvoda=?, cena=?, opis_proizvoda=? WHERE idProizvod=?"

    con.query(sql, [naziv, cena, opis, id], (err, result) => {
        if (err) console.log(err.code);                
        resp.redirect('/svi_proizvodi')        
    })
})

app.get('/delete_proizvod/:proizvod_id', (req, resp) => {
    proizvod_id = req.params['proizvod_id']

    sql = "DELETE FROM proizvod WHERE idProizvod=?"
    con.query(sql, [proizvod_id], (err, result) => {
        if (err) throw err;
        resp.redirect('/svi_proizvodi')
    })
})


app.get('/login', (req, resp) => {
    resp.send(CompiledLogin())
})

app.get('/register', (req, resp) => {
    resp.send(CompiledRegister())
})

app.post('/register', (req, resp) => {
    username = req.body.username
    password = req.body.password
    hash = crypto.createHash('sha256')
    hash.update(password)
    hashed_password = hash.digest('hex')

    if (validiraj_username(username)){
        sql = "INSERT INTO korisnik VALUES (null,?,?)"

        con.query(sql, [username,hashed_password], (err, result) => {
            if(err) throw err;
            resp.send(CompiledIndex())
        })
    }
    else {
        resp.send(CompiledRegister({
            err : "Korisnik sa ovim username-om vec postoji"
        }))
    }
    
})

app.post('/login', (req, resp) => {
    username = req.body.username
    password = req.body.password

    hash = crypto.createHash('sha256')
    hash.update(password)
    hashed_password = hash.digest('hex')

    if (login_check(username, hashed_password)){
        req.session.username = username        
        resp.redirect('/')
    }
    else{
        resp.redirect('/login')
    }
})

app.get('/logout', (req, resp) => {
    req.session.destroy()
    resp.redirect('/')
})

app.listen(process.env.PORT || 5000, () => console.log("Aplikacija se izvrsava na http://localhost:5000"))