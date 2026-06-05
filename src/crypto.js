import fetch from 'node-fetch';

/* ---------------- BTC ---------------- */

export async function getBtcAddressTxs(address) {
const r = await fetch(`https://blockstream.info/api/address/${address}/txs`);

if (!r.ok) throw new Error(`BTC API ${r.status}`);

return r.json();
}

export async function getBtcTipHeight() {
const r = await fetch('https://blockstream.info/api/blocks/tip/height');

if (!r.ok) throw new Error(`BTC tip ${r.status}`);

return parseInt(await r.text(), 10);
}

/* ---------------- LTC ---------------- */

export async function getLtcAddress(address) {
const r = await fetch(
`https://api.blockcypher.com/v1/ltc/main/addrs/${address}/full?limit=10`
);

if (!r.ok) throw new Error(`LTC API ${r.status}`);

return r.json();
}

/* ---------------- BTC PAYMENT CHECK ---------------- */

export async function findBtcPayment(address, minAmountBtc) {
const [txs, tip] = await Promise.all([
getBtcAddressTxs(address),
getBtcTipHeight()
]);

for (const tx of txs) {
const paid = tx.vout
.filter(v => v.scriptpubkey_address === address)
.reduce((s, v) => s + v.value, 0) / 1e8;

if (paid + 1e-9 >= minAmountBtc) {
const confirmations = tx.status.confirmed
? tip - tx.status.block_height + 1
: 0;

return {
txid: tx.txid,
amountBtc: paid,
confirmations
};
}
}

return null;
}

/* ---------------- LTC PAYMENT CHECK ---------------- */

export async function findLtcPayment(address, minAmountLtc) {
const data = await getLtcAddress(address);

for (const tx of (data.txs || [])) {
const paid = (tx.outputs || [])
.filter(o => (o.addresses || []).includes(address))
.reduce((s, o) => s + o.value, 0) / 1e8;

if (paid + 1e-9 >= minAmountLtc) {
return {
txid: tx.hash,
amountLtc: paid,
confirmations: tx.confirmations || 0
};
}
}

return null;
}
