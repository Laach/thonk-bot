# thonk-bot
Discord bot for private MDH server in [Node.js](https://nodejs.org/) using the [Discord.js](https://discord.js.org/) package

## Available commands
- **!help** shows all commands
- **!ping** pings the bot, simply for checking if the bot is actually working
- **!group** shows all of our booked group rooms (currently alexander,casper,emil,nick,philip)
- **!group** {MDH ids} rooms booked by specific people, use one or more mdh ids as arguments separated by spaces
- **!grouplink** gives a website link instead of displaying the booked rooms in the server
- **!vanish** deletes your last 10 messages
- **!clear** deletes the last 50 messages in the current text channel (requires admin priviliges)

## Setup
The youtube guide [Make Your Own Discord Bot | Basics (2019)](https://www.youtube.com/watch?v=X_qg0Ut9nU8) by CodeLyon was used to get this bot up and running. All necessary setup steps are covered in the video

To actually connect to the bot you need an access token. The access token is currently hidden in an .env file. The [.env_sample](/.env_sample) file shows the syntax of the .env file. Replace YOUR_TOKEN_HERE with the actual token to the bot.

## Todo list 
- [x] Protect access token 
- [ ] Update how to use section with setup guide
- [ ] Decide whether or not the node.js modules should be included in the repo or ignored by .gitignore
- [ ] add more commands
- [ ] yes
