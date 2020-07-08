//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose=require("mongoose");
const _= require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/db_name",{useNewUrlParser:true, useUnifiedTopology:true});


const itemschema= new mongoose.Schema({
 name: {
   type: String,
   required: true
 }
});
const Item = mongoose.model("items", itemschema);

const coffee= new Item(
  {name:"coffee"}
);
const workout= new Item({
  name:"Workout"
});
const study= new Item({
  name:"Study"
});

const smoke= new Item({
  name:"Smoke"
});

const defaultItems = [];
var custom;

const listSchema = new mongoose.Schema({
  name: { type: String },
  item: { type: [itemschema] }
})
const List = mongoose.model("list", listSchema);




app.get("/", function(req, res) {

const day = date.getDate();
  Item.find({},function(err,items){
    if(items.length==0){

      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        }
        else {
          console.log("Success");
        }
      })
    }
    res.render("list", { listTitle: "Today", newListItems: items });
  })
   
  
  

});


app.get("/:custom", function (req, res) {
  custom = req.params.custom;

  List.findOne({ name: _.upperFirst(custom) }, function (err, list) {
    

    if (!err) {
      if (!list) {
        const newlist = new List({
          name: _.upperFirst(custom),
          item: defaultItems
        })
        console.log("NotExist");

        console.log(newlist);
        newlist.save();
        res.render("list", { listTitle: newlist.name, newListItems: newlist.item }); }
      else {
        res.render("list", { listTitle: list.name, newListItems: list.item });
        console.log("Exist");
      }
     }
  
  })
})




app.post("/", function(req, res){

  const item = req.body.newItem;
  const listName= req.body.list;
  var newJob = new Item({
    name: item
  });

  if (_.upperFirst(listName) === "Today") {
    Item.insertMany(newJob, function (err) {
      if (err) {
        console.log(err);
      }
    })
    res.redirect("/");
  }
  else {
    List.findOne({ name: _.upperFirst(listName) }, function (err, list) {
    if (err)
      console.log(err);
    else {
      list.item.push(newJob);
      list.save();
      res.redirect("/" + listName);
    }
  });
}});
app.post("/delete", function(req,res){
 console.log(req.body.check);
 const title=req.body.list;
 const listName=req.body.listName;
  if (_.upperFirst(listName)==="Today"){
 Item.deleteOne({_id:req.body.check}, function(err){
    if(err)
    console.log(err);
    
  });
   res.redirect("/");
}
else{
    List.findOneAndUpdate({ name: _.upperFirst(listName)}, { $pull: { item: { _id: req.body.check } } },function(err,list){
    if(!err)
      res.redirect("/" + listName);
  })

}

 
})




app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT||3000, function() {
  console.log("Server started on port 3000");
});
