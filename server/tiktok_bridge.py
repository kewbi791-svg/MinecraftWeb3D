"""
Bridge TikTok Live -> WebSocket

Requisitos:
  pip install TikTokLive websockets

Uso:
  python tiktok_bridge.py

Depois no jogo coloque o username e clique em Conectar.
O jogo se conecta em ws://localhost:3002
"""

import asyncio
import json
from TikTokLive import TikTokLiveClient
from TikTokLive.events import FollowEvent, GiftEvent, ShareEvent, LikeEvent, CommentEvent
import websockets

# Lista de clientes WebSocket conectados no bridge
connected = set()

async def ws_handler(websocket):
    connected.add(websocket)
    try:
        async for message in websocket:
            data = json.loads(message)
            if data.get("type") == "subscribe":
                username = data.get("username")
                print(f"Iniciando listener para @{username}")
                asyncio.create_task(start_tiktok(username))
    finally:
        connected.discard(websocket)

async def broadcast(event_type, payload):
    msg = json.dumps({"type": event_type, **payload})
    dead = set()
    for ws in connected:
        try:
            await ws.send(msg)
        except:
            dead.add(ws)
    connected.difference_update(dead)

async def start_tiktok(username: str):
    client = TikTokLiveClient(unique_id=username)

    @client.on(FollowEvent)
    async def on_follow(event: FollowEvent):
        await broadcast("follow", {
            "uniqueId": event.user.unique_id,
            "nickname": event.user.nickname
        })

    @client.on(GiftEvent)
    async def on_gift(event: GiftEvent):
        await broadcast("gift", {
            "uniqueId": event.user.unique_id,
            "nickname": event.user.nickname,
            "giftName": event.gift.name if event.gift else "Presente",
            "repeatCount": event.repeat_count
        })

    @client.on(ShareEvent)
    async def on_share(event: ShareEvent):
        await broadcast("share", {
            "uniqueId": event.user.unique_id,
            "nickname": event.user.nickname
        })

    @client.on(LikeEvent)
    async def on_like(event: LikeEvent):
        await broadcast("like", {
            "uniqueId": event.user.unique_id,
            "nickname": event.user.nickname
        })

    await client.start()

async def main():
    print("TikTok Bridge rodando em ws://localhost:3002")
    async with websockets.serve(ws_handler, "localhost", 3002):
        await asyncio.Future()  # roda para sempre

if __name__ == "__main__":
    asyncio.run(main())
