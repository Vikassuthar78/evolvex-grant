import asyncio
from backend.agents.discovery import DiscoveryAgent

async def test():
    agent = DiscoveryAgent()
    res = await agent.search()
    print(res)

asyncio.run(test())
