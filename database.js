var mongodb = require('mongodb');
var DB_CONN_STR = 'mongodb://localhost:27017/LUISDemo'; // 数据库为LUISDemo

var server = new mongodb.Server(
    'localhost',
    27017,
    {
        auto_reconnect: true
    }
);

var db = new mongodb.Db(
    'luisDemo',
    server,
    {
        safe:true
    }
);

//连接至数据库集合
db.open(function(err,db){
    if(err){
        console.log('Connected MongoDB:nodejs successfully!');
        db.collection('list',{safe:true}, function(errcollection,collection){
            if(!errcollection){
                console.log('Connected MondoDB:nodejs:demo successfully');
            }
            else{
                console.log('log-' + err);
            }
        });
    }
    else{
        console.log('log- '+ err);
    }
});
//test 仿照MSC实例
module.exports.db_insert = function(user_id,item_name,location){
     //var db = 'INSERT VALUE r.itemlocation.' + item_name + ' FROM root r WHERE r.id ="' + user_id +'"';
    //连接至表site
    var collection = db.collection('list');
    var data = [{"user_id":user_id,"item_name":item_name,"location":location}];
    collection.insert(data,{safe:true},function(errinsert, result){
        console.log(result);
    });
}

module.exports.db_is_item_exist = function(user_id,item_name){

    var collection = db.collection('list');
    var whereStr = {"user_id":user_id,"item_name":item_name}
    //成功代码
    // collection.find(whereStr).toArray(function(errorfind, cols){
    //     if(!errorfind){
    //         console.log(cols);
    //     }
    // });
    return new Promise((resolve, reject)=>{
        collection.find(whereStr).toArray((err, results)=>{
            if(err) reject(err)
            else{
                if(results[0]){
                    location = results[0].location;
                   console.log(results[0]);
                    resolve(1);
                }
                else{console.log("Nothing");resolve(0);}
            }
        });
    });
    console.log(whereStr);
}

// function db_item_insert(user_id,item_name,location){
//      //var sql = 'INSERT VALUE r.itemlocation.' + item_name + ' FROM root r WHERE r.id ="' + user_id +'"';
//     //连接至表site
//     var collection = db.collection('demo');
//     var data = [{"user_id":user_id,"item_name":item_name,"location":location}];

//     collection.insert(data,function(err,result){
//         if(err){
//             console.log('Error:'+err);
//             return;
//         }
//         callback(result);
//     })
// }

// function db_is_item_exist(user_id,item_name){
//     //连接至表 
//     var collection = db.collection('demo');
//     //查询数据
//     var whereStr = {"user_id":user_id,"item_name":item_name}
//     collection.find(whereStr).toArray(function(err,result){
//         if(err){
//             console.log('Error:'+err);
//             return;
//         }
//         callback(result);
//     });
// }

