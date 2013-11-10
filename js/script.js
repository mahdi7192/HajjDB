var db = openDatabase('mydb', '1.0', 'Test DB', 5000);
db.transaction(function (tx) {
   tx.executeSql('CREATE TABLE Nodes (id primary key, lat, lon)');
   tx.executeSql('DROP TABLE Nods');
});

db.transaction(function (tx) {
   tx.executeSql('CREATE TABLE Ways (id primary key, highway, oneway)');
});

db.transaction(function (tx) {
   tx.executeSql('CREATE TABLE Include (way_id, node_id, primary key(way_id, node_id))');
});

function f_ok(tx, result){
  console.log(result);
}

function f_err(tx, result){
  console.log(result);
}

function myFunc(){
  $.ajax({
    type: "GET", url: "maps/map.xml", dataType: "xml",
      success: function(xml) {
        $(xml).find('node').each(function(){
          var id = $(this).attr("id");
          var lat = $(this).attr("lat");
          var lon = $(this).attr("lon");
          
          db.transaction(function (transaction, f_ok, f_err) {
              transaction.executeSql("INSERT INTO Nodes (id, lat, lon) VALUES (?, ?, ?)", [id, lat, lon]);
          });  
        });
        
        $(xml).find('way').each(function(){
          var id = $(this).attr("id");
          var highway;
          var oneway = false;
          
          $(this).find('tag').each(function(){
            var k = $(this).attr("k");
            if(k == "highway") highway = $(this).attr("v");
          });
          
          $(this).find('oneway').each(function(){
            var k = $(this).attr("k");
            if(k == "oneway") oneway = true;
          });
          
          var nodeId;
          $(this).find('node').each(function(){
            nodeId = $(this).attr("id");
            
            db.transaction(function (transaction) {
                transaction.executeSql("INSERT INTO Include (way_id, node_id) VALUES (?, ?)", [id, nodeId]);
            });  
          });
          
          db.transaction(function (transaction) {
              transaction.executeSql("INSERT INTO Ways (id, highway, oneway) VALUES (?, ?, ?)", [id, highway, oneway]);
          });
        });
        
      },
      error: function(err){
        console.log(err);
      }
  });  
}