//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose=require("mongoose");
const { name } = require("ejs");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB")

const itemsSchema ={
  name:String,
};

const Item = mongoose.model("item",itemsSchema)

const item1 = new Item({
  name:"Welcome to your to do list"
});

const item2 = new Item({
  name:"Hit the + button to add new items"
});

const item3 = new Item({
  name:"<== Hit this to delete an item"
});
let defaultItems =[item1,item2,item3];

const listSchema = {
  name:String,
  items:[itemsSchema]
}

const List = mongoose.model("List",listSchema);


app.get("/", function(req, res) {

  Item.find().then(function(foundItems){
    

    if (foundItems.length === 0) {
      
      Item.insertMany(defaultItems).then(function(){
        res.redirect("/");
      })
      
    }else{
      res.render("list", {listTitle: "today", newListItems: foundItems}); 
    }
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem =new Item({
    name: itemName,
  });

  if (listName === "today"){
    newItem.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName}).then(function(foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/"+listName);
    });
  }

});

app.post("/delete",function(req,res){
  
  const checkedItemId =req.body.checkbox;
  const listName =req.body.listName;
  
  if (listName === "today"){

    Item.findByIdAndDelete(checkedItemId).then(function(){ 
      res.redirect("/")
    });

  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}).then(function(){
      res.redirect("/"+listName);
    });
  }

  
  
  
});



app.get("/:customListName",function(req,res){
  
  let customListName=_.capitalize(req.params.customListName);

  List.findOne({name:customListName}).then(function(foundList){
    
    if(!foundList){
      const list = new List ({
      name:customListName,
      items: defaultItems,
      });
      list.save();
      res.redirect("/"+customListName);
    }else{
      res.render("list", {listTitle:foundList.name , newListItems: foundList.items}); 
    }
  })
  
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
