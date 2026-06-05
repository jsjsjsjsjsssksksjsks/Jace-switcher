import 'dotenv/config';
import { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

const commands = [
new SlashCommandBuilder()
.setName('deal')
.setDescription('Open a middleman deal')
.addUserOption(o =>
o.setName('partner')
.setDescription('Trading partner')
.setRequired(true)
)
.addStringOption(o =>
o.setName('mode')
.setDescription('auto or real MM')
.setRequired(true)
.addChoices(
{ name: 'Auto MM', value: 'auto' },
{ name: 'Real MM', value: 'real' }
))
.addStringOption(o =>
o.setName('kind')
.setDescription('crypto or virtual')
.setRequired(true)
.addChoices(
{ name: 'Crypto', value: 'crypto' },
{ name: 'Virtual', value: 'virtual' }
))
.addStringOption(o =>
o.setName('amount')
.setDescription('Amount')
.setRequired(false))
.addStringOption(o =>
o.setName('currency')
.setDescription('BTC or LTC')
.setRequired(false))
.addStringOption(o =>
o.setName('item')
.setDescription('Item description')
.setRequired(false)),

new SlashCommandBuilder()
.setName('release')
.setDescription('Buyer releases funds'),

new SlashCommandBuilder()
.setName('cancel')
.setDescription('Cancel deal'),

new SlashCommandBuilder()
.setName('dispute')
.setDescription('Open dispute'),

new SlashCommandBuilder()
.setName('status')
.setDescription('Check deal status'),

new SlashCommandBuilder()
.setName('close')
.setDescription('Close ticket')
.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

const route = process.env.GUILD_ID
? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
: Routes.applicationCommands(process.env.CLIENT_ID);

await rest.put(route, { body: commands });

console.log('✅ Slash commands registered successfully');
