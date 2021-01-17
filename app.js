// require default libraries
const express = require("express");
const bodyParser = require("body-parser");

// persistance data mongooose database
const mongoose = require("mongoose");
// require loadash libray helper function
const _ = require("lodash");

// require the date module file path in this directory
const date = require(__dirname + "/date.js");
// setting up express
const app = express();
 // call date module function
 const day = date.getDate();

// setting up  body-parser
const urlbodyParser = bodyParser.urlencoded({extended:true});
app.use(urlbodyParser);
app.use(express.static("public"));

// setting up ejs frame work view engine
app.set('view engine', 'ejs');


// create mongoose database and connection to url and database
mongoose.connect("mongodb+srv://amazing-admin:Test-123@cluster0.u4noh.mongodb.net/todoListDB", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true});

// create databse todolistDB document schema
const itemSchema = {name: String};

// create mongoose model that use the itemSchema and collection name
const Item = mongoose.model("Item", itemSchema);

// insert items with the model
const item1 = new Item({name:"Welcome to todolist"});
const item2 = new Item({name:"type text and hit the + to add item"});
const item3 = new Item({name:"click the checkbox to delete item"});

// insert items into collection
const defaultItems = [item1,item2,item3]

// url path schema creation to store path items
const pathSchema = {
    name: String,
    items: [itemSchema]
};

// create mongoose model that use the pathSchema and 
// collection name to create new collection
const List = mongoose.model("List", pathSchema);

// render home route with passed form object in myList route 
app.get("/", function(req, res) {
    // executes Query, passing results to callback foundItem
    Item.find({}, function(err, foundItem){

        if (foundItem.length === 0){
                Item.insertMany(defaultItems, function(err){
                    if (err){
                        console.log(err);
                    }else{
                        console.log("succesfully inserted items");
                    };
                });
                res.redirect("/");
            }else{
                // return dictionary pair in mylist file
                res.render("myList", {listName: day, addedItem: foundItem});
            };
            
        });
   
});

// Catch Post form request from insert or add item route in myList.ejs file
app.post("/", function(req, res) {
    // query item added
    const itemName = req.body.newItem;
    // query dynamic route path
    const listName = req.body.pathList

    // create new item in database
    const item = new Item({ 
        name: itemName
    });
    if (itemName.length !== 0 && listName === day ){
        item.save();
        res.redirect("/"); 
    }else if (itemName.length !== 0){
        // Query the route path and save item in desired route redirect to dynamic route
        List.findOne({name:listName}, function(err, foundItem){
            // console.log(foundItem);
            foundItem.items.push(item);
            foundItem.save();
            res.redirect("/" + listName);
        });

        // persist or do nothing if no item was added and add button was clicked
    }else if (itemName.length === 0 && listName === day){ 
        res.redirect("/");  
    }else{
        res.redirect("/" + listName); 
    }
});

// render dynamic path route using express route parameter
app.get("/:customPathName", function(req, res){
    // use lodash to capitalize string
    const customPathName = _.capitalize(req.params.customPathName);
    // querry from list collection
    List.findOne({name:customPathName}, function(err, foundItem){
        if (!err){
            if (!foundItem){
                // create a new list items for new route
                // create new list collection with specified route path
                const list = new List({
                    name:customPathName,
                    items:defaultItems
                });
                list.save();
                res.redirect("/" + customPathName );

            }else{
                // show or render an existing list in mylist.ejs file
                res.render("myList", {listName: foundItem.name, addedItem: foundItem.items})
            };
        };
    });

  
});

//catch  delete item form route when checked 
app.post("/delete", function(req, res){
    // save current checked item
    const checkeItemId = req.body.checkbox;
    // save current route path 
    const listTitle = req.body.listTitle;
    // check if path is home route
    if (listTitle === day){
        Item.findByIdAndRemove(checkeItemId, function(err){
            if (err){
                console.log(err);
            };
            res.redirect("/");
        });
    }else{
        // query route that match listTile and Pull from the items array
        //  where _id is checkeItemId then remove the item from the array and save or update array
        List.findOneAndUpdate({name: listTitle},{$pull: {items: {_id: checkeItemId}}}, function(err, foundList){
            if(!err){
                res.redirect("/" + listTitle);
            }
        });
    }
      
});

app.get("/about", function(req, res){
    res.render("about");
});

// listening port
app.listen(3000, function(req, res) {
    console.log("app is listening a port 3000");
})