// imports
const { Client } = require("pg");
const fs = require("fs");
const express = require("express");
require('dotenv').config();

// declarations
const app = express();
const port = 8000;
const client = new Client({
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME, 
    password: process.env.DB_PASSWORD,
    port: 5432,
});


client.connect();

app.use(express.json());
// routes
app.get("/api/tickets", async (req, res) => {
  try {
    const data = await client.query("SELECT * FROM tickets");

    res.status(200).json({
      status: "OK",
      data: data.rows,
      message: "LISTE DES TICKETS",
    });
  } catch (err) {
    console.log(err.stack);
    res.status(500).json({
      status: "FAIL",
      data: undefined,
      message: "une erreur est survenue",
    });
  }
});

app.get("/api/tickets/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const data = await client.query("SELECT * FROM tickets where ticket_id = $1", [id]);

    if(data.rowCount > 0)
    {
      res.status(200).json({
        status: "OK",
        data: data.rows,
        message: "TICKET CLIENT",
      });

      return;
    }

    res.status(404).json({
      status: "FAIL",
      data: undefined,
      message: "le ticket n'existe pas",
    });
    

  } catch (err) {
    console.log(err.stack);
    res.status(404).json({
      status: "FAIL",
      data: undefined,
      message: "erreur serveur",
    });
  }
});

app.post("/api/tickets", async (req, res) => {
  console.log(req.body);

  const message = req.body.message;
  //const done = req.body.done; n'est plus nécessaire car la valeur est "false" par défaut

    if (typeof message !== "string") {
      res.status(400).json({
      status: "FAIL",
      data: undefined,
      message: "erreur de syntaxe"
      });

     return;
     
    }

    try {

    const data = await client.query("INSERT INTO tickets (message,done) VALUES ($1, $2) RETURNING * ", [message, false]);//RETURNING permet de renvoyer l'intégralité de l'objet et [false] donne une valeur "false par défaut à "done"

    res.status(201).json({
      status: "Created",
      data: data.rows[0], // permet d'éviter data:[], sachant qu'il n'y a qu'un seul ticket à retoruner.
      message: "Ticket ajouté"
    });
  
  } 

  catch (err) {
    console.log(err.stack);
    res.status(404).json ({
    status: "FAIL",
    data: undefined,
    message: "erreur serveur",
    });
  }
});

app.put("/api/tickets", async (req, res) => {
  // console.log(req.params);
  const { id, message, done } = req.body;

  if ( typeof id !== "number" || typeof message !== "string" || typeof done !== "boolean") {
    res.status(400).json({
      status: "FAIL",
      data: undefined,
      message: "erreur de syntaxe",
    });
  }

  // check ticket
  const isTicketExist = await client.query("SELECT * FROM tickets WHERE ticket_id = $1", [id]);
  console.log(isTicketExist);
  if (isTicketExist.rows.length === 0) {
    res.status(404).json({
      status: "FAIL",
      data: undefined,
      message: "le ticket que vous tentez de modifier n'existe pas",
    });

    return;
  }

  const data = await client.query("UPDATE tickets SET message = $2, done = $3 WHERE ticket_id = $1 RETURNING *;", [id, message, done]);

  if (data.rowCount === 1) {
    res.json({
      status: "OK",
      data: data.rows,
      message: "edition ok",
    });
  } else {
    res.json({ done: false });
  }
});
app.delete("/api/tickets/:id", async (req, res) => {
  console.log(req.params);
  const id = req.params.id;

  const data = await client.query("DELETE FROM tickets WHERE ticket_id = $1", [id]);

  if (data.rowCount === 1) {
    res.status(200).json({ 
      status:"SUPPRESSION TICKET EFFECTUEE",
      data:data.rows,
      deleted: true ,
    });

  } else {

    res.status(404).json({
      status:"Impossible à supprimer, le ticket n'existe pas",
      data: undefined,
      deleted: false,
    });
  }
});



// ecoute le port 8000
app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
