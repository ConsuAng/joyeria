const express = require('express');
const app = express();
app.listen(3000, console.log('Server ON'));

const { getJoyas, prepararHATEOAS, getJoyasSearch } = require('./services/jewelry');

const reportarConsulta = async(req, res, next) => {
  const parametros = req.query;
  const url = req.url;
  console.log(`
    Hoy ${new Date()}
    Se ha recibido una consulta en la ruta ${url}
    con los parámetros:
  `, parametros);
  next();
};

app.get('/joyas', reportarConsulta, async (req, res) => {
  try {
    const queryString = req.query;
    const joyas = await getJoyas(queryString);
    const HATEOAS = await prepararHATEOAS(joyas);
    res.json(HATEOAS);
  } catch ({code, message}) {
    res.status(code).send(message);
  }
});

app.get('/joyas/filtros', reportarConsulta, async(req, res) => {
  try {
    const queryString = req.query;
    const joyas = await getJoyasSearch(queryString);
    res.json(joyas);
  } catch ({code, message}) {
    res.status(code).send(message);
  }
});