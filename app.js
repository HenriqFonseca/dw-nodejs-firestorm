const express = require("express")
const app = express()
const handlebars = require("express-handlebars").engine
const bodyParser = require("body-parser")
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app')
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore')

const serviceAccount = require('./projetonodejs-16161-firebase-adminsdk-uffxm-0a0bb2a3fc.json')
var admin = require("firebase-admin");


initializeApp({
  credential: cert(serviceAccount)
})

const db = getFirestore()

const Agendamento = db.collection("agendamentos")


app.engine("handlebars", handlebars({defaultLayout: "main"}))
app.set("view engine", "handlebars")

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get("/", function(req, res){
    
    res.render("primeira_pagina")
    
})

app.get("/consulta", async function(req, res){
    let agendamentos =[]
    const snapshot= await Agendamento.get()
    snapshot.forEach((doc) => {
        agendamentos.push({id: doc.id, ...doc.data()})
    });
    res.render("consulta",{post: agendamentos})
    
})

app.get("/editar/:id", function(req, res){
    var id = req.params.id;
    const result = Agendamento.doc(id).get()
        .then((doc) => {
            if (doc.exists) {
                res.render("editar", { dados: doc.data(), id: id })
            } else {
                res.status(404).send("Agendamento não encontrado")
            }
        })
        .catch((error) => {
            console.error("Erro ao buscar agendamento para edição: ", error)
        });
})



app.get("/excluir/:id", async function(req, res){
    let id = req.params.id;
    const result = await Agendamento.doc(id).delete()
    res.redirect("/consulta")
})

app.post("/cadastrar", function(req, res){
    var result = Agendamento.add({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function(){
        console.log('Added document')
        res.redirect('/')
    })
})

app.post("/atualizar", function(req, res){
    var id = req.body.id;

    var result= Agendamento.doc(id).update({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function(){
        console.log('Atualizado com sucessor')
        res.redirect('/consulta')
    })
    
})

app.listen(8081, function(){
    console.log("Servidor ativo!")
})