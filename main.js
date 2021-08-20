const http = require('http')
const MongoClient = require('mongodb').MongoClient
const querystring = require('querystring')
const port = 4000

const url = 'mongodb://localhost:27017'
const dbName = 'usuarios'
const client = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const server = http.createServer((req, res) => {
  console.log('He creado el server')
  const { headers, method, url } = req
  console.log('headers: ', headers)
  console.log('method: ', method)
  console.log('url_req: ', url)

  let q = {}
  let resultados
  let body = []

  if (method == 'POST') {
    req.on('error', (err) => {
      console.error(err)
    }).on('data', chunk => {
      body.push(chunk)
    }).on('end', () => {
      body = Buffer.concat(body).toString()
      q = querystring.parse(body)
    })

    client.connect().then(async () => {
      const db = client.db(dbName)
      const collection = db.collection('usuarios')
      const insertResult = await collection.insertOne(q)
      console.log('Datos insertados: ', insertResult.result)

      resultados = await collection.find({}).toArray()
      console.log('Datos recibidos: ', resultados)
    }).then(async () => {
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.write('<html><body><p>Usuarios en la base de datos:</p>')
      for (let i = 0; i < resultados.length; i++) {
        res.write(`<li>${resultados[i].name} ${resultados[i].phone}</li>`)
      }
      res.write('</body></html>')
      res.end()
    })
      .catch((error) => {
        res.statusCode = 401
        console.log(error)
        client.close()
      })
  } else {
    console.log('Método de envío GET. Cancelando la petición.')
    res.end()
  }
})

server.listen(port, () => {
  console.log('Servidor ejecutandose...')
  console.log('Abrir en un navegador http://localhost:4000')
})
