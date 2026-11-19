# 测试共用：本地起一个静态服务器后再跑，例如
#   python3 -m http.server 8768
#   python3 tests/t9.py
import os
URL=os.environ.get('SITE_URL','http://127.0.0.1:8768/index.html')
async def setup(pg):
    """字体直接走 Google Fonts；离线环境可以在这里用 pg.route 换成本地字体。"""
    return None
