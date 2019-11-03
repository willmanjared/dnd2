const mysql = require('mysql');
const Discord = require('discord.js');
const lodash = require('lodash');
const bot = new Discord.Client();
let usr; // defined when user interacts with server
let champs; // defined when user interacts with server
//let usr_session;

const token = 'NTkyMDY2MDEzMTM5NDM1NTUw.XayLTg.KSfX2uxtn866crCOBTTRAPySC64';

// bot.on('',);
const PREFIX = '/e';


const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "eden",
  multipleStatements: true
});


con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!!!");
});



bot.on('ready', () => {
  console.log("Bot is online");
});


bot.on('guildMemberAdd', member => {

  console.log("New guild member has joined");
  console.log(member.user.id);

});

bot.on('guildMemberRemove', member => {

  console.log("Guild member has been Removed");
  console.log(member.user.id);

});

bot.on('presenceUpdate', member => {
 console.log('Presence Updated: ' + member.id);
});


bot.on('message', msag => {


      if (msag.author.bot) return;

      //console.log(JSON.stringify(msag.author.id));


      usr = null;
      champs = null;

      con.query('SELECT id,discord_id,selected_champ,discord_username,discord_number FROM eden_users WHERE discord_id=' + msag.author.id + ';', function (error, results, fields) {
      if (error) throw error;


      const dab = false;

      if (results.length == 0) {
        //console.log(JSON.stringify(results));
        msag.reply("```You do not seem to have an account with us, please contact a GM for help```");

        return;
      }

      console.log(JSON.stringify(results));

      results = JSON.parse(JSON.stringify(results));
      usr = results[0];

      let args = msag.content.substring(PREFIX.length).split(' ');
      console.log(args[1]);

      con.query('SELECT * FROM champs WHERE eden_user_id='+ usr.id, function (error, results, fields) {
          if (error) throw error;

          let i = 0;
          champs = JSON.parse(JSON.stringify(results));

          let c = champs.length;
          console.log(JSON.stringify(results.length));


          if (c > 0 && dab == true) {

            champs.forEach(champ => {

                con.query('SELECT * FROM classes WHERE champ_id='+champ.id+'; SELECT * FROM attributes WHERE champ_id='+champ.id+'; SELECT * FROM throws WHERE champ_id='+champ.id+'; SELECT * FROM wallets WHERE champ_id='+champ.id+';SELECT * FROM equipment WHERE champ_id='+champ.id+';' , function (error, results, fields) {
                  if (error) throw error;
                  let attr = JSON.parse(JSON.stringify(results));
                  champs[i].class = attr[0][0];
                  champs[i].attributes = attr[1][0];
                  champs[i].throw = attr[2][0];
                  champs[i].wallet = attr[3][0];
                  champs[i].equipment = attr[4][0];
                  //console.log(champs[i]);

                  i++;

                  if (i == c) {

                    bot_response(args, usr, msag);

                  }

          });

        });

      } else {
        //console.log("something");
        /* GM CODE
        if(msag.member.roles.find(r => r.name === "GM") || msag.member.roles.find(r => rname === "GM")) {
          msag.reply("THIS IS A GM's Message");
        } else {
          msag.reply("ThIS IS A BASIC BITCH MESSSAGE");
        }
        */
        bot_response(args, usr, msag);
      }

    });

  });

});



/*

/e wallet: show player meta point values and individual player character's experience, coin, and renown. By default wallet displayed will be the one belonging to the discord user whom typed the command
/e wallet X: show discord user X's wallet (DMs and GMs only)
/e wallet Y add coin X: adds X coin to Y character (DMs and GMs only) *
/e wallet Y subtract coin X: subtracts X coin from Y character
/e wallet Y add renown X: add X renown to Y character (DMs and GMs only)
/e wallet Y subtract renown X : subtract X renown from Y character (DMs and GMs only)
/e wallet Y add experience X: add X experience to Y character (DMs and GMs only)
/e generate wallet X Y: create a wallet for discord username X, discord user discriminator ID #Y (DMs and GMs)
/e delete wallet X Y: delete a wallet for discord username X, discord user discriminator ID #Y (Owner only)
/e createcharacter X Y Z: add to X discord username with Y discord user discriminator ID's wallet a character by the name of Z (DMs and GMs)
/e deletecharacter X Y Z: delete X discord username with Y discord user discriminator ID's wallet a character by the name of Z (DMs and GMs)
/e wallet Y Z add Metapoints X: add X Metapoints to Y discord user, Z discord user discriminator ID (DMs and GMs)
/e wallet Y Z subtract Metapoints X: subtract X Metapoints from Y discord user, Z discord user discriminator ID (DMs and GMs)

/e wallet Y Z set metapoints X: Y is the discord user, X is the discord users discriminator ID, X is the value set
/e wallet notes X: player will have a 500 character limit to type any message they want, which will be displayed as the next line underneath their Metapoint value when typing "/e wallet"
/e wallet GMnotes Y Z X: Game Master will have 500 character limit to type any message they want on Y Z wallet (Y is the username, Z is the discriminator ID), X is what they want to type.
 X will be displayed as the next line underneath their Metapoints value when typing "/e wallet". However, only when a Game Master types this will it be visible in the chat. Players can not
  see Game Master notes associated with their wallet.


+ ADD NAME TO createCharacter function

*/



function bot_response(args,user,msg) {

  const patt = '/(?=.)^\$?(([1-9][0-9]{0,2}(,[0-9]{3})*)|0)?(\.[0-9]{1,2})?$/';
  //let ini_val = args[0];

  //console.log(args[1]);

/*
  con.query('', function (error, results, fields) {
      if (error) throw error;
    });
*/

  switch(args[1]) {

    case "wallet":
      switch(args[2]) {
        case "notes":

        switch (args[3]) {
          case "edit":

              con.query('SELECT id FROM eden_users WHERE discord_username="'+ args[4] +'" AND discord_number="'+ args[5] +'" ', function (error, results, fields) {
                if (error) throw error;

                if(results.length > 0) {

                  let a = "";


                  for(let i = 6; i <= args.length; i++) {

                    if(args.length == i) {

                      con.query('UPDATE wallets SET user_notes="'+ a +'"', function (error, results, fields) {
                        if (error) throw error;

                        msg.reply("Wallet User Notes successfully edited");

                      });

                    } else {
                      a += args[i] + " ";
                    }

                  }


                } else {
                  msg.reply("This Eden user could not be found...");
                }
              });

            break;
          default:
            con.query('SELECT id FROM eden_users WHERE discord_username="'+ args[3] +'" AND discord_number="'+ args[4] +'" ', function (error, results, fields) {
              if (error) throw error;

              if(results.length > 0) {

                con.query('SELECT user_notes FROM wallets WHERE eden_user_id='+ results[0].id +'', function (error, results, fields) {
                  if (error) throw error;

                  msg.reply("User Notes: "+ results[0].user_notes);

                });


              } else {
                msg.reply("This Eden user could not be found...");
              }

            });
        }

        break;
        case "gmnotes":

          switch(args[3]) {
            case "edit":

              con.query('SELECT id FROM eden_users WHERE discord_username="'+ args[4] +'" AND discord_number="'+ args[5] +'" ', function (error, results, fields) {
                if (error) throw error;

                if(results.length > 0) {

                  let a = "";


                  for(let i = 6; i <= args.length; i++) {

                    if(args.length == i) {

                      con.query('UPDATE wallets SET gm_notes="'+ a +'"', function (error, results, fields) {
                        if (error) throw error;

                        msg.reply("Wallet GM Notes successfully edited");

                      });

                    } else {
                      a += args[i] + " ";
                    }

                  }


                } else {
                  msg.reply("This Eden user could not be found...");
                }
              });

            break;
            default:
              con.query('SELECT id FROM eden_users WHERE discord_username="'+ args[3] +'" AND discord_number="'+ args[4] +'" ', function (error, results, fields) {
                if (error) throw error;

                if(results.length > 0) {

                  con.query('SELECT gm_notes FROM wallets WHERE eden_user_id='+ results[0].id +'', function (error, results, fields) {
                    if (error) throw error;

                    msg.reply("GM Notes: "+ results[0].gm_notes);

                  });


                } else {
                  msg.reply("This Eden user could not be found...");
                }

              });
          }

        break;
        case "create":
          msg.reply("create wallet");
          con.query('INSERT INTO eden_users (discord_username,discord_number,selected_champ) VALUES ("'+args[3]+'","'+args[4]+'",0)', function (error, results, fields) {
              if (error) throw error;
              //console.log("INSERT ID: ");
              //console.log(JSON.stringify(results.insertId));
              let id = results.insertId;
              con.query('INSERT INTO wallets (eden_user_id,meta_points,user_notes,gm_notes) VALUES ('+id+',0,"these are test user notes...","these are test gm notes..")', function (error, results, fields) {
                  if (error) throw error;
                  //console.log(JSON.stringify(results));
                  msg.reply("```Eden User and Wallet has been created successfully!```");
                });
            });
        break;
        case "delete":

        console.info(args[4]);
        console.log(args);

        con.query('SELECT id FROM eden_users WHERE discord_username="'+ args[3] +'" AND discord_number="'+ args[4] +'" ', function (error, results, fields) {
              if (error) throw error;

              if(results.length > 0) {

                let a = results[0].id;

                con.query('DELETE FROM wallets WHERE eden_user_id='+ a +'', function (error, results, fields) {
                  if (error) throw error;

                  con.query('DELETE FROM eden_users WHERE id='+ a +'', function (error, results, fields) {
                    if (error) throw error;

                    msg.reply("Wallet has been successfully deleted");

                  });

                });

              } else {
                msg.reply("This Eden user could not be found...");
              }

        });

        break;
        case "coin":

          switch(args[3]) {
            case "add":

              con.query('SELECT id FROM eden_users WHERE discord_username="'+ args[4] +'" AND discord_number="'+ args[5] +'" ', function (error, results, fields) {
                    if (error) throw error;

                    if (results.length > 0) {

                    con.query('SELECT * FROM champs WHERE eden_user_id='+ results[0].id +' AND name="'+ args[6] +'"', function (error, results, fields) {
                      if (error) throw error;

                      if (results.length > 0) {

                        con.query('SELECT * FROM classes WHERE champ_id='+ results[0].id +' and name="'+ args[6] +'"', function (error, results, fields) {
                          if (error) throw error;

                          //console.info(results[0]);
                          let a = parseInt(args[7]) + parseInt(results[0].coin);

                            con.query('UPDATE classes SET coin='+ a +' WHERE champ_id='+ results[0].champ_id +' AND name="'+ args[6] +'"', function (error, results, fields) {
                              if (error) throw error;
                              msg.reply("```Successfully added "+ args[7] +" to "+ args[4] +"#"+ args[5] +"'s wallet! \n\n Coin: "+ a +"```");
                            });

                          });

                      } else {

                        msg.reply("This character could not be found...");

                      }

                    });

                  } else {

                    msg.reply("This Eden user could not be found...");

                  }

                  });
            break;
            case "subtract":

            con.query('SELECT id FROM eden_users WHERE discord_username="'+ args[4] +'" AND discord_number="'+ args[5] +'" ', function (error, results, fields) {
                if (error) throw error;

                if (results.length > 0) {

                con.query('SELECT * FROM champs WHERE eden_user_id='+ results[0].id +' AND name="'+ args[6] +'"', function (error, results, fields) {
                  if (error) throw error;

                  if (results.length > 0) {

                    con.query('SELECT * FROM classes WHERE champ_id='+ results[0].id +' and name="'+ args[6] +'"', function (error, results, fields) {
                      if (error) throw error;

                      console.info(results[0]);
                      let a = parseInt(results[0].coin) - parseInt(args[7]);

                        con.query('UPDATE classes SET coin='+ a +' WHERE champ_id='+ results[0].champ_id +' AND name="'+ args[6] +'"', function (error, results, fields) {
                          if (error) throw error;
                          msg.reply("```Successfully subtracted "+ args[7] +" to "+ args[4] +"#"+ args[5] +"'s wallet! \n\n Coin: "+ a +"```");
                        });

                      });

                  } else {

                    msg.reply("This character could not be found...");

                  }

                });

              } else {

                msg.reply("This Eden user could not be found...");

              }

              });

            break;
          }

        break;
        case "experience":

          switch(args[3]) {
            case "add":

            con.query('SELECT id FROM eden_users WHERE discord_username="'+ args[4] +'" AND discord_number="'+ args[5] +'" ', function (error, results, fields) {
                if (error) throw error;

                if (results.length > 0) {

                con.query('SELECT * FROM champs WHERE eden_user_id='+ results[0].id +' AND name="'+ args[6] +'"', function (error, results, fields) {
                  if (error) throw error;

                  if (results.length > 0) {

                    con.query('SELECT * FROM classes WHERE champ_id='+ results[0].id +' and name="'+ args[6] +'"', function (error, results, fields) {
                      if (error) throw error;

                      //console.info(results[0]);
                      let a = parseInt(args[7]) + parseInt(results[0].experience);

                        con.query('UPDATE classes SET experience='+ a +' WHERE champ_id='+ results[0].champ_id +' AND name="'+ args[6] +'"', function (error, results, fields) {
                          if (error) throw error;
                          msg.reply("```Successfully added "+ args[7] +" to "+ args[4] +"#"+ args[5] +"'s wallet! \n\n Experience: "+ a +"```");
                        });

                      });

                  } else {

                    msg.reply("This character could not be found...");

                  }

                });

              } else {

                msg.reply("This Eden user could not be found...");

              }

              });

            break;
            case "subtract":
            con.query('SELECT id FROM eden_users WHERE discord_username="'+ args[4] +'" AND discord_number="'+ args[5] +'" ', function (error, results, fields) {
                if (error) throw error;

                if (results.length > 0) {

                con.query('SELECT * FROM champs WHERE eden_user_id='+ results[0].id +' AND name="'+ args[6] +'"', function (error, results, fields) {
                  if (error) throw error;

                  if (results.length > 0) {

                    con.query('SELECT * FROM classes WHERE champ_id='+ results[0].id +' and name="'+ args[6] +'"', function (error, results, fields) {
                      if (error) throw error;

                      console.info(results[0]);
                      let a = parseInt(results[0].experience) - parseInt(args[7]);

                        con.query('UPDATE classes SET experience='+ a +' WHERE champ_id='+ results[0].champ_id +' AND name="'+ args[6] +'"', function (error, results, fields) {
                          if (error) throw error;
                          msg.reply("```Successfully subtracted "+ args[7] +" to "+ args[4] +"#"+ args[5] +"'s wallet! \n\n Experience: "+ a +"```");
                        });

                      });

                  } else {

                    msg.reply("This character could not be found...");

                  }

                });

              } else {

                msg.reply("This Eden user could not be found...");

              }

              });
            break;
          }

        break;
        case "renown":

          switch(args[3]) {
            case "add":

            con.query('SELECT id FROM eden_users WHERE discord_username="'+ args[4] +'" AND discord_number="'+ args[5] +'" ', function (error, results, fields) {
                if (error) throw error;

                if (results.length > 0) {

                con.query('SELECT * FROM champs WHERE eden_user_id='+ results[0].id +' AND name="'+ args[6] +'"', function (error, results, fields) {
                  if (error) throw error;

                  if (results.length > 0) {

                    con.query('SELECT * FROM classes WHERE champ_id='+ results[0].id +' and name="'+ args[6] +'"', function (error, results, fields) {
                      if (error) throw error;

                      //console.info(results[0]);
                      let a = parseInt(args[7]) + parseInt(results[0].renown);

                        con.query('UPDATE classes SET renown='+ a +' WHERE champ_id='+ results[0].champ_id +' AND name="'+ args[6] +'"', function (error, results, fields) {
                          if (error) throw error;
                          msg.reply("```Successfully added "+ args[7] +" to "+ args[4] +"#"+ args[5] +"'s wallet! \n\n Renown: "+ a +"```");
                        });

                      });

                  } else {

                    msg.reply("This character could not be found...");

                  }

                });

              } else {

                msg.reply("This Eden user could not be found...");

              }

              });

            break;
            case "subtract":
            con.query('SELECT id FROM eden_users WHERE discord_username="'+ args[4] +'" AND discord_number="'+ args[5] +'" ', function (error, results, fields) {
                if (error) throw error;

                if (results.length > 0) {

                con.query('SELECT * FROM champs WHERE eden_user_id='+ results[0].id +' AND name="'+ args[6] +'"', function (error, results, fields) {
                  if (error) throw error;

                  if (results.length > 0) {

                    con.query('SELECT * FROM classes WHERE champ_id='+ results[0].id +' and name="'+ args[6] +'"', function (error, results, fields) {
                      if (error) throw error;

                      console.info(results[0]);
                      let a = parseInt(results[0].renown) - parseInt(args[7]);

                        con.query('UPDATE classes SET renown='+ a +' WHERE champ_id='+ results[0].champ_id +' AND name="'+ args[6] +'"', function (error, results, fields) {
                          if (error) throw error;
                          msg.reply("```Successfully subtracted "+ args[7] +" to "+ args[4] +"#"+ args[5] +"'s wallet! \n\n Renown: "+ a +"```");
                        });

                      });

                  } else {

                    msg.reply("This character could not be found...");

                  }

                });

              } else {

                msg.reply("This Eden user could not be found...");

              }

              });
            break;
          }

        break;
        case "metapoints":

          switch(args[3]) {
            case "add":
              //msg.reply("add Metapoints");
              con.query('SELECT id FROM eden_users WHERE discord_username="'+ args[4] +'" AND discord_number="'+ args[5] +'" ', function (error, results, fields) {
                  if (error) throw error;
                  console.log(JSON.stringify(results));

                  con.query('SELECT * FROM wallets WHERE eden_user_id='+ results[0].id +'', function (error, results, fields) {
                      if (error) throw error;
                      let a = parseInt(args[6]) + parseInt(results[0].meta_points);
                      console.log(JSON.stringify(results));


                      con.query('UPDATE wallets SET meta_points='+ a +' WHERE eden_user_id='+ results[0].eden_user_id +'', function (error, results, fields) {
                          if (error) throw error;
                          msg.reply("```Successfully added "+args[6]+" to "+args[4]+"#"+args[5]+"'s wallet! \n\n Metapoints: "+a+"```");
                        });


                    });

                });
            break;
            case "subtract":
              //msg.reply("subtract Metapoints");
              con.query('SELECT id FROM eden_users WHERE discord_username="'+ args[4] +'" AND discord_number="'+ args[5] +'" ', function (error, results, fields) {
                  if (error) throw error;
                  console.log(JSON.stringify(results));

                  con.query('SELECT * FROM wallets WHERE eden_user_id='+ results[0].id +'', function (error, results, fields) {
                      if (error) throw error;
                      let a = parseInt(results[0].meta_points) - parseInt(args[6]);
                      console.log(JSON.stringify(results));


                      con.query('UPDATE wallets SET meta_points='+ a +' WHERE eden_user_id='+ results[0].eden_user_id +'', function (error, results, fields) {
                          if (error) throw error;
                          msg.reply("```Successfully subtracted "+args[6]+" to "+args[4]+"#"+args[5]+"'s wallet! \n\n Metapoints: "+a+"```");
                        });


                    });

                });
            break;
          }

        break;
        default:

          //msg.reply("show wallet");
          //console.log(JSON.stringify(user));
          con.query('SELECT * FROM wallets WHERE eden_user_id='+ user.id, function (error, results, fields) {
              if (error) throw error;
              //console.error(results);

              let a = "``` | Discord User ("+ user.discord_username +"#"+ user.discord_number +")\n | Meta Points ("+ results[0].meta_points +")\n |\n";

              con.query('SELECT * FROM champs WHERE eden_user_id='+ user.id, function (error, results, fields) {
                  if (error) throw error;

                  //console.log(results,results.length);

                  for(let i = 0; i <= results.length; i++) {
                    let b = results.length;
                      if (i !== results.length) {

                        con.query('SELECT * FROM classes WHERE champ_id='+ results[i].id, function (error, res, fields) {
                            if (error) throw error;

                            a += "\n | Name: "+ res[0].name +"";
                            a += "\n | Experience: "+ res[0].experience +"";
                            a += "\n | Coin: "+ res[0].coin +"";
                            a += "\n | Renown: "+ res[0].renown +"\n";

                            if(i == b - 1) {
                              a += "```"
                              msg.reply(a);
                            }

                            console.log(i);


                        });
                      }
                  }

                });

            });
      }
    break;
    case "createCharacter":

      //msg.reply("create character");
      //console.log(args[3],args[4]);
      con.query('SELECT id FROM eden_users WHERE discord_username="'+ args[2] +'" AND discord_number="'+ args[3] +'" ', function (error, results, fields) {
          if (error) throw error;
          //console.log(JSON.stringify(results));
          con.query('INSERT INTO champs (eden_user_id, name) VALUES ('+ results[0].id +',"'+ args[4] +'")', function (error, results, fields) {
              if (error) throw error;
              //console.info(results.insertId);

              con.query('INSERT INTO classes (champ_id,experience,renown,coin,name,level) VALUES ('+ results.insertId +',0,0,0,"'+ args[4] +'",1)', function (error, results, fields) {


                msg.reply("```Successfully initialized a character for "+args[2]+"#"+args[3]+"```");

              });

            });
        });

    break;
    case "deleteCharacter":

      msg.reply("delete character");
      con.query('SELECT id FROM eden_users WHERE discord_username="'+ args[2] +'" AND discord_number="'+ args[3] +'" ', function (error, results, fields) {
          if (error) throw error;
          //console.log(JSON.stringify(results));
          //con.query('INSERT INTO champs (eden_user_id, name) VALUES ('+ results[0].id +',"'+ args[4] +'")', function (error, results, fields) {
          try {
          con.query('DELETE FROM champs WHERE eden_user_id='+ results[0].id +' AND name="'+ args[4] +'"', function (error, results, fields) {
              if (error) throw error;
              msg.reply("```Successfully Deleted a character for "+args[2]+"#"+args[3]+"```");
            });
          } catch (e) {
            console.error(e);
          }
        });

    break;

  }

}

function list_all_char_stats(chars,msg) {

  let c = chars.length;
  let i = 0;
  let mes = "\n";

  chars.forEach(char => {

    i++;

     Object.keys(char).forEach(function(key,index) {

       if(typeof char[key] === 'object') {

         mes += key.toUpperCase() + "\n";

         Object.keys(char[key]).forEach(function(k,ind) {
           if (k !== "id" && k !== "champ_id") {
            mes += "    "+ k + ": " + char[key][k] + "\n";
           }

         });

       }

    });

   if(c == i) {
     //console.log(mes);
     msg.reply(mes);

   }

  });

}


bot.login(token);
