const { Client, Message } = require('discord.js');
const client = new Client();
require("dotenv").config();
const Octogone = require('./octogone');
const Fighter = require('./fighter');




let octogone_auto_id = 0;
const tabOctogone = [];
const tabFighter = [];

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.author.bot || msg.channel.id != "777819704249155584" || !msg.content.startsWith(process.env.PREFIX)) return; // condition de non ecoute
    let tabArgs = msg.content.split(" ");
    let command = tabArgs[0].replace(process.env.PREFIX, "");
    switch(command)
    {
        case "octogone":
            if(!fighterExist(msg.author.id)) {
                msg.reply("Ton avatar n'existe pas, casse toi et va le créer en tappant \"$register NOM\" !")
            }
            else
            {
                let idOctogone = octogone_auto_id++;
                msg.channel.send(`Attention,  ${getFighterById(msg.author.id).fighterName} entre dans l'OCTOGONE ! Qui voudra le défier ? Répondez à ce message par un emoji pour lui faire manger ses dents !!! `) //message arrivé fighter 1
                .then(message => {
                    let bufferFighter = [getFighterById(msg.author.id)];
                    filter = (reaction, user) => {
                        return fighterExist(user.id);
                    };

                    const collector = message.createReactionCollector(filter, {dispose: true})

                    collector.on('collect', (reaction, user) => {
                        // REACTION QUAND EMOJI        
                        // console.log(reaction.emoji.name + " a été ajouté");
                        // Si un emoji est posté en reaction :
                        let myFighter = getFighterById(user.id);
                        if(bufferFighter.includes(myFighter))
                        {
                            console.log(`Tu participe déjà à ce combat ! Stop spammer, tu va te faire ramasser !`);
                        }
                        else
                        {
                            bufferFighter.push(myFighter);
                            console.log(`Quoi ? ${myFighter.fighterName} participe maintenant au combat !`);
                            console.log(bufferFighter);
                        }

                        if(bufferFighter.length >= 2)
                        {
                            message.edit(`Les joueurs sont prêt ! Que le combat commence !`);
                            let octogone = new Octogone(idOctogone, bufferFighter[0], bufferFighter[1]);
                            startFight(msg.channel, octogone);
                            collector.stop("Les inscriptions sont terminé !");
                        }
                    });

                    collector.on('remove', (reaction, user) => {
                        console.log(`${reaction.emoji.name} à lachement fuit le champ de bataille.`)
                        
                    })

                    collector.on('end', (collected, reason) => {
                        console.log(reason);
                    })
                })
                .catch(error => console.log(error));
            }
            break;
            
        case "register":
            if(!tabFighter.find(fighter => fighter.fighterName == tabArgs[1])){
                console.log("Création d'un nouveau combattant");
                const newFighter = new Fighter(tabArgs[1], msg.author.id);
                tabFighter.push(newFighter);
                msg.channel.send(`Un nouveau combatant s'est préparé ! Bienvenue à ${newFighter.fighterName}.`);
                console.log(newFighter);
            }
            else{
                msg.channel.send("Ce nom est déjà pris, PLAGIAT !!!!");
            }
            break;

        case "score":
            let leaderboard = tabFighter.sort((a,b) => {
                if(a.victory < b.victory)
                    return 1;
                else if(a.victory > b.victory)
                    return -1;
                else
                    return 0;
            });
            let myLeaderboard = "";
            console.log(tabFighter)
            leaderboard.forEach(element => {
                myLeaderboard += `${element.fighterName} Victoires : ${element.victory}\n`;
            });
            msg.channel.send(myLeaderboard);
        
        break;

        case "test":
            let myFighter = getFighterById(msg.author.id);
            let cloneFighter = JSON.parse(JSON.stringify(myFighter));
            myFighter.fighterName = "Clone de Dupy";
            myFighter.PV += 10;
            console.log(cloneFighter)

        break;
    }
});

function fighterExist(idUser) {
    return tabFighter.find(fighter => fighter.idUser === idUser) !== undefined;
}
function getFighterById(idUser){
    let fighter = tabFighter.find(fighter => fighter.idUser == idUser)
    console.log(fighter);
    return fighter;
} 

function startFight(channel, octogone)
{
    channel.send(`Debut du combat ! A ma gauche ${octogone.fighter1.fighterName} et a ma droite ${octogone.fighter2.fighterName} et au centre ... ben personne !`)
    .then(message => {
        message.react('👊') 
        .then(message.react('🔥'))
        .then(message.react('🛡'))
        .catch(error => console.log(error));
        let filter = (reaction, user) => {
            return octogone.turn ? user.id == octogone.fighter1.idUser : user.id == octogone.fighter2.idUser && (reaction.emoji.name == '🔥' || reaction.emoji.name == '🛡' || reaction.emoji.name == '👊');
        }

        // creation des shallow clone
        let cloneFighter1 = JSON.parse(JSON.stringify(octogone.fighter1));
        let cloneFighter2 = JSON.parse(JSON.stringify(octogone.fighter2));

        let fightCollector = message.createReactionCollector(filter);
        
        fightCollector.on("collect", (reaction, user) => {
            
            let target = octogone.turn ? octogone.fighter2 : octogone.fighter1;
            let attacker = octogone.turn ? octogone.fighter1 : octogone.fighter2;
            let lastAction = "";
            //switch reaction
            
            switch(reaction.emoji.name){
                case '🔥' :
                    target.PV -= 3;
                    lastAction = `Hoo! ${attacker.fighterName} brûle les poils de cul de ${target.fighterName}, il subit 3 dégats.`;
                break;
                case '👊':
                    target.PV -= 2;
                    lastAction = `Ouch! ${attacker.fighterName} met une grosse mandale à ${target.fighterName}, il subit 2 dégats.`;
                break;
                case '🛡':
                    target.PV -= 1;
                    lastAction = `Aie! ${attacker.fighterName} fonce dans ${target.fighterName} avec son bouclier et lui inflige 1 dégat.`;
                break;
            }

            
            //Check condition de victoire
            if (octogone.fighter1.PV <= 0) {
                fightCollector.stop(`Oyé! Oyé! ${octogone.fighter2.fighterName} à gagné ! Il a bolossé ${octogone.fighter1.fighterName}.`);
                octogone.fighter2.victory ++;
            } else if (octogone.fighter2.PV <= 0) {
                fightCollector.stop(`Oyé! Oyé! ${octogone.fighter1.fighterName} à gagné ! Il a bolossé ${octogone.fighter2.fighterName}.`);
                octogone.fighter1.victory ++;
            }
            else {
                octogone.changeTurn();
                editFightMessage(message, octogone, lastAction);
            }
        });

        fightCollector.on("end", (collected, reason) => {
            channel.send(reason);
            //ICI
            editFightMessage(message, octogone, reason);
            resetFighter(octogone);
        });
    })
}

function editFightMessage(message, octogone, lastAction)
{
    let newMessage = "Combat en cours ...\n" +
        `${octogone.fighter1.fighterName} : ${octogone.fighter1.PV} / ${octogone.fighter1.PvMax} \n` +
        `${octogone.fighter2.fighterName} : ${octogone.fighter2.PV} / ${octogone.fighter2.PvMax} \n` +
    "Derniere action : " + lastAction;
    message.edit(newMessage);
} 

function resetFighter(octogone) {
    octogone.fighter1.PV = octogone.fighter1.PvMax;
    octogone.fighter2.PV = octogone.fighter2.PvMax;
}


        //msg.channel.send(Octogone.fighter1.fighterName + " entre dans l'OCTOGONE ! Qui voudra le défier ?") //message arrivé fighter 1
        //msg.channel.send("New Challenger " + Octogone.fighter2.fighterName + " entre dans l'OCTOGONE") //message arrivé fighter 2


//Ecouter une commande avec un prefix : 🆗
//Pouvoir commencer une arene
//Pouvoir s'inscrire a une arene
//commande de combat
//Finir un combat
//annoncer le vainqueur
//BONUS : Gerer une file d'attente

client.login(process.env.BOT_TOKEN);