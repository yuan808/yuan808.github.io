import { useState, useEffect, useRef } from 'react'

const pg = n => `/images/page_${String(n).padStart(2,'0')}.png`

// ── 设计作品集三个项目直接在首页展示的页码 ──
const designProjects = [
  {
    id: 'plant',
    part: 'Part One',
    title: '儿童自然科普玩教具',
    color: '#5AAFD6',
    coverPage: 7,
    pages: [7,8,9,10,11,12,13,14,15,16,17,18,19,20,21],
  },
  {
    id: 'drone',
    part: 'Part Two',
    title: '城市高架交通事故助手',
    color: '#E85D20',
    coverPage: 22,
    pages: [22,23,24,25,26,27,28,29,30,31,32,33,34,35,36],
  },
  {
    id: 'playground',
    part: 'Part Three',
    title: '趣环 — 适应性儿童游乐设施',
    color: '#4A9E5C',
    coverPage: 37,
    pages: [37,38,39,40,41,42,43,44,45,46,47,48],
  },
]

const internships = [
  {
    id: 'meituan', company: '美团', role: 'CLC智能硬件 · 海雀AIoT平台产品经理',
    period: '2026.02—至今', color: '#FF3B2F', tag: 'IoT · 硬件PRD · 海雀AIoT',
    points: [
      '【业务目标】提升运维监管效率、解决硬件生命周期全流程可视化，推动硬件能力沉淀与复用，构建外卖生命周期、设备画像、设备管理体系',
      '【需求调研】分析内部多个现有平台侧重点，发现硬件设备阶段性数据孤立、数据预测性能力存在短板，推动系统功能建设与AI能力接入',
      '【租户权限】根据权限释放逻辑和管理流程，设计租户、账号、项目、产品、管理员的权限管控收口，支持全美团员工、外包、三方使用',
      '【外卖柜设备画像】定义生命周期6步状态及信息数据，结合业务情况沉淀可复用组件能力，形成覆盖全生命周期的动态画像',
      '【AIoT能力】根据业务实体，沉淀仓、店、服务类型下的设备管理，构建星眸大模型支持下AI视频原子能力',
      '【Vibe Coding】基于 Claude Code、NoCode、Cursor 实现 UI 规范的代码分支，沉淀 skill，代码复用率 >85%，项目提效 35%',
      '【成效指标】10万+设备全生命周期数据整合，全流程可视化率达 86.77%；设备故障响应处理效率提升 70%',
    ],
  },
  {
    id: 'xunfei', company: '科大讯飞', role: '中国移动 · AI合成内容风控产品经理',
    period: '2025.11—2026.01', color: '#FF8C00', tag: 'NLP · 多模态 · 内容风控',
    points: [
      '【项目背景】中国移动业务中多模态数据规模激增，网信办要求对AI合成伪造等违规风险进行治理，构建机器审核体系，替代传统人工审核',
      '【需求梳理】图文、音视频数据样本收录，更新特征库，提取文本语义冲突、图像面部畸变、音频频谱异常、视频帧间不连贯等特征',
      '【验证逻辑】根据当前多模态合成数据情况，联合算法设计多模态交叉验证规则，规避单模态漏判问题',
      '【分级处置】设计处置规则体系（低危娱乐/中危误导/高危侵权），明确各级触发条件、处置动作（弹窗提醒/自动拦截/强制下架）',
      '【成效指标】提升AI合成伪造内容识别准确率 92% 以上，快速处置违规内容，有效遏制伪造信息传播',
    ],
  },
  {
    id: 'baidu', company: '百度', role: '小度教育 · AI绘本交互产品经理',
    period: '2024.10—2025.03', color: '#4DAAFF', tag: 'AIGC · 儿童教育 · Prompt',
    points: [
      '【业务目标】小度教育名著阅读用户没兴趣、不坚持、不会用，根据教育性与趣味性需求，推动剧情驱动 AI 生成绘本与交互',
      '【问题定位】通过埋点数据发现沉浸时长不足 <8min、7日留存率低 <35% 的核心问题；竞品调研 ReadKidz、StoryBird.ai、childbook.ai、豆包等 AI 绘本及凯叔、Kada 在用户分层、内容生成与互动机制上的对比，确定方向为"以剧情驱动替代被动阅读"',
      '【产品方案】设计"剧情拆解—绘本生成—多模态输出"AI 内容生产流程，整理教学目标、互动生成脚本、绘本内容的产品规范与验收标准',
      '【Prompt】从内容的连贯性、趣味性与教学有效性制定剧集拆解、场景描述、剧情交互等模块输出要求，通过多方案对比与效果评估持续调优',
      '【技术需求】向算法团队输出文心一言与 Stable Diffusion 的角色一致性、知识点难度分级、年龄认知适配、教育事实性增强等 7 大算法需求',
      '【上线效果】SDK 接入小度教育平板，灰度上线覆盖用户 10 万+；A/B 测试儿童知识答题准确率均值提升 47%，家长净推荐均值 8.1 分',
    ],
  },
]

// ── 复制成功 Toast ────────────────────────────────────────────
function CopyToast({ show, text }) {
  return (
    <div style={{
      position: 'fixed', bottom: 40, left: '50%',
      transform: `translateX(-50%) translateY(${show ? 0 : 20}px)`,
      opacity: show ? 1 : 0,
      transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
      zIndex: 9999, pointerEvents: 'none',
      background: 'rgba(26,26,26,0.88)',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      color: '#fff', fontSize: 13, fontWeight: 700,
      padding: '10px 20px', borderRadius: 99,
      display: 'flex', alignItems: 'center', gap: 7,
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      whiteSpace: 'nowrap',
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2ECC71" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      已复制 {text}
    </div>
  )
}

// ── 联系方式条目（点击复制）────────────────────────────────────
function ContactItem({ icon, text, hoverColor, onCopy }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      onCopy && onCopy(text)
      setTimeout(() => setCopied(false), 1800)
    })
  }
  return (
    <button
      onClick={copy}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'none', border: 'none', padding: '3px 0',
        fontSize: 13, fontWeight: 600, cursor: 'pointer',
        color: copied ? hoverColor : 'rgba(26,26,26,0.6)',
        transition: 'color 0.15s',
      }}
      onMouseEnter={e => { if (!copied) e.currentTarget.style.color = hoverColor }}
      onMouseLeave={e => { if (!copied) e.currentTarget.style.color = 'rgba(26,26,26,0.6)' }}
    >
      {icon}
      <span>{text}</span>
      {copied ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={hoverColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.35 }}>
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
        </svg>
      )}
    </button>
  )
}

// ── 分区标题 ────────────────────────────────────────────────
function SectionLabel({ label, color = '#1A1A1A' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      marginBottom: 16,
    }}>
      <div style={{ width: 4, height: 22, borderRadius: 2, background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.1em', color: 'rgba(26,26,26,0.4)', textTransform: 'uppercase' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.07)' }} />
    </div>
  )
}

// ── 横条卡片 ────────────────────────────────────────────────
function HorizontalCard({ left, right, onClick, accent, children, style = {} }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'stretch',
        background: hov ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1.5px solid ${hov && accent ? accent + '55' : 'rgba(255,255,255,0.75)'}`,
        borderLeft: accent ? `4px solid ${accent}` : undefined,
        borderRadius: 16,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.22s ease',
        transform: hov && onClick ? 'translateX(4px)' : 'translateX(0)',
        boxShadow: hov && onClick ? `0 6px 24px ${accent || '#000'}18` : '0 2px 12px rgba(0,0,0,0.05)',
        marginBottom: 10,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ── 种薯 Agent 面板 ───────────────────────────────────────────
const API = 'https://web-production-88dd2.up.railway.app'

// 风格改写选项（局部：选区时用）
const REWRITE_STYLES_PARTIAL = [
  { key: 'emoji',    label: '加 Emoji',   prompt: '给这段文字加上合适的 emoji，让它更活泼可爱，保留原意' },
  { key: 'casual',   label: '更口语',     prompt: '把这段文字改得更口语化、更接地气，像朋友间聊天的感觉' },
  { key: 'powerful', label: '更有力',     prompt: '把这段文字改得更有感染力、更能打动人，加强购买欲望' },
  { key: 'rephrase', label: '换个说法',   prompt: '用不同的表达方式重写这段文字，保留核心意思但换个角度' },
]
// 整体改写（全文时用，包含局部4项）
const REWRITE_STYLES_FULL = [
  { key: 'kol',      label: '达人风',     prompt: '用小红书头部达人的风格重写，真实体验+强种草感' },
  { key: 'story',    label: '故事感',     prompt: '加入真实使用场景和情节，让笔记更有代入感' },
  { key: 'review',   label: '测评流',     prompt: '改成专业测评风格，有数据有对比有结论' },
  { key: 'short',    label: '精简版',     prompt: '压缩到最核心的卖点，干脆利落不废话' },
  ...REWRITE_STYLES_PARTIAL,
]

function SeedAgentPanel({ onClose }) {
  const [input, setInput]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [rewriting, setRewriting]   = useState('')   // 'para-{idx}-{key}' | '{key}'
  const [note, setNote]             = useState(null)
  const [error, setError]           = useState('')
  const [editTitle, setEditTitle]   = useState(false)
  const [sessionId, setSessionId]   = useState(null)
  const [activePara, setActivePara] = useState(null) // 当前展开局部操作的段落 index
  const [xhsToast, setXhsToast]     = useState(false)
  const [rwDone, setRwDone]         = useState('')   // 最近完成改写的 key，用于显示 ✓ 提示
  const [extReady, setExtReady]     = useState(false)  // 扩展是否已安装
  const [draftStatus, setDraftStatus] = useState('')   // 'saving' | 'done' | 'error'
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  // 监听扩展是否已安装，以及存草稿结果
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'XHS_EXT_READY') setExtReady(true)
      if (e.data?.type === 'XHS_DRAFT_RESULT') {
        setDraftStatus(e.data.ok ? 'done' : 'error')
        setTimeout(() => setDraftStatus(''), 3000)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  const generate = async () => {
    if (!input.trim() || loading) return
    setLoading(true); setError(''); setNote(null)
    setEditTitle(false); setActivePara(null)
    try {
      const sessRes = await fetch(`${API}/api/session`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'brand', nickname: '访客' })
      })
      const sess = await sessRes.json()
      setSessionId(sess.session_id)
      const chatRes = await fetch(`${API}/api/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sess.session_id, role: 'brand',
          message: `帮我写一篇小红书种草笔记，商品关键词：${input}` })
      })
      const data = await chatRes.json()
      if (data.note) setNote(data.note)
      else setError('未生成笔记，请换个关键词再试')
    } catch {
      setError('连接失败，请稍后重试')
    } finally { setLoading(false) }
  }

  // 从改写回复中提取纯文案
  const extractRewriteText = (raw) => {
    if (!raw) return ''
    const afterLabel = raw.match(/(?:修改后|改写后|改后|结果)[：:：]\s*([\s\S]+?)(?:\n\n|修改说明|$)/i)
    if (afterLabel) return afterLabel[1].replace(/\*/g, '').trim()
    return raw
      .replace(/原[文句].*?(?=\n\n|$)/gs, '')
      .replace(/修改说明.*?(?=\n\n|$)/gs, '')
      .replace(/改写说明.*?(?=\n\n|$)/gs, '')
      .replace(/\*/g, '')
      .trim() || raw.replace(/\*/g, '').trim()
  }

  // 改写单行
  const rewritePara = async (paraIdx, style) => {
    if (!note || !sessionId || rewriting) return
    const paras = note.body.split('\n')
    const targetText = paras[paraIdx]
    const rwKey = `para-${paraIdx}-${style.key}`
    setActivePara(null)
    setRewriting(rwKey)
    try {
      const res = await fetch(`${API}/api/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, role: 'brand',
          message: `${style.prompt}。只输出改写后的文字本身，不要输出原句、说明或任何标签，不要使用 * 或 ** 等 Markdown 符号：\n\n${targetText}` })
      })
      const data = await res.json()
      const newText = extractRewriteText(data.note?.body || data.text || '')
      if (newText) {
        paras[paraIdx] = newText
        setNote(n => ({ ...n, body: paras.join('\n') }))
        setRwDone(rwKey)
        setTimeout(() => setRwDone(''), 2000)
      }
    } catch { /* silent */ }
    finally { setRewriting('') }
  }

  // 改写整体正文
  const rewriteAll = async (style) => {
    if (!note || !sessionId || rewriting) return
    setRewriting(style.key)
    try {
      const res = await fetch(`${API}/api/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, role: 'brand',
          message: `${style.prompt}。只输出改写后的文字本身，不要输出原句、说明或任何标签，不要使用 * 或 ** 等 Markdown 符号：\n\n${note.body}` })
      })
      const data = await res.json()
      const newText = extractRewriteText(data.note?.body || data.text || '')
      if (newText) {
        setNote(n => ({ ...n, body: newText, ...(data.note?.title ? { title: data.note.title } : {}) }))
        setRwDone('all')
        setTimeout(() => setRwDone(''), 2000)
      }
    } catch { /* silent */ }
    finally { setRewriting('') }
  }

  // 点「发布小红书」：复制文案 + 显示提示
  const publishToXHS = () => {
    const text = `${note.title}\n\n${note.body}\n\n${note.tags.map(t => '#' + t).join(' ')}`
    navigator.clipboard.writeText(text)
    setXhsToast(true)
    setTimeout(() => setXhsToast(false), 3500)
  }

  // 点「存入草稿」：通过扩展 postMessage 加入小红书草稿
  const saveDraft = () => {
    setDraftStatus('saving')
    window.postMessage({
      type: 'XHS_SAVE_DRAFT',
      note: { title: note.title, body: note.body, tags: note.tags }
    }, '*')
  }

  const bodyLen = note?.body?.replace(/\s/g, '').length || 0
  const isShort  = bodyLen > 0 && bodyLen < 70

  return (
    <div style={{
      background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
      border: '1.5px solid rgba(46,204,113,0.25)', borderTop: 'none',
      borderRadius: '0 0 16px 16px', padding: '20px',
      animation: 'expandIn 0.22s ease both',
    }}>
      {/* 输入区 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input ref={inputRef} value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && generate()}
          placeholder="输入商品关键词，如：防晒霜、连衣裙、耳机…"
          style={{ flex: 1, padding: '10px 14px', borderRadius: 10, fontSize: 13,
            border: '1.5px solid rgba(46,204,113,0.3)',
            outline: 'none', background: 'rgba(46,204,113,0.04)', color: '#1A1A1A' }}
        />
        <button onClick={generate} disabled={loading || !input.trim()} style={{
          padding: '10px 18px', borderRadius: 10, border: 'none',
          background: loading || !input.trim() ? 'rgba(46,204,113,0.3)' : '#2ECC71',
          color: '#fff', fontSize: 13, fontWeight: 800,
          cursor: loading || !input.trim() ? 'default' : 'pointer',
          transition: 'all 0.15s', whiteSpace: 'nowrap',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {loading
            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          }
          {loading ? '生成中…' : '生成'}
        </button>
      </div>

      {error && <div style={{ color: '#FF3B2F', fontSize: 12, marginBottom: 12 }}>{error}</div>}

      {note && (
        <div style={{
          background: 'linear-gradient(135deg, #fff9f9 0%, #f0fff4 100%)',
          border: '1.5px solid rgba(46,204,113,0.2)',
          borderRadius: 12, padding: '16px',
          animation: 'fadeUp 0.3s ease both',
        }}>
          {/* 标题 */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: 'rgba(26,26,26,0.35)', fontWeight: 700, letterSpacing: '0.06em' }}>标题</span>
              <button onClick={() => setEditTitle(v => !v)} style={{
                fontSize: 10, color: editTitle ? '#2ECC71' : 'rgba(26,26,26,0.35)',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 700,
              }}>{editTitle ? '完成' : '✏️ 修改'}</button>
            </div>
            {editTitle
              ? <input value={note.title} onChange={e => setNote(n => ({ ...n, title: e.target.value }))}
                  style={{ width: '100%', fontSize: 15, fontWeight: 900, color: '#1A1A1A',
                    border: '1.5px solid rgba(46,204,113,0.4)', borderRadius: 8,
                    padding: '6px 10px', outline: 'none', background: 'rgba(46,204,113,0.04)' }} />
              : <div style={{ fontSize: 15, fontWeight: 900, color: '#1A1A1A', lineHeight: 1.4 }}>{note.title}</div>
            }
          </div>

          {/* 正文—按行渲染，点击展开局部操作 */}
          <div style={{ marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: 'rgba(26,26,26,0.35)', fontWeight: 700, letterSpacing: '0.06em' }}>正文</span>
              {/* 操作引导提示 */}
              <span style={{ fontSize: 10, color: 'rgba(46,204,113,0.6)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                点任意一行可局部改写
              </span>
              <span style={{ fontSize: 10, color: bodyLen < 70 ? '#FF8C00' : 'rgba(26,26,26,0.3)', marginLeft: 'auto', fontWeight: 600 }}>
                {bodyLen} 字{isShort && ' · 字数偏少'}
              </span>
            </div>
            {/* 按行渲染，空行显示为间距 */}
            {note.body.split('\n').map((line, idx) => {
              const isEmpty    = line.trim() === ''
              const isActive   = activePara === idx
              const rwKey      = `para-${idx}-`
              const isRwing    = rewriting.startsWith(rwKey)
              // 空行只显示为间距
              if (isEmpty) return <div key={idx} style={{ height: 6 }} />
              return (
                <div key={idx}
                  style={{
                    borderRadius: 8, marginBottom: 2,
                    background: isActive ? 'rgba(255,251,240,1)' : 'transparent',
                    outline: isActive ? '1px solid rgba(46,204,113,0.2)' : 'none',
                    transition: 'all 0.12s',
                    cursor: 'pointer',
                  }}
                  onClick={() => setActivePara(isActive ? null : idx)}
                >
                  {/* 行文字 + 悬停提示 */}
                  <div style={{ fontSize: 13, color: 'rgba(26,26,26,0.72)', lineHeight: 1.85,
                    padding: '3px 6px 2px', userSelect: 'text',
                    display: 'flex', alignItems: 'baseline', gap: 4,
                  }}>
                    <span style={{ flex: 1 }}>{line}</span>
                    {!isActive && !rewriting && (
                      <span style={{ fontSize: 9, color: 'rgba(26,26,26,0.18)', flexShrink: 0, lineHeight: 1 }}>点击改写</span>
                    )}
                  </div>
                  {/* 局部操作按钮—展开时内联显示 */}
                  {isActive && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, padding: '4px 6px 8px', animation: 'expandIn 0.15s ease both' }}
                      onClick={e => e.stopPropagation()}
                    >
                      {REWRITE_STYLES_PARTIAL.map(s => {
                        const key   = `${rwKey}${s.key}`
                        const isDone = rwDone === key
                        return (
                          <button key={s.key}
                            onClick={() => rewritePara(idx, s)}
                            disabled={!!rewriting}
                            style={{
                              fontSize: 11, padding: '5px 10px', borderRadius: 14,
                              border: `1.5px solid ${isDone ? 'rgba(46,204,113,0.5)' : '#e8e8e8'}`,
                              background: rewriting === key ? '#2ECC71' : isDone ? 'rgba(46,204,113,0.1)' : '#fff',
                              color: rewriting === key ? '#fff' : isDone ? '#2ECC71' : '#444',
                              cursor: rewriting ? 'default' : 'pointer',
                              opacity: rewriting && rewriting !== key ? 0.5 : 1,
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              transition: 'all 0.12s', whiteSpace: 'nowrap',
                            }}>
                            {rewriting === key && (
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                            )}
                            {isDone && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                            {isDone ? '已完成' : s.label}
                          </button>
                        )
                      })}
                      {/* 手动编辑这一段 */}
                      <button
                        onClick={() => {
                          const paras = note.body.split('\n')
                          const newBody = window.prompt('编辑这一行：', paras[idx])
                          if (newBody !== null) {
                            paras[idx] = newBody
                            setNote(n => ({ ...n, body: paras.join('\n') }))
                          }
                          setActivePara(null)
                        }}
                        style={{ fontSize: 11, padding: '5px 10px', borderRadius: 14,
                          border: '1.5px solid #e8e8e8', background: '#fff', color: '#888',
                          cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.12s',
                        }}>✏️ 编辑</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* 整体改写区—虚线分割，始终显示 */}
          <div style={{ borderTop: '1px dashed rgba(26,26,26,0.1)', paddingTop: 10, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
              <span style={{ fontSize: 10, color: 'rgba(26,26,26,0.3)', fontWeight: 700, letterSpacing: '0.06em' }}>整体改写</span>
              {rwDone === 'all' && (
                <span style={{ fontSize: 10, color: '#2ECC71', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3, animation: 'fadeUp 0.2s ease both' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  改写完成
                </span>
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {REWRITE_STYLES_FULL.map(s => {
                const isDone = rwDone === 'all'
                return (
                  <button key={s.key}
                    onClick={() => rewriteAll(s)}
                    disabled={!!rewriting}
                    style={{
                      fontSize: 11, padding: '5px 10px', borderRadius: 14,
                      border: `1.5px solid ${isDone && rwDone === 'all' ? 'rgba(46,204,113,0.5)' : '#e8e8e8'}`,
                      background: rewriting === s.key ? '#2ECC71' : '#fff',
                      color: rewriting === s.key ? '#fff' : '#444',
                      cursor: rewriting ? 'default' : 'pointer',
                      opacity: rewriting && rewriting !== s.key ? 0.5 : 1,
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      transition: 'all 0.12s', whiteSpace: 'nowrap',
                    }}>
                    {rewriting === s.key && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                    )}
                    {s.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 标签 */}
          {note.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
              {note.tags.map((t, i) => (
                <span key={i} style={{ color: '#2ECC71', fontSize: 12, fontWeight: 700 }}>#{t}</span>
              ))}
            </div>
          )}

          {/* 底部工具栏：复制全文 + 发布小红书 + 关闭 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
            <CopyNoteButton note={note} />
            {/* 发布小红书 */}
            <button onClick={publishToXHS} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: xhsToast ? 'rgba(46,204,113,0.16)' : 'rgba(46,204,113,0.08)',
              color: '#2ECC71', border: `1px solid rgba(46,204,113,${xhsToast ? 0.5 : 0.25})`, borderRadius: 8,
              padding: '6px 14px', fontSize: 12, fontWeight: 800,
              cursor: 'pointer', whiteSpace: 'nowrap',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(46,204,113,0.16)'; e.currentTarget.style.borderColor = 'rgba(46,204,113,0.5)' }}
            onMouseLeave={e => { if (!xhsToast) { e.currentTarget.style.background = 'rgba(46,204,113,0.08)'; e.currentTarget.style.borderColor = 'rgba(46,204,113,0.25)' } }}
            >
              {xhsToast
                ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  </svg>
              }
              {xhsToast ? '已生成草稿' : '发布小红书'}
            </button>
            {/* 发布成功提示 */}
            {xhsToast && (
              <span style={{ fontSize: 11, color: 'rgba(26,26,26,0.45)', animation: 'fadeUp 0.2s ease both' }}>
                笔记草稿已生成，可在小红书内查看
              </span>
            )}
            {/* 存入草稿按钮（安装扩展后显示） */}
            {extReady && (
              <button onClick={saveDraft} disabled={draftStatus === 'saving'} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: draftStatus === 'done' ? 'rgba(46,204,113,0.15)' : draftStatus === 'error' ? 'rgba(255,59,47,0.08)' : 'rgba(46,204,113,0.08)',
                color: draftStatus === 'error' ? '#FF3B2F' : '#2ECC71',
                border: `1px solid ${draftStatus === 'error' ? 'rgba(255,59,47,0.3)' : 'rgba(46,204,113,0.25)'}`,
                borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 800,
                cursor: draftStatus === 'saving' ? 'default' : 'pointer', whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}>
                {draftStatus === 'saving' && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>}
                {draftStatus === 'done'   && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                {draftStatus === 'error'  && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
                {draftStatus === ''      && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>}
                {draftStatus === 'saving' ? '存入中…' : draftStatus === 'done' ? '已存入草稿' : draftStatus === 'error' ? '存入失败' : '存入草稿'}
              </button>
            )}
            {/* 未安装扩展时显示引导提示 */}
            {!extReady && (
              <span style={{ fontSize: 10, color: 'rgba(26,26,26,0.25)', fontStyle: 'italic' }}>
                安装扩展可直接存草稿
              </span>
            )}
            {/* 关闭按钮 */}
            <button onClick={() => setNote(null)} style={{
              marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4,
              background: 'none', border: '1px solid rgba(26,26,26,0.12)', borderRadius: 8,
              color: 'rgba(26,26,26,0.35)', fontSize: 12, fontWeight: 600,
              padding: '6px 12px', cursor: 'pointer', whiteSpace: 'nowrap',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(26,26,26,0.25)'; e.currentTarget.style.color = 'rgba(26,26,26,0.6)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(26,26,26,0.12)'; e.currentTarget.style.color = 'rgba(26,26,26,0.35)' }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              关闭
            </button>
          </div>
      </div>
      )}

      {/* 面板底部 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
        <span style={{ fontSize: 12, color: 'rgba(26,26,26,0.35)' }}>由 DeepSeek 驱动 · 种薯 Agent</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => window.open('https://yuan808.github.io/zhongshu/\x3fv=20260420', '_blank')}
            style={{ fontSize: 12, color: '#2ECC71', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            打开完整 APP →
          </button>
          <button onClick={onClose}
            style={{ fontSize: 12, color: 'rgba(26,26,26,0.4)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            收起
          </button>
        </div>
      </div>
    </div>
  )
}

function CopyNoteButton({ note }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    const text = `${note.title}\n\n${note.body}\n\n${note.tags.map(t => '#' + t).join(' ')}`
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }
  return (
    <button onClick={copy} style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: copied ? 'rgba(46,204,113,0.15)' : 'rgba(46,204,113,0.08)',
      border: '1px solid rgba(46,204,113,0.25)', borderRadius: 8,
      color: '#2ECC71', fontSize: 12, fontWeight: 700,
      padding: '6px 12px', cursor: 'pointer', transition: 'all 0.15s',
    }}>
      {copied ? '✓ 已复制' : '复制全文'}
    </button>
  )
}

// ── 种薯项目横条 ─────────────────────────────────────────────
function SeedRow() {
  const [agentOpen, setAgentOpen] = useState(false)

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(255,255,255,0.75)',
        borderLeft: '4px solid #2ECC71',
        borderRadius: agentOpen ? '16px 16px 0 0' : 16,
        padding: '16px 20px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        borderBottom: agentOpen ? '1px solid rgba(46,204,113,0.15)' : undefined,
      }}>
        {/* 顶行：图标 + 标题 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ fontSize: 26, marginRight: 14, flexShrink: 0, marginTop: 2 }}>🌱</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* 标题 + badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: '#1A1A1A' }}>种薯</span>
              <span style={{ background: '#2ECC71', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 4, letterSpacing: '0.05em' }}>APP</span>
            </div>
            {/* 副标题 */}
            <div style={{ fontSize: 13, color: 'rgba(26,26,26,0.5)', marginBottom: 8 }}>小红书商家种草营销 Agent · AI内容生产工具</div>
            {/* 标签行 */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['AI产品', 'C端', '小红书'].map(t => (
                <span key={t} style={{ background: 'rgba(46,204,113,0.1)', color: '#2ECC71', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, whiteSpace: 'nowrap' }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
        {/* 产品介绍 */}
        <div style={{
          padding: '12px 14px', marginBottom: 12,
          background: 'rgba(46,204,113,0.04)', borderRadius: 10,
          borderLeft: '3px solid rgba(46,204,113,0.3)',
        }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#1A1A1A', marginBottom: 4 }}>
            种薯：让每一次种草都有价值
          </div>
          <div style={{ fontSize: 12, color: 'rgba(26,26,26,0.6)', lineHeight: 1.8, marginBottom: 10 }}>
            种薯是一款面向品牌、个人和达人的 AI 种草工具，用对的内容卖出更好的成绩。解决种草选题、笔记、推广、运营的全链路问题。
          </div>
          {[
            { role: '品牌', desc: '不知道哪个卖点能打动消费者、内容团队产出慢——种薯帮品牌快速找到高转化的种草角度，批量生成符合平台调性的推广文案。' },
            { role: '个人', desc: '想分享购物体验但不会写、没人看——种薯根据商品关键词生成有感染力的真实种草笔记，让每一篇分享都有传播力。' },
            { role: '达人', desc: '内容做了不少但商业变现难——种薯帮达人找到高商业价值的内容方向，提升账号的接单吸引力。' },
          ].map(({ role, desc }) => (
            <div key={role} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', background: '#2ECC71', borderRadius: 4, padding: '1px 7px', flexShrink: 0, marginTop: 2 }}>{role}</span>
              <span style={{ fontSize: 12, color: 'rgba(26,26,26,0.6)', lineHeight: 1.75 }}>{desc}</span>
            </div>
          ))}
        </div>
        {/* 底行：两个 CTA 按钮 */}
        <div style={{ display: 'flex', gap: 10 }}>
          {/* 体验 Agent — 浅色幽灵按钮 */}
          <button
            onClick={() => setAgentOpen(v => !v)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: agentOpen ? 'rgba(46,204,113,0.18)' : 'rgba(46,204,113,0.1)',
              color: '#2ECC71',
              border: '1.5px solid rgba(46,204,113,0.3)', borderRadius: 10,
              padding: '10px 0', fontSize: 13, fontWeight: 800, cursor: 'pointer',
              transition: 'all 0.18s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(46,204,113,0.18)' }}
            onMouseLeave={e => { if (!agentOpen) e.currentTarget.style.background = 'rgba(46,204,113,0.1)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            {agentOpen ? '收起 Agent' : '体验 Agent'}
          </button>
          {/* 预览 APP — 深色实心按钮，引导用户 */}
          <button
            onClick={() => window.open('https://yuan808.github.io/zhongshu/\x3fv=20260420', '_blank')}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: '#2ECC71', color: '#fff',
              border: 'none', borderRadius: 10,
              padding: '10px 0', fontSize: 13, fontWeight: 800, cursor: 'pointer',
              transition: 'all 0.18s', boxShadow: '0 3px 12px rgba(46,204,113,0.35)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#27ae60' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#2ECC71' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
              <line x1="12" y1="18" x2="12" y2="18"/>
            </svg>
            预览 APP
          </button>
        </div>
      </div>

      {agentOpen && <SeedAgentPanel onClose={() => setAgentOpen(false)} />}
    </div>
  )
}

// ── Brand X 竞品分析横条 ─────────────────────────────────────
const BRAND_X_URL = 'https://yuan808.github.io/tws-Brand-X-dashboard/tws_pm_dashboard.html'
function BrandXRow() {
  const [hov, setHov] = useState(false)
  const go = () => window.open(BRAND_X_URL, '_blank')
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={go}
      style={{
        background: hov ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: `1.5px solid ${hov ? '#00BFFF55' : 'rgba(255,255,255,0.75)'}`,
        borderLeft: '4px solid #00BFFF',
        borderRadius: 16, padding: '16px 20px',
        marginBottom: 10, cursor: 'pointer',
        transition: 'all 0.22s ease',
        transform: hov ? 'translateX(4px)' : 'none',
        boxShadow: hov ? '0 6px 24px rgba(0,191,255,0.15)' : '0 2px 12px rgba(0,0,0,0.05)',
      }}
    >
      {/* 顶部信息区 — 纯竖向，避免手机端挤压 */}
      <div style={{ marginBottom: 12 }}>
        {/* 第一行：图标 + 标题 + badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 24, flexShrink: 0 }}>🎧</span>
          <span style={{ fontSize: 16, fontWeight: 900, color: '#1A1A1A' }}>Brand X 分析看板</span>
          <span style={{ background: '#00BFFF', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 4, letterSpacing: '0.05em', flexShrink: 0 }}>网页</span>
        </div>
        {/* 第二行：副标题 */}
        <div style={{ fontSize: 13, color: 'rgba(26,26,26,0.5)', marginBottom: 8 }}>头戴式耳机市场竞品拆解 · 数据可视化看板 · 差异化定位</div>
        {/* 第三行：标签 */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['竞品分析', '消费电子', '用户研究'].map(t => (
            <span key={t} style={{ background: 'rgba(0,191,255,0.1)', color: '#00BFFF', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, whiteSpace: 'nowrap' }}>{t}</span>
          ))}
        </div>
      </div>
      {/* 产品介绍 */}
      <div style={{
        padding: '12px 14px', marginBottom: 12,
        background: 'rgba(0,191,255,0.04)', borderRadius: 10,
        borderLeft: '3px solid rgba(0,191,255,0.3)',
      }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#1A1A1A', marginBottom: 6 }}>
          实时知己知彼，解决调研抓狂。
        </div>
        <div style={{ fontSize: 13, color: 'rgba(26,26,26,0.65)', lineHeight: 1.8 }}>
          将市场主流竞品的价格带分布、核心卖点矩阵、用户痛点聚类、品牌定位对比整合进一个交互式数据看板，支持多维筛选和交叉比对，帮助产品经理从「我想了解这个市场」直接跳到「我知道差异化机会在哪」。
        </div>
      </div>
      {/* 底行：查看网页按钮 — 蓝色实心，和种薯「预览 APP」等宽 */}
      <button
        onClick={e => { e.stopPropagation(); go() }}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          background: 'rgba(0,191,255,0.1)', color: '#00BFFF',
          border: '1.5px solid rgba(0,191,255,0.3)', borderRadius: 10,
          padding: '10px 0', fontSize: 13, fontWeight: 800, cursor: 'pointer',
          transition: 'all 0.18s', boxSizing: 'border-box',
        }}
        onMouseEnter={e => { e.stopPropagation(); e.currentTarget.style.background = 'rgba(0,191,255,0.18)' }}
        onMouseLeave={e => { e.stopPropagation(); e.currentTarget.style.background = 'rgba(0,191,255,0.1)' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
        </svg>
        查看网页
      </button>
    </div>
  )
}

// ── 海雀生命周期横条 ─────────────────────────────────────────
function HaiqueRow() {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center',
        background: hov ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: `1.5px solid ${hov ? '#FF3B2F55' : 'rgba(255,255,255,0.75)'}`,
        borderLeft: '4px solid #FF3B2F',
        borderRadius: 16, padding: '18px 20px',
        marginBottom: 10,
        transition: 'all 0.22s ease',
        boxShadow: hov ? '0 6px 24px rgba(255,59,47,0.12)' : '0 2px 12px rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ fontSize: 28, marginRight: 16, flexShrink: 0 }}>📡</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: '#1A1A1A', marginBottom: 3 }}>
          海雀硬件生命周期管理
          <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(26,26,26,0.35)', marginLeft: 8 }}>（脱敏）</span>
        </div>
        <div style={{ fontSize: 13, color: 'rgba(26,26,26,0.5)' }}>美团 AIoT 平台 · 设备全生命周期管理 PRD</div>
      </div>
      <div style={{ display: 'flex', gap: 6, marginRight: 16 }}>
        {['IoT', 'B端', 'PRD'].map(t => (
          <span key={t} style={{ background: 'rgba(255,59,47,0.1)', color: '#FF3B2F', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>{t}</span>
        ))}
      </div>
      <div style={{ fontSize: 11, color: 'rgba(26,26,26,0.25)', fontWeight: 600 }}>即将上线</div>
    </div>
  )
}

// ── 实习经历横条 ─────────────────────────────────────────────
function InternshipRows() {
  return (
    <div>
      {internships.map((item) => (
        <InternshipRow key={item.id} item={item} />
      ))}
    </div>
  )
}

function InternshipRow({ item }) {
  const [open, setOpen] = useState(false)
  const [hov, setHov] = useState(false)

  return (
    <div style={{ marginBottom: 8 }}>
      {/* 横条 */}
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center',
          background: open ? 'rgba(255,255,255,0.92)' : hov ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: `1.5px solid ${open || hov ? item.color + '55' : 'rgba(255,255,255,0.75)'}`,
          borderLeft: `4px solid ${item.color}`,
          borderRadius: open ? '16px 16px 0 0' : 16,
          padding: '14px 20px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: open || hov ? `0 4px 20px ${item.color}18` : '0 2px 10px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 3, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 15, fontWeight: 900, color: '#1A1A1A' }}>{item.company}</span>
            <span style={{ fontSize: 13, color: 'rgba(26,26,26,0.55)' }}>{item.role}</span>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(26,26,26,0.38)', fontWeight: 600 }}>{item.period}</div>
        </div>
        <span style={{
          background: `${item.color}12`, color: item.color,
          fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 99,
          border: `1px solid ${item.color}22`, marginRight: 12, whiteSpace: 'nowrap', flexShrink: 0,
        }}>{item.tag}</span>
        <div style={{
          fontSize: 18, color: item.color,
          transition: 'transform 0.25s ease',
          transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
          flexShrink: 0,
        }}>›</div>
      </div>

      {/* 展开详情 */}
      {open && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          border: `1.5px solid ${item.color}33`,
          borderTop: 'none',
          borderRadius: '0 0 16px 16px',
          padding: '16px 20px 18px',
          animation: 'expandIn 0.22s ease both',
        }}>
          {item.points.map((pt, i) => {
            const tagMatch = pt.match(/^【(.+?)】(.*)$/)
            return (
              <div key={i} style={{
                display: 'flex', gap: 10,
                marginBottom: i < item.points.length - 1 ? 10 : 0,
                alignItems: 'flex-start',
              }}>
                <span style={{
                  color: item.color, fontWeight: 900, fontSize: 12,
                  flexShrink: 0, lineHeight: '22px', opacity: 0.5,
                }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ fontSize: 13, lineHeight: 1.8, color: 'rgba(26,26,26,0.72)' }}>
                  {tagMatch ? (
                    <>
                      <span style={{
                        color: item.color, fontWeight: 800,
                        marginRight: 8, fontSize: 13,
                      }}>{tagMatch[1]}</span>
                      <span style={{
                        display: 'inline-block', width: 1, height: 11,
                        background: `${item.color}40`, marginRight: 8,
                        verticalAlign: 'middle', borderRadius: 1,
                      }} />
                      {tagMatch[2].trimStart()}
                    </>
                  ) : pt}
                </span>
              </div>
            )
          })}
          {/* 收起按钮 */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
            <button
              onClick={() => setOpen(false)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: `${item.color}10`, border: `1px solid ${item.color}30`,
                color: item.color, borderRadius: 99,
                padding: '5px 14px', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${item.color}20` }}
              onMouseLeave={e => { e.currentTarget.style.background = `${item.color}10` }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15"/>
              </svg>
              收起
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── 设计作品集项目横条（点击在下方展开图片）────────────────────
function DesignProjectRow({ project }) {
  const [open, setOpen] = useState(false)
  const [hov, setHov] = useState(false)

  return (
    <div style={{ marginBottom: 10 }}>
      {/* 横条 */}
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center',
          background: open ? 'rgba(255,255,255,0.92)' : hov ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: `1.5px solid ${open || hov ? project.color + '55' : 'rgba(255,255,255,0.75)'}`,
          borderLeft: `4px solid ${project.color}`,
          borderRadius: open ? '16px 16px 0 0' : 16,
          padding: '0 20px 0 0',
          cursor: 'pointer',
          transition: 'all 0.22s ease',
          overflow: 'hidden',
          boxShadow: open ? `0 4px 20px ${project.color}20` : hov ? `0 6px 24px ${project.color}20` : '0 2px 10px rgba(0,0,0,0.04)',
        }}
      >
        {/* 封面缩略图 */}
        <div style={{ width: 100, height: 64, flexShrink: 0, overflow: 'hidden', background: '#f0f0f0' }}>
          <img
            src={pg(project.coverPage)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s ease', transform: hov ? 'scale(1.05)' : 'scale(1)' }}
          />
        </div>
        <div style={{ flex: 1, padding: '0 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: project.color, marginBottom: 3, letterSpacing: '0.08em' }}>{project.part}</div>
          <div style={{ fontSize: 15, fontWeight: 900, color: '#1A1A1A' }}>{project.title}</div>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(26,26,26,0.35)', fontWeight: 600, marginRight: 12 }}>{project.pages.length} 页</div>
        <div style={{
          fontSize: 18, color: project.color,
          transition: 'transform 0.25s ease',
          transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
        }}>›</div>
      </div>

      {/* 展开区：固定高度，内部滚动 */}
      {open && (
        <>
          {/* 点击外部关闭的遮罩（透明，在内容区后面） */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed', inset: 0,
              zIndex: 10,
            }}
          />
          <div style={{
            position: 'relative',
            zIndex: 11,
            border: `1.5px solid ${project.color}44`,
            borderTop: 'none',
            borderRadius: '0 0 16px 16px',
            overflow: 'hidden',
            background: '#fff',
            height: 600,
          }}>
            {/* ✕ 悬浮在右上角，不占空间 */}
            <button
              onClick={() => setOpen(false)}
              style={{
                position: 'absolute', top: 10, right: 10, zIndex: 2,
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(6px)',
                border: 'none', cursor: 'pointer', fontSize: 14,
                color: 'rgba(26,26,26,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#FF3B2F'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.85)'; e.currentTarget.style.color = 'rgba(26,26,26,0.5)' }}
            >✕</button>

            {/* 可滚动图片区，满高 600px */}
            <div style={{
              height: '100%',
              overflowY: 'scroll',
              overflowX: 'hidden',
            }}>
              {project.pages.map((pageNum) => (
                <img
                  key={pageNum}
                  src={pg(pageNum)}
                  loading="eager"
                  style={{ display: 'block', width: '100%', height: 'auto', minHeight: 200 }}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── 主页面 ──────────────────────────────────────────────────
export default function Home({ onNavigate }) {
  const [visible, setVisible] = useState(false)
  const [toast, setToast] = useState({ show: false, text: '' })
  useEffect(() => { setTimeout(() => setVisible(true), 50) }, [])

  const showToast = (text) => {
    setToast({ show: true, text })
    setTimeout(() => setToast(t => ({ ...t, show: false })), 1800)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      overflowY: 'auto',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.35s ease',
      isolation: 'auto',
    }}>
      {/* 背景装饰 */}
      <div style={{ position: 'fixed', top: '-10%', right: '-5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,59,47,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-5%', left: '-5%', width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(46,204,113,0.14) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 780, margin: '0 auto', padding: 'clamp(36px,6vw,64px) clamp(20px,5vw,40px) 80px' }}>

        {/* ── Hero ── */}
        <div style={{ marginBottom: 48, animation: 'fadeUp 0.4s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, marginBottom: 16 }}>
            <h1 style={{ fontSize: 'clamp(38px,6vw,68px)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.02em', color: '#1A1A1A', margin: 0 }}>
              王辰源
              <br />
            <span style={{
              background: 'linear-gradient(90deg,#FF3B2F,#FF8C00,#FFD600,#2ECC71,#00BFFF,#B44DFF)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text', backgroundSize: '200% auto',
              animation: 'rainbowShift 4s linear infinite',
              fontSize: '0.72em',
            }}>Product Manager</span>
          </h1>

          {/* 弹性间隔，把照片推到右侧 */}
          <div style={{ flex: 1 }} />

          {/* 拍立得头像 */}
          <div style={{
            flexShrink: 0,
            marginTop: 4,
            transform: 'rotate(3deg)',
            transition: 'transform 0.3s ease',
            cursor: 'default',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'rotate(0deg) scale(1.04)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'rotate(3deg)'}
          >
            <img
              src="/avatar.png"
              alt="王辰源"
              style={{
                width: 'clamp(100px, 14vw, 160px)',
                height: 'auto',
                display: 'block',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.18))',
              }}
            />
          </div>
          </div>{/* end flex row */}

          <p style={{ fontSize: 15, lineHeight: 1.9, color: 'rgba(26,26,26,0.55)', maxWidth: 520, marginBottom: 20 }}>
            热爱把复杂的东西变简单，在体验中发现惊喜。<br />关注 AIoT 与 AI 产品，喜欢从用户视角出发解决真实问题。
          </p>
          {/* 联系方式 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <ContactItem
              text="18801095839"
              hoverColor="#1A1A1A"
              onCopy={showToast}
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.64A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
              }
            />
            <ContactItem
              text="18801095839"
              hoverColor="#07C160"
              onCopy={showToast}
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.5 2C4.36 2 1 5.02 1 8.75c0 1.9.84 3.61 2.19 4.83L2.5 16l2.61-1.3c.83.28 1.72.43 2.65.43.24 0 .47-.01.7-.03C8.16 14.47 8 13.74 8 13c0-3.31 3.13-6 7-6 .24 0 .47.01.7.03C15.01 4.67 12.03 2 8.5 2zm-2 3.5a1 1 0 110 2 1 1 0 010-2zm4 0a1 1 0 110 2 1 1 0 010-2zM15 8c-3.31 0-6 2.24-6 5s2.69 5 6 5c.74 0 1.44-.13 2.09-.35L19.5 19l-.88-2.63A4.93 4.93 0 0021 13c0-2.76-2.69-5-6-5zm-1.5 3a1 1 0 110 2 1 1 0 010-2zm3 0a1 1 0 110 2 1 1 0 010-2z"/>
                </svg>
              }
            />
            <ContactItem
              text="wangchenyuan808@163.com"
              hoverColor="#1A1A1A"
              onCopy={showToast}
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              }
            />
          </div>
          <CopyToast show={toast.show} text={toast.text} />
        </div>

        {/* ── 区块 1：Vibe Coding 项目 ── */}
        <div style={{ marginBottom: 40, animation: 'fadeUp 0.4s 0.08s ease both' }}>
          <SectionLabel label="Vibe Coding" color="#2ECC71" />
          <SeedRow />
          <BrandXRow />
        </div>

        {/* ── 区块 2：实习经历 ── */}
        <div style={{ marginBottom: 40, animation: 'fadeUp 0.4s 0.14s ease both' }}>
          <SectionLabel label="Internship" color="#FF3B2F" />
          <InternshipRows />
        </div>

        {/* ── 区块 3：设计作品集 ── */}
        <div style={{ animation: 'fadeUp 0.4s 0.2s ease both' }}>
          <SectionLabel label="Design Portfolio" color="#8B5E9E" />
          {designProjects.map(proj => (
            <DesignProjectRow key={proj.id} project={proj} />
          ))}
        </div>

        {/* 底部 */}
        <div style={{ marginTop: 56, fontSize: 12, color: 'rgba(26,26,26,0.25)', textAlign: 'center', fontWeight: 500 }}>
          © 2026 王辰源 · Made with React
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.5; transform:scale(1.3); }
        }
        @keyframes rainbowShift {
          0%   { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes expandIn {
          from { opacity:0; transform:scaleY(0.96); transform-origin: top; }
          to   { opacity:1; transform:scaleY(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
