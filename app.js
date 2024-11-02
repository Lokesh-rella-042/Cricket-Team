const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())

const dbpath = path.join(__dirname, 'cricketTeam.db')

let db = null

const instllizeTheDatabase = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('server running')
    })
  } catch (e) {
    console.log(`DB error ${e.message}`)
    process.exit(1)
  }
}

instllizeTheDatabase()

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const getAllPlayersQuery = `
       SELECT 
         * 
       FROM 
         cricket_team
       ORDER BY 
         player_id;`

  const allPlayers = await db.all(getAllPlayersQuery)
  response.send(
    allPlayers.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const postingPlayerQuery = `
  INSERT INTO
  cricket_team (player_name, jersey_number, role)
  VALUES ('${playerName}', ${jerseyNumber}, '${role}');`
  await db.run(postingPlayerQuery)
  response.send('Player Added to Team')
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
       SELECT
         *
       FROM
         cricket_team
       WHERE
         player_id = ${playerId};`
  const getPlayer = await db.get(getPlayerQuery)
  response.send(convertDbObjectToResponseObject(getPlayer))
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const updatePayerDetails = request.body
  const {playerName, jerseyNumber, role} = updatePayerDetails
  const upadtingPlayer = `
  UPDATE
  cricket_team
  SET 
  player_name = '${playerName}',
  jersey_number = ${jerseyNumber},
  role = '${role}'
  WHERE
  player_id = ${playerId};`
  await db.run(upadtingPlayer)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDeleteQuery = `
  DELETE FROM 
  cricket_team
  WHERE 
  player_id = ${playerId};`
  const deletePlayer = await db.run(playerDeleteQuery)
  response.send('Player Removed')
})

module.exports = app
