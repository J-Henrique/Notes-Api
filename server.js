const { firebaseApiKey, firebaseProjectId } = require('./credentials.js')
const express = require("express");
const app = express();
const firebase = require("firebase");
require("firebase/firestore");

firebase.initializeApp({
  apiKey: firebaseApiKey,
  projectId: firebaseProjectId
});

var db = firebase.firestore().collection("notes");
app.use(express.json());

app.get("/notes", function(req, res) {
  db.get().then((querySnapshot) => {
    var notes = new Array();

    querySnapshot.forEach((doc) => {
      notes.push({
        id: doc.id,
        data: doc.data()
      })
      console.log(doc.data());
    });

    res.json(notes);
  });
});

app.get("/notes/:id", function(req, res) {
  const { id } = req.params;
  var docRef = db.doc(id);

  docRef.get().then(function(doc) {
    if (doc.exists) {
      res.json(doc.data())
    } else {
      res.status(204).json();
    }
  }).catch(function(error) {
    console.error("Error: ", error);
  });
});

app.post("/notes", function(req, res) {
  const { title } = req.body;

  db.add({
    title: title,
    is_completed: false
  })
  .then(function(docRef) {
    res.json({ 
      id: docRef.id, 
      title: title,
      is_completed: false
    });
  })
  .catch(function(error) {
    console.error("Error: ", error);
    res.status(500).json();
  });
});

app.put("/notes/:id", function(req, res) {
  const { id } = req.params;
  const docRef = db.doc(id);
  const { title, is_completed } = req.body;

  docRef.get().then(function(doc) {
    if (doc.exists) {
      var updatedNote = {
        title: title,
        is_completed: is_completed
      }
      
      docRef.set(updatedNote);

      var updatedDoc = {
        id: doc.id,
        data: doc.data()
      }
      res.json(updatedDoc);
      console.log(updatedDoc.data);
    } else {
      res.status(204).json();
    }
  }).catch(function(error) {
    console.error("Error: ", error);
  });
});

app.delete("/notes/:id", function(req, res) {
  const { id } = req.params;
  var docRef = db.doc(id);

  docRef.delete().then(function() {
    res.json({ id: id });
  }).catch(function(error) {
    console.error("Error: ", error);
    res.status(500).json();
  });
});

app.listen(3000, function() {
  console.log("Server is running");
});