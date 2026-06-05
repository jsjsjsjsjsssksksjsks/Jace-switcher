import 'dotenv/config';
import { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

const commands = [
new SlashCommandBuilder()
.setName('deal')
.setDescription('Open a new middleman deal ticket')
.addUserOption(o =>
  o.setName('partner')
  .setDescription('The other trader')
  .setRequired(true)
)
.addStringOption(o =>
  o.setName('mode')
  .setDescription('Auto or Real MM')
  .setRequired(true)
  .addChoices(
    { name: 'Auto MM (crypto, automated)', value: 'auto' },
    { name: 'Real MM (human middleman)', value: 'real' }
  )
)
.addStringOption(o =>
  o.setName('kind')
  .setDescription('What is being traded')
  .setRequired(true)
  .addChoices(
    { name: 'Crypto', value: 'crypto' },
    { name: 'Virtual goods / items', value: 'virtual' }
  )
)
.addStringOption(o =>
  o.setName('amount')
  .setDescription('Amount (e.g. 0.005)')
  .setRequired(false)
)
.addStringOption(o =>
  o.setName('currency')
  .setDescription('BTC or LTC')
  .setRequired(false)
)
.addStringOption(o =>
  o.setName('item')
  .setDescription('Item description')
  .setRequired(false)
),

new SlashCommandBuilder()
.setName('release')
.setDescription('Buyer releases the deal'),

new SlashCommandBuilder()
.setName('cancel')
.setDescription('Cancel the deal'),

new SlashCommandBuilder()
.setName('dispute')
.setDescription('Open a dispute'),

new SlashCommandBuilder()
.setName('status')
.setDescription('Check deal status'),

new SlashCommandBuilder()
.setName('close')
.setDescription('Close deal (staff only)')
.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)

].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

const route = process.env.GUILD_ID
  ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
  : Routes.applicationCommands(process.env.CLIENT_ID);

await rest.put(route, { body: commands });

console.log(`Registered ${commands.length} commands`);
