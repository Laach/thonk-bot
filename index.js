const Discord = require('discord.js');
const bot = new Discord.Client();
const PREFIX = '!';
var url = '';
require('dotenv').config();
const token = process.env.ACCESS_TOKEN;

const axios = require('axios');
const cheerio = require('cheerio');

bot.on('ready', ()=>{
    console.log('Bot is online');
    bot.user.setActivity('!help for commands', { type: 'CUSTOM_STATUS'});
});

bot.on('message', message=>{
    /*if(message.content === 'thonk'){
        const emoji = message.guild.emojis.find(emoji => emoji.name === 'thonk');
        console.log(emoji.toString());
        message.react(emoji);
    }*/
    if(!message.content.startsWith(PREFIX) || message.author.bot) return;

    const args = message.content.slice(PREFIX.length).split(/ +/);
    const command = args.shift().toLowerCase();
    
    switch(command){
        case 'ping':
            message.channel.send('dong!');
            break;
        case 'group':
            url = '';
            if(!args.length){
                url = 'https://webbschema.mdh.se/setup/jsp/SchemaXML.jsp?startDatum=idag&intervallTyp=m&intervallAntal=6&resurser=s.aan18028%2Cs.can18010%2Cs.eem18005%2Cs.ngs18001%2Cpkn18004';

            }else{
                url = 'https://webbschema.mdh.se/setup/jsp/SchemaXML.jsp?startDatum=idag&intervallTyp=m&intervallAntal=6&resurser=';
                for(let i = 0; i<args.length; i++){
                    url=url.concat('s.',args[i], '%2C');
                }
            }

            axios(url)
                .then(response => { 
                    //fetch the entire webbpage
                    const html = response.data;
                    //load the content into cheerio for manipulation
                    const $ = cheerio.load(html, {
                        xmlMode: true
                    });
                    //find all schema entries, every entry is inside a 'schemaPost' tag
                    const schemaTable = $('schemaPost');
                    console.log('Number of schema entries found: '+schemaTable.length);

                    const bookedRooms = [];
                    
                    //extract all relevant attributes for every schema entry
                    schemaTable.each(function () {
                        const day = $(this).find('bokatDatum').attr('dagNamn');
                        const date = $(this).find('bokatDatum').attr('datum');
                        const timeStart = $(this).find('bokatDatum').attr('startTid');
                        const timeEnd = $(this).find('bokatDatum').attr('slutTid');
                        const time = timeStart + '-' + timeEnd;
                        const bookedBy = $(this).find('skapadAv').text();
                        //when fetching 'resursIdURLEncoded' you get both the room number
                        //and the userID because they share tag name,
                        //slice(0,6) to extract the wanted substring
                        const room = $(this).find('resursIdURLEncoded').text().slice(0,6);
                        //const comment = $(this).find('moment').text();

                        //insert as an object into the bookedRoomsArray
                        bookedRooms.push({
                            day,
                            date,
                            time,
                            //bookedBy,
                            room,
                        });
                    });
                    console.log(bookedRooms);
                    
                    let description = "```cs\n";
                    let currentDay = 'Mån';
                    
                    bookedRooms.forEach(element =>{
                        let dateYear =  element.date.slice(0,2);
                        let dateMonth = element.date.slice(2,4);
                        let dateDay = element.date.slice(4,6);
                        if(currentDay === element.day){
                            description = description.concat(element.day,'   ',dateYear,'-',dateMonth,'-',
                                dateDay,'   ',element.time,'  #',element.room, ' \n');
                        }else{
                            currentDay = element.day;
                            description = description.concat('\n');
                            description = description.concat(element.day,'   ',dateYear,'-',dateMonth,'-',
                                dateDay,'   ',element.time,'  #',element.room, ' \n');
                        }
                    })
                    description = description.concat('```');

                    const embed = new Discord.MessageEmbed()
                    .setTitle('     day        date                time                     room')
                    .setDescription(description);

                    message.channel.send('**BOOKED GROUPROOMS:** \n',embed);
                })
                .catch(console.error);
            break;
        case 'grouplink':
            message.channel.send('https://webbschema.mdh.se/setup/jsp/Schema.jsp?startDatum=idag&intervallTyp=m&intervallAntal=6&resurser=s.aan18028%2Cs.can18010%2Cs.eem18005%2Cs.ngs18001%2Cpkn18004');
            break;
        case 'vanish':
            message.channel.messages.fetch( {limit: 20} )
            .then(messages => {
                const userMessages = messages.filter(msg => msg.author.equals(message.author));
                message.channel.bulkDelete(userMessages);
            })

            break;
        case 'clear':
            if(message.member.hasPermission("ADMINISTRATOR")){
                message.channel.bulkDelete(50);
            }else{
                message.reply('You are not an admin!');
            }
           
            break;
        case 'schedule':
            if(!args.length){
                //no arguments, send a standard schedule link
                url = 'https://webbschema.mdh.se/setup/jsp/Schema.jsp?startDatum=idag&intervallTyp=m&intervallAntal=6&resurser=k.DVA229-14015V20-%2Ck.DVA315-14042V20-%2C';
                message.channel.send(url);
            }else{
                //1 or more arguments, prepare the url course concatenation
                url = 'https://webbschema.mdh.se/setup/jsp/Schema.jsp?startDatum=idag&intervallTyp=m&intervallAntal=6&resurser=';

                //Had to move everything into a weird async function so that the url gets updated
                //before it needs to be used. Pretty ugly but it works.
                async function getData(){
                    //for each argument, try to get all course variations that match the argument
                    for(let i = 0; i < args.length; i++){
                        await axios.get(`https://webbschema.mdh.se/ajax/ajax_autocompleteResurser.jsp?typ=kurs&term=${args[i]}`)
                        .then(response => {
                            console.log('Number of courses found: '+response.data);
                            console.log(response.data.length);
                            
                            if(response.data.length >= 8){
                                message.channel.send(`${args[i]} yielded too many results! Try being more specific.`);
                            }else if(response.data.length <= 0){
                                message.channel.send(`${args[i]} yielded no results! Try another search term.`);
                            }else{
                                response.data.forEach(element => {
                                    url=url.concat('k.',element.value,'%2C');
                                });
                            }
                        })
                        .catch(error => {
                            console.log(error);
                        });
                    }
                    //if any of the arguments yielded results, return the new link
                    if(url != 'https://webbschema.mdh.se/setup/jsp/Schema.jsp?startDatum=idag&intervallTyp=m&intervallAntal=6&resurser='){
                        message.channel.send(url);
                    }                    
                }  
                
                //actually run the function
                getData();  
                
            }
            
            break;
        case 'help':
            const newEmbed = new Discord.MessageEmbed()
            .setTitle('Available commands')
            .addField('!help', 'Shows this message')
            .addField('!ping', 'Pings the bot')
            .addField('!group / !group {mdh IDs}', 'All of our booked group rooms / Booked by specific people, use one or more mdh ids as arguments separated by spaces')
            .addField('!grouplink', 'Gives a link instead of displaying the booked rooms')
            .addField('!vanish', 'Deletes your last 20 messages in the channel. poof!')
            .addField('!clear', 'Deletes the last 50 messages in the channel (admin only)')
            .addField('!schedule / !schedule {course names}','Schedule for the two current standard courses / Schedule for specific courses with course names as arguments')
            .setColor(0xa80051)
            .setThumbnail(bot.user.avatarURL())
            .setFooter('Created by me :)', bot.user.avatarURL())
            .setTimestamp();
            message.channel.send(newEmbed);
            break;        
    }
   
})

bot.login(token);