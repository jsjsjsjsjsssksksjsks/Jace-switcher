import 'dotenv/config';
import {
Client,
GatewayIntentBits,
Partials,
ChannelType,
PermissionFlagsBits,
EmbedBuilder
} from 'discord.js';

import {
insertDeal,
getDealByChannel,
updateDealStatus,
updateDeposit,
listOpenCryptoDeals,
addConfirmation,
countConfirmations,
clearConfirmations
} from './db.js';

import {
findBtcPayment,
findLtcPayment
} from './crypto.js';

const {
DISCORD_TOKEN,
MM_STAFF_ROLE_ID,
TICKETS_CATEGORY_ID,
LOG_CHANNEL_ID,
BTC_ADDRESS,
LTC_ADDRESS,
BTC_MIN_CONF = '2',
LTC_MIN_CONF = '4'
} = process.env;

const PREFIX = '!';

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent
],
partials: [Partials.Channel]
});

const log = async (guild, content) => {
if (!LOG_CHANNEL_ID) return;
const ch = await guild.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
if (ch) ch.send(content).catch(() => {});
};

client.once('ready', () => {
console.log(`Jace online as ${client.user.tag}`);
if (BTC_ADDRESS || LTC_ADDRESS) {
setInterval(pollCryptoDeposits, 60_000);
}
});

// ---------------- PREFIX COMMANDS ----------------

client.on('messageCreate', async (message) => {
if (message.author.bot) return;
if (!message.content.startsWith(PREFIX)) return;

const args = message.content.slice(PREFIX.length).trim().split(/ +/);
const cmd = args.shift()?.toLowerCase();

try {

if (cmd === 'ping') {
return message.reply('Pong!');
}

// !deal (basic version)
if (cmd === 'deal') {
return message.reply('Use /deal (slash command) for full setup.');
}

// !release
if (cmd === 'release') {
return message.reply('Use /release in the deal channel.');
}

// !cancel
if (cmd === 'cancel') {
return message.reply('Use /cancel in the deal channel.');
}

// !dispute
if (cmd === 'dispute') {
return message.reply('Use /dispute in the deal channel.');
}

// !status
if (cmd === 'status') {
return message.reply('Use /status in the deal channel.');
}

// !close
if (cmd === 'close') {
return message.reply('Use /close (staff only) in the channel.');
}

} catch (e) {
console.error(e);
message.reply(`Error: ${e.message}`);
}
});

// ---------------- SLASH COMMANDS ----------------

client.on('interactionCreate', async (i) => {
if (!i.isChatInputCommand()) return;

try {
if (i.commandName === 'deal') return openDeal(i);
if (i.commandName === 'release') return confirmRelease(i);
if (i.commandName === 'cancel') return confirmCancel(i);
if (i.commandName === 'dispute') return openDispute(i);
if (i.commandName === 'status') return showStatus(i);
if (i.commandName === 'close') return closeTicket(i);
} catch (e) {
console.error(e);
if (i.deferred || i.replied) {
return i.followUp({ content: `Error: ${e.message}`, ephemeral: true });
}
return i.reply({ content: `Error: ${e.message}`, ephemeral: true });
}
});

// ---------------- DEAL LOGIC ----------------

async function openDeal(i) {
const partner = i.options.getUser('partner', true);
const mode = i.options.getString('mode', true);
const kind = i.options.getString('kind', true);
const amount = i.options.getString('amount');
const currency = (i.options.getString('currency') || '').toUpperCase();
const item = i.options.getString('item');

if (partner.id === i.user.id) {
return i.reply({ content: 'You cannot trade with yourself.', ephemeral: true });
}

if (mode === 'auto' && kind === 'crypto') {
if (!amount || !currency || !['BTC','LTC'].includes(currency)) {
return i.reply({ content: 'Auto MM requires amount + BTC/LTC.', ephemeral: true });
}
if (currency === 'BTC' && !BTC_ADDRESS) {
return i.reply({ content: 'BTC address not set.', ephemeral: true });
}
if (currency === 'LTC' && !LTC_ADDRESS) {
return i.reply({ content: 'LTC address not set.', ephemeral: true });
}
}

await i.deferReply({ ephemeral: true });

const buyer = i.user;
const seller = partner;

const perms = [
{ id: i.guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
{ id: buyer.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
{ id: seller.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
{ id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels] }
];

if (MM_STAFF_ROLE_ID) {
perms.push({
id: MM_STAFF_ROLE_ID,
allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
});
}

const channel = await i.guild.channels.create({
name: `deal-${buyer.username}-${seller.username}`.toLowerCase().slice(0, 90),
type: ChannelType.GuildText,
parent: TICKETS_CATEGORY_ID || undefined,
permissionOverwrites: perms
});

const depositAddress =
mode === 'auto' && kind === 'crypto'
? (currency === 'BTC' ? BTC_ADDRESS : LTC_ADDRESS)
: null;

insertDeal.run({
channel_id: channel.id,
guild_id: i.guild.id,
mode,
kind,
buyer_id: buyer.id,
seller_id: seller.id,
amount,
currency,
item,
deposit_address: depositAddress,
now: Date.now()
});

const embed = new EmbedBuilder()
.setTitle(`Deal - ${mode.toUpperCase()}`)
.setColor(mode === 'auto' ? 0x22c55e : 0x3b82f6)
.setDescription(`Buyer: <@${buyer.id}>\nSeller: <@${seller.id}>`);

await channel.send({
content: `<@${buyer.id}> <@${seller.id}>`,
embeds: [embed]
});

await i.editReply({ content: `Created: ${channel}` });
}

// ---------------- HELPERS ----------------

async function getDealOrFail(i) {
const deal = getDealByChannel.get(i.channelId);
if (!deal) {
await i.reply({ content: 'Not a deal channel.', ephemeral: true });
return null;
}
return deal;
}

async function confirmRelease(i) {
const deal = await getDealOrFail(i);
if (!deal) return;

if (i.user.id !== deal.buyer_id) {
return i.reply({ content: 'Only buyer can release.', ephemeral: true });
}

if (deal.status === 'released') {
return i.reply({ content: 'Already released.', ephemeral: true });
}

if (deal.mode === 'auto' && deal.kind === 'crypto' && deal.status !== 'funded') {
return i.reply({ content: 'Payment not confirmed yet.', ephemeral: true });
}

updateDealStatus.run('released', Date.now(), deal.id);
clearConfirmations.run(deal.id);

await i.reply('Deal released.');
}

async function confirmCancel(i) {
const deal = await getDealOrFail(i);
if (!deal) return;

if (![deal.buyer_id, deal.seller_id].includes(i.user.id)) {
return i.reply({ content: 'Not allowed.', ephemeral: true });
}

addConfirmation.run(deal.id, i.user.id, 'cancel');
const { n } = countConfirmations.get(deal.id, 'cancel');

if (n >= 2) {
updateDealStatus.run('cancelled', Date.now(), deal.id);
clearConfirmations.run(deal.id);
await i.reply('Cancelled.');
} else {
await i.reply('Waiting for other party.');
}
}

async function openDispute(i) {
const deal = await getDealOrFail(i);
if (!deal) return;

updateDealStatus.run('disputed', Date.now(), deal.id);

await i.reply('Dispute opened.');
}

async function showStatus(i) {
const deal = await getDealOrFail(i);
if (!deal) return;

await i.reply({
ephemeral: true,
content: `Status: ${deal.status}`
});
}

async function closeTicket(i) {
const deal = await getDealOrFail(i);
if (!deal) return;

if (!i.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
return i.reply({ content: 'No permission.', ephemeral: true });
}

await i.reply('Closing...');
setTimeout(() => i.channel.delete().catch(() => {}), 3000);
}

// ---------------- CRYPTO ----------------

async function pollCryptoDeposits() {
const deals = listOpenCryptoDeals.all().filter(d => d.mode === 'auto');

for (const deal of deals) {
try {
const min = parseFloat(deal.amount);
if (!min) continue;

let payment = null;

if (deal.currency === 'BTC') {
payment = await findBtcPayment(deal.deposit_address, min);
} else if (deal.currency === 'LTC') {
payment = await findLtcPayment(deal.deposit_address, min);
}

if (!payment) continue;

const needed =
deal.currency === 'BTC'
? parseInt(BTC_MIN_CONF)
: parseInt(LTC_MIN_CONF);

const newStatus =
payment.confirmations >= needed ? 'funded' : 'open';

if (
payment.txid !== deal.deposit_txid ||
payment.confirmations !== deal.deposit_confs ||
newStatus !== deal.status
) {
updateDeposit.run(
payment.txid,
payment.confirmations,
newStatus,
Date.now(),
deal.id
);

const channel = await client.channels.fetch(deal.channel_id).catch(() => null);
if (!channel) continue;

if (newStatus === 'funded' && deal.status !== 'funded') {
channel.send(`💰 Funded: ${payment.txid}`);
}
}
} catch (e) {
console.error('poll error', e);
}
}
}

client.login(DISCORD_TOKEN);
