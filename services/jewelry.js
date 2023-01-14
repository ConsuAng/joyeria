const { Pool } = require("pg");
const format = require("pg-format");

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    password: "postgres",
    database: "joyas",
    port: 5432,
    allowExitOnIdle: true
});

const getJoyas = async ({ limits = 10, page = 1, order_by = 'id_ASC'}) => {
  const [ campo, direccion ] = order_by.split("_");
  const offset = (page - 1)  * limits;

  const query = format('SELECT * FROM inventario order by %s %s LIMIT %s OFFSET %s', campo, direccion, limits, offset);
  const { rows: joyas, rowCount } = await pool.query(query);
  
  if (rowCount === 0) {
    throw { code: 404, message: `No se encontraron resultados` };
  };

  return joyas;
};

const getJoyasSearch = async({ precio_min, precio_max, categoria, metal }) => {
  let filtros = [];
  const values = [];

  function agregarFiltros(campo, comparador, valor) {
    values.push(valor);
    const {length} = filtros
    filtros.push(`${campo} ${comparador} $${length + 1}`) 
  }

  if(precio_min) agregarFiltros('precio', '>=', precio_min);
  if(precio_max) agregarFiltros('precio', '<=', precio_max);
  if(categoria) agregarFiltros('categoria', '=', categoria);
  if(metal) agregarFiltros('metal', '=', metal);

  let consulta = 'SELECT * FROM inventario';
  if(filtros.length > 0) {
    filtros = filtros.join(' AND ');
    consulta += ` WHERE ${filtros}`
  };

  const { rows: joyas, rowCount } = await pool.query(consulta, values);

  if (rowCount === 0) {
    throw { code: 404, message: `No se encontraron resultados` };
  };

  return joyas;
};


const prepararHATEOAS = (joyas) => {
  const results = joyas.map((j) => {
    return {
      name: j.nombre,
      href: `joyas/joya/${j.id}`,
    }
  });
  const totalJoyas = joyas.length
  const totalStock =  joyas.reduce((total, j) => total + j.stock, 0);
  const HATEOAS = {
    totalJoyas,
    totalStock,
    results
  }

  return HATEOAS;
};

module.exports = { getJoyas, prepararHATEOAS, getJoyasSearch };