/*-----------------------------------------------------------------------------
This Bot demonstrates how to use an IntentDialog with a LuisRecognizer to add 
natural language support to a bot. The example also shows how to use 
UniversalBot.send() to push notifications to a user.
For a complete walkthrough of creating this bot see the article below.
    http://docs.botframework.com/builder/node/guides/understanding-natural-language/
-----------------------------------------------------------------------------*/
var client = require('mongodb').MongoClient;
var DB_CONN_STR = 'mongodb://localhost:27017/LUISDemo'; // 数据库为LUISDemo
var builder = require('botbuilder');
var restify = require('restify');
//var mongodb = mongodb://admin
//var express = require('express');

var db_is_item_exist = require('./database').db_is_item_exist;
var db_insert = require('./database').db_insert;

//设置restify监听器
var server = restify.createServer();
server.listen(process.env.port||process.env.PORT||3978,function(){
    console.log('%s listen to %s', server.name,server.url);
});

//创建ChatConnector
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

//创建bot，将ChatConnector绑定在上边
var bot = new builder.UniversalBot(connector);
server.post('/api/messages',connector.listen());

//建立LUIS识别器
var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/68d724bb-c287-44c5-a0ac-48ecd925f176?subscription-key=6d4cdd4e1c3e442099f4ee4ef6ccb3dd&verbose=true&timezoneOffset=0&q=';
var recognizer = new builder.LuisRecognizer(model);

//将识别器绑定至一个IntentDialog类
var luisDialog = new builder.IntentDialog( { recognizers : [recognizer] } );//将LUIS识别器传入IntentDialog类的构造函数


//对话逻辑部分
bot.dialog('/',luisDialog);
luisDialog.matches('search',[
    function (session,args){//args含有LUIS传回的信息。session为当前会话？
        var item_name = builder.EntityRecognizer.findEntity(args.entities,'Item').entity;
       // var location = builder.EntityRecognizer.findEntity(args.entities,'Place');
        if(args.entities.length == 0||!item_name){
            session.send('没有听懂，请重试。');
            return;
        } 
        
        session.send('%s 想要找 %s',session.message.user.id,item_name);//使用session.send()向用户发回信息。此处session.message.user.id可以改。
      // session.send('session.message.user.id :'+session.message.user.id);
        //session.send('session.message.user._id :'+session.message.user._id);
       var pro =  db_is_item_exist(session.message.user.id,item_name);
    pro.then((result)=>{
                if(result==false){//数据库没有记录
                    session.send('未找到%s的信息', item_Name);
                }
                else{//数据库有记录
                    session.send('%s 在 %s', item_name,location);
               }
       });
         //session.send('%s 在 %s', item_name,location);
    }
]);

luisDialog.matches('save',[
    function(session,args,next){
        if(args.entities.length == 0){
            session.send('没有找到');
            return;
        }
        var location = builder.EntityRecognizer.findEntity(args.entities,'Place').entity||null;
        var item = builder.EntityRecognizer.findEntity(args.entities,'Item').entity||null;
        
        if(!location){
            session.send('没有理解，请重试。');
            return;
        }
        //将数据记录写入数据库
        session.send('你把 %s 放在 %s ',item,location);
        db_insert(session.message.user.id,item,location);
        
    }
]);
luisDialog.onDefault(builder.DialogAction.send('没有理解请重试。'))

