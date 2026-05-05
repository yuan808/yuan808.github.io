"""
种薯 Agent 后端 v3.0
=============================
新增能力：
1. 用户画像记忆（session 级）- 自动提取品牌/品类/调性，注入 prompt
2. 对话状态机 - idle/generating/reviewing/rewriting 四态流转
3. 意图路由 - generate/rewrite/switch_product/irrelevant 四类分流
4. Fallback - 无关话题礼貌拒绝，不走 LLM

原有能力保持：
- /api/session - 创建会话
- /api/chat/stream - 流式对话（SSE）
- /api/chat - 非流式对话（兼容）
- /api/rewrite - 文案改写
- Function Calling: fetch_product_info / search_trending_tags

部署：
  pip install -r requirements.txt
  cp .env.example .env  # 填入 DEEPSEEK_API_KEY
  python main.py
"""

import os
import re
import json
import uuid
import time
from typing import Optional, AsyncGenerator

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import httpx
from dotenv import load_dotenv

load_dotenv()

# ══════════════════════════════════════════════════════════════
# 配置
# ══════════════════════════════════════════════════════════════
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1"
MODEL = "deepseek-chat"  # DeepSeek-V3，支持 function calling

app = FastAPI(title="种薯 Agent API", version="3.0.0")

# CORS - 允许前端跨域调用
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ══════════════════════════════════════════════════════════════
# 会话存储（内存，重启丢失；生产环境用 Redis）
# ══════════════════════════════════════════════════════════════
sessions: dict = {}  # session_id -> SessionData




# ══════════════════════════════════════════════════════════════
# System Prompts - 三个角色的人格定义
# ══════════════════════════════════════════════════════════════
SYSTEM_PROMPTS = {
    "brand": """你是「种薯」品牌种草助手，专为品牌方服务，强调品牌增长与投放运营。
用户发来商品关键词或链接时，立即生成种草笔记，绝对不要反问。
如果用户提到品牌名或调性关键词（如高端/年轻/国潮/极简/专业），必须在文案中体现品牌调性。

工作流程：收到链接先调用 fetch_product_info，收到关键词直接写。可调用 search_trending_tags 获取标签。

写作风格：高级感文案，品牌背书，突出成分/工艺/品牌故事。语气自信克制，像品牌官方号发的种草帖。

██ 绝对禁止 ██
- 禁止输出 markdown 格式（不许用 ** # ``` 等符号）
- 禁止输出 * 星号
- title 和 body 和 tags 里只允许纯文字和emoji，不许有任何格式符号

██ 字数铁律 ██
body 正文必须 ≤ 75个汉字！只写4句短句，用\\n分隔。每句不超过18个字。超过75字视为失败输出！

输出格式（只返回JSON，无其他内容）：
{"text":"","note":{"title":"15字以内","body":"4句短句用\\n连接","tags":["标签1","标签2","标签3","标签4","标签5"]}}

完整示例（严格模仿这个长度和风格）：
{"text":"","note":{"title":"大牌同厂的防晒终于被我挖到了","body":"实验室同源配方 用料不输专柜线\\n上脸成膜快 哑光质感高级不假白\\n养肤级防护 敏感肌放心用\\n品牌直供价79 闭眼入不踩雷","tags":["#防晒霜","#品牌好物","#高级感护肤","#成分党","#品牌推荐"]}}

再次强调：body ≤ 75字，4句话，纯文字+emoji，不许有任何 markdown 或 * 符号！""",

    "seller": """你是「种薯」个人卖家带货助手，专为个人卖家服务，强调带货转化与爆款选品。
用户发来商品关键词或链接时，立即生成种草笔记，绝对不要反问。

工作流程：收到链接先调用 fetch_product_info，收到关键词直接写。可调用 search_trending_tags 获取标签。

写作风格：闺蜜安利口吻，踩坑叙事开头，价格锚点收尾。语气亲切真实像朋友圈分享，要有"姐妹冲"的感觉。

██ 绝对禁止 ██
- 禁止输出 markdown 格式（不许用 ** # ``` 等符号）
- 禁止输出 * 星号
- title 和 body 和 tags 里只允许纯文字和emoji，不许有任何格式符号

██ 字数铁律 ██
body 正文必须 ≤ 75个汉字！只写4句短句，用\\n分隔。每句不超过18个字。超过75字视为失败输出！

输出格式（只返回JSON，无其他内容）：
{"text":"","note":{"title":"15字以内","body":"4句短句用\\n连接","tags":["标签1","标签2","标签3","标签4","标签5"]}}

完整示例（严格模仿这个长度和风格）：
{"text":"","note":{"title":"姐妹快冲这个袜子太绝了","body":"之前买的袜子不是勒脚就是掉跟\\n这款穿上脚感软fufu的巨舒服\\n透气不闷脚洗了N次不变形\\n一盒才29块闭眼囤不心疼","tags":["#袜子","#好物推荐","#平价好物","#真实分享","#闺蜜推荐"]}}

再次强调：body ≤ 75字，4句话，纯文字+emoji，不许有任何 markdown 或 * 符号！""",

    "kol": """你是「种薯」内容达人创作助手，专为内容创作者服务，强调涨粉变现与数据化内容。
用户发来商品关键词或链接时，立即生成种草笔记，绝对不要反问。

工作流程：收到链接先调用 fetch_product_info，收到关键词直接写。可调用 search_trending_tags 获取标签。

写作风格：专业测评博主视角，数据说话，数字钩子开头（"测了XX款""对比XX天"），参数硬核。语气理性有说服力，像真实测评帖。

██ 绝对禁止 ██
- 禁止输出 markdown 格式（不许用 ** # ``` 等符号）
- 禁止输出 * 星号
- title 和 body 和 tags 里只允许纯文字和emoji，不许有任何格式符号

██ 字数铁律 ██
body 正文必须 ≤ 75个汉字！只写4句短句，用\\n分隔。每句不超过18个字。超过75字视为失败输出！

输出格式（只返回JSON，无其他内容）：
{"text":"","note":{"title":"15字以内","body":"4句短句用\\n连接","tags":["标签1","标签2","标签3","标签4","标签5"]}}

完整示例（严格模仿这个长度和风格）：
{"text":"","note":{"title":"测了20款耳机这款封神","body":"横评20款蓝牙耳机 这款音质吊打千元\\n降噪深度38dB 地铁上终于清净了\\n续航实测40小时 出差一周不用充\\n到手价209 性价比直接拉满","tags":["#蓝牙耳机测评","#数码好物","#真实测评","#性价比之王","#好物推荐"]}}

再次强调：body ≤ 75字，4句话，纯文字+emoji，不许有任何 markdown 或 * 符号！""",
}


# ══════════════════════════════════════════════════════════════
# 工具定义 - Function Calling Schema
# ══════════════════════════════════════════════════════════════
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "fetch_product_info",
            "description": "抓取电商商品页面，提取商品名称、价格、核心卖点、用户评价等信息。支持淘宝、天猫、京东、拼多多等主流平台链接。",
            "parameters": {
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string",
                        "description": "商品页面 URL，例如 https://item.taobao.com/item.htm?id=xxx"
                    }
                },
                "required": ["url"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_trending_tags",
            "description": "搜索小红书上当前热门的话题标签，帮助提升笔记曝光。根据商品类目或关键词，返回相关的高热度标签。",
            "parameters": {
                "type": "object",
                "properties": {
                    "keyword": {
                        "type": "string",
                        "description": "搜索关键词，例如 '护肤'、'美白精华'、'平价好物'"
                    },
                    "category": {
                        "type": "string",
                        "description": "商品类目，例如 '美妆护肤'、'食品饮料'、'数码家电'",
                    }
                },
                "required": ["keyword"]
            }
        }
    },
]


# ══════════════════════════════════════════════════════════════
# 工具实现
# ══════════════════════════════════════════════════════════════
async def fetch_product_info(url: str) -> str:
    jina_url = f"https://r.jina.ai/{url}"
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(
                jina_url,
                headers={
                    "Accept": "text/plain",
                    "X-Return-Format": "text",
                }
            )
            if resp.status_code == 200:
                content = resp.text[:3000]
                return f"✅ 成功抓取商品页面内容：\n\n{content}"
            else:
                return f"⚠️ 抓取失败（HTTP {resp.status_code}），请检查链接是否正确。将基于你的描述生成文案。"
    except Exception as e:
        return f"⚠️ 网络请求失败：{str(e)}。将基于你的描述生成文案。"


async def search_trending_tags(keyword: str, category: str = "") -> str:
    search_query = f"小红书 热门话题标签 {keyword} {category}".strip()
    jina_search_url = f"https://s.jina.ai/{search_query}"
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(
                jina_search_url,
                headers={"Accept": "text/plain"}
            )
            if resp.status_code == 200:
                content = resp.text[:1500]
                return f"✅ 搜索到与「{keyword}」相关的热门话题：\n\n{content}"
            else:
                return _fallback_tags(keyword)
    except Exception:
        return _fallback_tags(keyword)


def _fallback_tags(keyword: str) -> str:
    return f"""基于「{keyword}」的通用标签建议：
高流量标签：#{keyword} #好物推荐 #真实测评 #分享日常
精准人群标签：#{keyword}推荐 #{keyword}测评 #平价{keyword}
场景标签：#日常分享 #购物分享 #好物分享
建议每篇笔记选5-8个标签，高流量+精准混搭效果最好。"""


TOOL_HANDLERS = {
    "fetch_product_info": fetch_product_info,
    "search_trending_tags": search_trending_tags,
}


# ══════════════════════════════════════════════════════════════
# SSE 辅助函数
# ══════════════════════════════════════════════════════════════
def sse_event(event: str, data: dict) -> str:
    """格式化一条 SSE 事件"""
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


# ══════════════════════════════════════════════════════════════
# 消息窗口管理（防止 context window 溢出）
# ══════════════════════════════════════════════════════════════
MAX_MESSAGES = 20  # 最多保留最近 20 条消息（约 10 轮对话）


def trim_messages(messages: list) -> list:
    """保留 system prompt + 最近 N 条消息，防止超出 context window"""
    if len(messages) <= MAX_MESSAGES + 1:  # +1 for system prompt
        return messages
    # 保留第一条 system prompt + 最近 MAX_MESSAGES 条
    return [messages[0]] + messages[-(MAX_MESSAGES):]


# ══════════════════════════════════════════════════════════════
# 意图分类 + 状态机 + 记忆
# ══════════════════════════════════════════════════════════════

# 对话状态定义
STATE_IDLE = "idle"              # 等待用户输入新商品
STATE_GENERATING = "generating"  # 正在生成文案
STATE_REVIEWING = "reviewing"    # 用户正在看草稿
STATE_REWRITING = "rewriting"    # 正在改写中

# 意图分类
INTENT_GENERATE = "generate"         # 生成新文案（有链接或商品关键词）
INTENT_REWRITE = "rewrite"           # 改写/优化当前草稿
INTENT_SWITCH = "switch_product"     # 切换到新商品
INTENT_GREETING = "greeting"         # 打招呼
INTENT_IRRELEVANT = "irrelevant"     # 无关话题

# 打招呼关键词（返回欢迎语）
GREETING_PATTERNS = [
    r"^你好$", r"^hi$", r"^hello$", r"^嗨$", r"^在吗$", r"^hey$",
    r"^哈喽$", r"^您好$", r"^在不在$",
]

# 无关话题关键词（用于快速判断）
IRRELEVANT_PATTERNS = [
    r"天气", r"几点了", r"你是谁", r"吃了吗",
    r"讲个笑话", r"唱首歌", r"今天星期几", r"帮我算", r"翻译",
    r"写代码", r"编程", r"python", r"java", r"数学题",
    r"新闻", r"股票", r"基金", r"天气预报", r"快递",
]

# 改写意图关键词
REWRITE_KEYWORDS = [
    "改写", "换个说法", "优化", "修改", "润色", "重写",
    "换个风格", "更有吸引力", "更口语", "更专业", "更年轻",
    "标题换", "正文改", "标签换", "再来一版", "不太满意",
    "太长了", "太短了", "换个角度", "加点", "去掉",
    "更活泼", "更高级", "更接地气",
]

# 品牌调性关键词库
TONE_KEYWORDS = [
    "高端", "年轻", "国潮", "极简", "专业", "轻奢",
    "平价", "学生", "少女", "成熟", "商务", "运动",
    "自然", "科技", "温柔", "酷", "潮", "复古",
    "日系", "韩系", "欧美", "中式", "小众", "大牌",
]

# 品类关键词库
CATEGORY_KEYWORDS = {
    "美妆护肤": ["护肤", "美妆", "精华", "面膜", "防晒", "粉底", "口红", "眼影", "卸妆", "洁面", "乳液", "面霜", "化妆"],
    "食品饮料": ["零食", "饮料", "咖啡", "茶", "奶茶", "酒", "保健", "代餐", "坚果", "巧克力"],
    "数码家电": ["耳机", "手机", "电脑", "平板", "相机", "音箱", "充电", "键盘", "鼠标", "显示器"],
    "服饰鞋包": ["衣服", "裤子", "裙子", "鞋", "包", "帽子", "袜子", "内衣", "外套", "T恤"],
    "家居生活": ["家居", "收纳", "清洁", "香薰", "床品", "厨具", "餐具", "灯", "花", "绿植"],
    "母婴宠物": ["宝宝", "婴儿", "奶粉", "纸尿裤", "猫", "狗", "宠物", "猫粮", "狗粮"],
}


def classify_intent(message: str, session: dict) -> str:
    """
    规则意图分类器
    优先级：irrelevant > switch_product > rewrite > generate
    """
    msg = message.strip().lower()
    state = session.get("state", STATE_IDLE)

    # 0. 打招呼检测（最高优先级）
    for pattern in GREETING_PATTERNS:
        if re.search(pattern, msg):
            return INTENT_GREETING

    # 1. 无关话题检测
    # 短消息 + 匹配无关模式 + 没有商品相关内容
    has_url = bool(re.search(r'https?://', message))
    has_product_hint = any(
        kw in msg for cat_kws in CATEGORY_KEYWORDS.values() for kw in cat_kws
    )

    if not has_url and not has_product_hint and len(msg) < 20:
        for pattern in IRRELEVANT_PATTERNS:
            if re.search(pattern, msg):
                return INTENT_IRRELEVANT

    # 2. 有链接 → 如果当前在 reviewing 状态，说明是切换新商品
    if has_url:
        if state == STATE_REVIEWING:
            return INTENT_SWITCH
        return INTENT_GENERATE

    # 3. 改写意图检测（在 reviewing 状态下优先）
    if state == STATE_REVIEWING:
        for kw in REWRITE_KEYWORDS:
            if kw in msg:
                return INTENT_REWRITE

    # 4. 有商品关键词 → 生成或切换
    if has_product_hint:
        if state == STATE_REVIEWING:
            return INTENT_SWITCH
        return INTENT_GENERATE

    # 5. 在 idle 状态下，任何像商品描述的输入都当作生成
    if state == STATE_IDLE and len(msg) >= 2:
        # 排除纯改写指令
        is_rewrite = any(kw in msg for kw in REWRITE_KEYWORDS)
        if not is_rewrite:
            return INTENT_GENERATE

    # 6. 在 reviewing 状态下的模糊输入，默认当改写
    if state == STATE_REVIEWING:
        return INTENT_REWRITE

    # 7. 兜底
    return INTENT_GENERATE


def extract_user_profile(message: str, profile: dict) -> dict:
    """
    从用户消息中提取品牌/品类/调性信息，累积更新 profile
    profile 结构: {brand_name, tone, category, products}
    """
    msg = message.strip()

    # 提取品牌名（简单规则："我是XX品牌" / "品牌叫XX" / "XX品牌"）
    brand_patterns = [
        r"(?:我是|我们是|品牌(?:叫|是|名[叫是]?))\s*[「「\"']?([\u4e00-\u9fa5A-Za-z0-9]{2,10})[」」\"']?",
        r"[「「\"']([\u4e00-\u9fa5A-Za-z0-9]{2,10})[」」\"']\s*(?:品牌|旗舰|官方)",
    ]
    for pattern in brand_patterns:
        m = re.search(pattern, msg)
        if m:
            profile["brand_name"] = m.group(1)
            break

    # 提取调性关键词
    for tone in TONE_KEYWORDS:
        if tone in msg and tone not in profile.get("tone", []):
            profile.setdefault("tone", []).append(tone)

    # 提取品类
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in msg for kw in keywords):
            profile["category"] = category
            break

    # 记录商品关键词（最近的输入）
    if len(msg) > 2 and not any(kw in msg.lower() for kw in REWRITE_KEYWORDS):
        profile["last_product_input"] = msg[:100]

    return profile


def build_system_prompt(role: str, profile: dict) -> str:
    """
    基于角色 + 用户画像动态构建 system prompt
    """
    base_prompt = SYSTEM_PROMPTS[role]

    # 拼接用户画像上下文
    context_parts = []
    if profile.get("brand_name"):
        context_parts.append(f"用户的品牌名是「{profile['brand_name']}」，文案中必须体现该品牌。")
    if profile.get("tone"):
        tone_str = "、".join(profile["tone"][-5:])  # 最多保留5个
        context_parts.append(f"品牌调性关键词：{tone_str}，文案风格必须匹配这些调性。")
    if profile.get("category"):
        context_parts.append(f"商品品类：{profile['category']}。")

    if context_parts:
        context_block = "\n\n██ 用户画像（必须遵守） ██\n" + "\n".join(context_parts)
        return base_prompt + context_block

    return base_prompt


# 欢迎语（打招呼时返回）
GREETING_RESPONSE = "你好，我是种草笔记助手，告诉我你的选品，让我来帮你快速写出最适合你的笔记吧～ 🌱"

# Fallback 回复（无关话题，不走 LLM）
FALLBACK_RESPONSES = [
    "这个我帮不上忙哦～我的专长是写种草文案 🌱\n\n把商品链接或关键词发给我，马上帮你生成笔记！",
    "我只会写种草笔记哦 🌱 发个商品链接或告诉我你要推什么产品，我来帮你！",
    "这个问题超出我的能力范围啦～我专注于种草笔记创作 🌱\n\n告诉我你的选品，我来帮你写文案！",
]


# ══════════════════════════════════════════════════════════════
# API 接口（重构版）
# ══════════════════════════════════════════════════════════════

class SessionRequest(BaseModel):
    role: str  # brand / seller / kol
    nickname: Optional[str] = "小薯"


class ChatRequest(BaseModel):
    session_id: str
    role: str
    message: str


class RewriteRequest(BaseModel):
    action: str
    title: Optional[str] = ""
    body: Optional[str] = ""
    tags: Optional[list] = []
    instruction: Optional[str] = ""
    role: Optional[str] = ""  # 新增：传入角色以保持风格一致


@app.post("/api/session")
async def create_session(req: SessionRequest):
    """创建会话，返回 session_id"""
    if req.role not in SYSTEM_PROMPTS:
        raise HTTPException(400, f"不支持的角色：{req.role}，可选：brand/seller/kol")

    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        "role": req.role,
        "nickname": req.nickname,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPTS[req.role]}
        ],
        "created_at": time.time(),
        "state": STATE_IDLE,           # 对话状态机
        "user_profile": {},            # 用户画像记忆
        "last_note": None,             # 最近一次生成的笔记（用于改写上下文）
    }
    return {"session_id": session_id}


# ── 非流式接口（保持兼容） ──────────────────────────────
@app.post("/api/chat")
async def chat(req: ChatRequest):
    if req.session_id not in sessions:
        raise HTTPException(404, "会话不存在或已过期，请重新创建")

    session = sessions[req.session_id]

    # ① 提取用户画像
    session["user_profile"] = extract_user_profile(req.message, session.get("user_profile", {}))

    # ② 意图分类
    intent = classify_intent(req.message, session)

    # ③ 打招呼：返回欢迎语
    if intent == INTENT_GREETING:
        return {"text": GREETING_RESPONSE, "note": None, "intent": intent, "state": session["state"]}

    # ③-b Fallback：无关话题直接返回，不走 LLM
    if intent == INTENT_IRRELEVANT:
        import random
        fallback_text = random.choice(FALLBACK_RESPONSES)
        return {"text": fallback_text, "note": None, "intent": intent, "state": session["state"]}

    # ④ 改写意图 → 走 rewrite 逻辑
    if intent == INTENT_REWRITE and session.get("last_note"):
        session["state"] = STATE_REWRITING
        last = session["last_note"]
        rewrite_req = RewriteRequest(
            action="rewrite_body",
            title=last.get("title", ""),
            body=last.get("body", ""),
            tags=last.get("tags", []),
            instruction=req.message,
            role=session["role"],
        )
        result = await rewrite(rewrite_req)
        # 更新 last_note
        if result.get("note"):
            session["last_note"] = result["note"]
        session["state"] = STATE_REVIEWING
        result["intent"] = intent
        result["state"] = session["state"]
        return result

    # ⑤ 切换商品 → 重置状态，走生成流程
    if intent == INTENT_SWITCH:
        session["state"] = STATE_IDLE
        session["last_note"] = None

    # ⑥ 生成文案 → 走 tool calling 流程
    session["state"] = STATE_GENERATING

    # 动态更新 system prompt（注入用户画像）
    session["messages"][0] = {
        "role": "system",
        "content": build_system_prompt(session["role"], session["user_profile"])
    }

    # 消息窗口截断
    session["messages"] = trim_messages(session["messages"])
    session["messages"].append({"role": "user", "content": req.message})

    max_tool_rounds = 5
    assistant_text = ""
    for _ in range(max_tool_rounds):
        llm_response = await call_deepseek(
            messages=session["messages"],
            tools=TOOLS,
        )
        choice = llm_response["choices"][0]
        message = choice["message"]

        if message.get("tool_calls"):
            session["messages"].append(message)
            for tool_call in message["tool_calls"]:
                func_name = tool_call["function"]["name"]
                func_args = json.loads(tool_call["function"]["arguments"])
                handler = TOOL_HANDLERS.get(func_name)
                if handler:
                    result = await handler(**func_args)
                else:
                    result = f"未知工具：{func_name}"
                session["messages"].append({
                    "role": "tool",
                    "tool_call_id": tool_call["id"],
                    "content": result,
                })
            continue

        assistant_text = message.get("content", "")
        session["messages"].append({"role": "assistant", "content": assistant_text})
        break
    else:
        assistant_text = "抱歉，处理过程太复杂了，请简化你的需求再试一次。"

    parsed = parse_agent_response(assistant_text)

    # 更新状态和记忆
    if parsed.get("note"):
        session["last_note"] = parsed["note"]
        session["state"] = STATE_REVIEWING
    else:
        session["state"] = STATE_IDLE

    parsed["intent"] = intent
    parsed["state"] = session["state"]
    return parsed


# ── 流式对话接口（SSE） ──────────────────────────────
@app.post("/api/chat/stream")
async def chat_stream(req: ChatRequest):
    """
    流式对话接口 - SSE (Server-Sent Events)
    新增事件:
    - intent:     意图分类结果 {intent, state}
    - fallback:   无关话题回复 {text}
    原有事件:
    - tool_start: 开始调用工具 {name, args}
    - tool_done:  工具调用完成 {name, result_preview}
    - delta:      文本增量 {content}
    - done:       完成 {full_text}
    - error:      出错 {message}
    """
    if req.session_id not in sessions:
        async def error_gen():
            yield sse_event("error", {"message": "会话不存在或已过期，请重新创建"})
        return StreamingResponse(error_gen(), media_type="text/event-stream")

    session = sessions[req.session_id]

    # ① 提取用户画像
    session["user_profile"] = extract_user_profile(req.message, session.get("user_profile", {}))

    # ② 意图分类
    intent = classify_intent(req.message, session)

    # ③ 打招呼：返回欢迎语
    if intent == INTENT_GREETING:
        async def greeting_gen():
            yield sse_event("intent", {"intent": intent, "state": session["state"]})
            yield sse_event("greeting", {"text": GREETING_RESPONSE})
            yield sse_event("done", {"full_text": GREETING_RESPONSE})
        return StreamingResponse(greeting_gen(), media_type="text/event-stream")

    # ③-b Fallback：无关话题
    if intent == INTENT_IRRELEVANT:
        import random
        fallback_text = random.choice(FALLBACK_RESPONSES)
        async def fallback_gen():
            yield sse_event("intent", {"intent": intent, "state": session["state"]})
            yield sse_event("fallback", {"text": fallback_text})
            yield sse_event("done", {"full_text": fallback_text})
        return StreamingResponse(fallback_gen(), media_type="text/event-stream")

    # ④ 改写意图
    if intent == INTENT_REWRITE and session.get("last_note"):
        session["state"] = STATE_REWRITING
        last = session["last_note"]
        async def rewrite_gen():
            yield sse_event("intent", {"intent": intent, "state": session["state"]})
            try:
                rewrite_req = RewriteRequest(
                    action="rewrite_body",
                    title=last.get("title", ""),
                    body=last.get("body", ""),
                    tags=last.get("tags", []),
                    instruction=req.message,
                    role=session["role"],
                )
                result = await rewrite(rewrite_req)
                if result.get("note"):
                    session["last_note"] = result["note"]
                session["state"] = STATE_REVIEWING
                # 把改写结果作为完整 JSON 一次性发出
                full_text = json.dumps(result, ensure_ascii=False)
                yield sse_event("delta", {"content": full_text})
                yield sse_event("done", {"full_text": full_text})
            except Exception as e:
                yield sse_event("error", {"message": str(e)})
        return StreamingResponse(rewrite_gen(), media_type="text/event-stream")

    # ⑤ 切换商品
    if intent == INTENT_SWITCH:
        session["state"] = STATE_IDLE
        session["last_note"] = None

    # ⑥ 生成文案 → 走 tool calling + 流式
    session["state"] = STATE_GENERATING

    # 动态更新 system prompt
    session["messages"][0] = {
        "role": "system",
        "content": build_system_prompt(session["role"], session["user_profile"])
    }

    session["messages"] = trim_messages(session["messages"])
    session["messages"].append({"role": "user", "content": req.message})

    async def stream_generator() -> AsyncGenerator[str, None]:
        try:
            # 发送意图事件
            yield sse_event("intent", {"intent": intent, "state": session["state"]})

            # Phase 1: Agent 工具调用循环
            max_tool_rounds = 5
            for _ in range(max_tool_rounds):
                llm_response = await call_deepseek(
                    messages=session["messages"],
                    tools=TOOLS,
                    stream=False,
                )
                choice = llm_response["choices"][0]
                message = choice["message"]

                if not message.get("tool_calls"):
                    break

                session["messages"].append(message)
                for tool_call in message["tool_calls"]:
                    func_name = tool_call["function"]["name"]
                    func_args = json.loads(tool_call["function"]["arguments"])

                    yield sse_event("tool_start", {
                        "name": func_name,
                        "args": func_args,
                    })

                    handler = TOOL_HANDLERS.get(func_name)
                    if handler:
                        result = await handler(**func_args)
                    else:
                        result = f"未知工具：{func_name}"

                    session["messages"].append({
                        "role": "tool",
                        "tool_call_id": tool_call["id"],
                        "content": result,
                    })

                    yield sse_event("tool_done", {
                        "name": func_name,
                        "result_preview": result[:100],
                    })
            else:
                yield sse_event("delta", {"content": "抱歉，处理过程太复杂了，请简化你的需求再试一次。"})
                yield sse_event("done", {"full_text": ""})
                return

            # Phase 2: 流式生成最终回复
            full_text = ""
            async with httpx.AsyncClient(timeout=120.0) as client:
                payload = {
                    "model": MODEL,
                    "messages": session["messages"],
                    "temperature": 0.7,
                    "max_tokens": 2000,
                    "stream": True,
                }

                async with client.stream(
                    "POST",
                    f"{DEEPSEEK_BASE_URL}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                ) as resp:
                    if resp.status_code != 200:
                        error_text = await resp.aread()
                        yield sse_event("error", {"message": f"DeepSeek API 错误：{resp.status_code}"})
                        return

                    async for line in resp.aiter_lines():
                        if not line.startswith("data: "):
                            continue
                        data_str = line[6:]
                        if data_str.strip() == "[DONE]":
                            break

                        try:
                            chunk = json.loads(data_str)
                            delta = chunk["choices"][0].get("delta", {})
                            content = delta.get("content", "")
                            if content:
                                full_text += content
                                yield sse_event("delta", {"content": content})
                        except (json.JSONDecodeError, KeyError, IndexError):
                            continue

            # 保存到会话历史
            session["messages"].append({"role": "assistant", "content": full_text})

            # 更新状态和记忆
            parsed = parse_agent_response(full_text)
            if parsed.get("note"):
                session["last_note"] = parsed["note"]
                session["state"] = STATE_REVIEWING
            else:
                session["state"] = STATE_IDLE

            yield sse_event("done", {"full_text": full_text})

        except Exception as e:
            yield sse_event("error", {"message": str(e)})

    return StreamingResponse(
        stream_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.post("/api/rewrite")
async def rewrite(req: RewriteRequest):
    action_prompts = {
        "rewrite_title": f"改写这个标题，要求：{req.instruction or '更有吸引力'}\n原标题：{req.title}\n正文参考：{req.body[:100]}",
        "rewrite_body": f"改写正文，要求：{req.instruction or '优化表达'}\n标题：{req.title}\n原文：{req.body}\n注意：正文必须≤75字，4句短句用换行分隔，纯文字+emoji，不许有markdown或*符号",
        "rewrite_sentence": f"改写这一句话，要求：{req.instruction or '换个说法'}\n原句：{req.body}\n注意：只返回改写后的一句话，不要扩写成多句，保持一句话，≤20字，纯文字+emoji，不许有markdown或*符号",
        "rewrite_tags": f"重新推荐5-8个标签：\n标题：{req.title}\n正文：{req.body[:200]}\n原标签：{', '.join(req.tags or [])}",
        "polish": f"全面润色（标题+正文+标签）：\n标题：{req.title}\n正文：{req.body}\n标签：{', '.join(req.tags or [])}\n要求：{req.instruction or '整体提升'}\n注意：正文必须≤75字，纯文字+emoji，不许有markdown或*符号",
    }

    prompt = action_prompts.get(req.action)
    if not prompt:
        raise HTTPException(400, f"不支持的改写动作：{req.action}")

    # 根据角色注入风格约束
    role_style = ""
    if req.role == "brand":
        role_style = "\n风格要求：高级感文案，品牌背书，语气自信克制。"
    elif req.role == "seller":
        role_style = "\n风格要求：闺蜜安利口吻，亲切真实，有'姐妹冲'的感觉。"
    elif req.role == "kol":
        role_style = "\n风格要求：专业测评博主视角，数据说话，理性有说服力。"

    system_msg = f"""你是小红书文案改写专家。直接返回改写结果，不要解释思路，不要输出分析过程。{role_style}

██ 绝对禁止 ██
- 禁止输出 markdown 格式（不许用 ** # ``` 等符号）
- 禁止输出 * 星号
- title 和 body 和 tags 里只允许纯文字和emoji
- 禁止输出任何解释、思路、分析文字

██ 规则 ██
1. 只返回JSON，不要有任何其他文字
2. text字段留空
3. 改写哪个字段就改哪个，其他保持原文
4. body正文整体改写时：≤75字，4句短句，用\\n分隔
5. 单句改写时（rewrite_sentence）：只返回一句话放在body里，≤20字，绝对不要扩写成多句

输出格式：
{{"text":"","note":{{"title":"改后标题","body":"改后正文","tags":["#标签1","#标签2"]}}}}"""

    llm_response = await call_deepseek(
        messages=[
            {"role": "system", "content": system_msg},
            {"role": "user", "content": prompt},
        ],
        tools=None,
    )

    assistant_text = llm_response["choices"][0]["message"].get("content", "")
    return parse_agent_response(assistant_text)


# ── 新增：查询会话状态接口 ──────────────────────────────
@app.get("/api/session/{session_id}/state")
async def get_session_state(session_id: str):
    """查询会话当前状态和用户画像"""
    if session_id not in sessions:
        raise HTTPException(404, "会话不存在")
    session = sessions[session_id]
    return {
        "state": session.get("state", STATE_IDLE),
        "user_profile": session.get("user_profile", {}),
        "has_draft": session.get("last_note") is not None,
    }


# ══════════════════════════════════════════════════════════════
# LLM 调用（非流式，用于工具调用阶段）
# ══════════════════════════════════════════════════════════════
async def call_deepseek(messages: list, tools: Optional[list] = None, stream: bool = False) -> dict:
    if not DEEPSEEK_API_KEY:
        raise HTTPException(500, "未配置 DEEPSEEK_API_KEY，请在 .env 文件中设置")

    payload = {
        "model": MODEL,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 2000,
    }
    if tools:
        payload["tools"] = tools
        payload["tool_choice"] = "auto"

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(
            f"{DEEPSEEK_BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
        )

        if resp.status_code != 200:
            error_text = resp.text
            raise HTTPException(502, f"DeepSeek API 错误：{resp.status_code} - {error_text}")

        return resp.json()


# ══════════════════════════════════════════════════════════════
# 响应解析
# ══════════════════════════════════════════════════════════════
def parse_agent_response(text: str) -> dict:
    note_preview = None

    try:
        data = json.loads(text)
        if isinstance(data, dict) and "note" in data:
            note_preview = data["note"]
            return {"text": data.get("text", ""), "note": note_preview}
    except (json.JSONDecodeError, TypeError):
        pass

    json_match = re.search(r'```json\s*\n?(.*?)\n?```', text, re.DOTALL)
    if json_match:
        try:
            data = json.loads(json_match.group(1))
            if isinstance(data, dict) and "note" in data:
                note_preview = data["note"]
                clean_text = text[:json_match.start()].strip()
                return {"text": clean_text or data.get("text", ""), "note": note_preview}
        except (json.JSONDecodeError, TypeError):
            pass

    json_match = re.search(r'\{[^{}]*"note"\s*:\s*\{.*?\}\s*\}', text, re.DOTALL)
    if json_match:
        try:
            data = json.loads(json_match.group(0))
            if "note" in data:
                note_preview = data["note"]
                clean_text = text[:json_match.start()].strip()
                return {"text": clean_text or data.get("text", ""), "note": note_preview}
        except (json.JSONDecodeError, TypeError):
            pass

    return {"text": text, "note": None}


# ══════════════════════════════════════════════════════════════
# 启动
# ══════════════════════════════════════════════════════════════
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    print(f"""
╔══════════════════════════════════════════════════╗
║  🌱 种薯 Agent v3.0 已启动                       ║
║  地址: http://localhost:{port}                    ║
║  文档: http://localhost:{port}/docs               ║
║                                                  ║
║  新增能力:                                        ║
║  · 用户画像记忆（品牌/品类/调性）                  ║
║  · 对话状态机（idle/generating/reviewing）         ║
║  · 意图路由（generate/rewrite/fallback）          ║
║  · 无关话题自动拒绝                               ║
╚══════════════════════════════════════════════════╝
""")
    uvicorn.run(app, host="0.0.0.0", port=port)
