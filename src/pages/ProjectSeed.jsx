import { useState, useEffect } from 'react'

const ACCENT = '#2ECC71'

const features = [
  {
    icon: '🧑‍💼', who: '个人卖家',
    title: '一键生成种草笔记',
    desc: '上传商品图 + 关键词，AI 自动生成符合小红书风格的笔记文案，配标签、封面，省去创作烦恼。',
    color: '#2ECC71',
  },
  {
    icon: '🌟', who: '推广达人',
    title: '风格化内容定制',
    desc: '基于达人的历史笔记风格，生成高度拟合的种草内容，保持人设连贯，提升粉丝黏性。',
    color: '#FF3B2F',
  },
  {
    icon: '🏢', who: '品牌主理人',
    title: '品牌专属投放策略',
    desc: '分析竞品内容矩阵，规划品牌种草节奏，输出多款差异化内容方向供选择。',
    color: '#B44DFF',
  },
]

const flows = [
  { step: '01', label: '输入商品 / 品牌信息', color: '#FF3B2F' },
  { step: '02', label: 'AI 分析目标受众',     color: '#FF8C00' },
  { step: '03', label: '生成多版本内容',       color: '#2ECC71' },
  { step: '04', label: '一键发布 or 导出',     color: '#B44DFF' },
]

export default function ProjectSeed({ onBack }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 50) }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0,
      overflowY: 'auto',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.35s ease',
    }}>
      <div style={{ maxWidth: 780, margin: '0 auto', padding: 'clamp(32px,6vw,64px) clamp(20px,5vw,48px)' }}>

        <BackBtn onBack={onBack} />

        {/* Header 玻璃卡片 */}
        <div style={{
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(24px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
          border: '1.5px solid rgba(46,204,113,0.35)',
          borderRadius: 28,
          padding: '32px 28px',
          marginBottom: 24,
          boxShadow: '0 8px 32px rgba(46,204,113,0.12)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* 右上角装饰 */}
          <div style={{
            position: 'absolute', top: -40, right: -40,
            width: 160, height: 160, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(46,204,113,0.2) 0%, transparent 70%)',
          }} />
          <Tag color={ACCENT} label="产品设计" />
          <h1 style={{ fontSize: 'clamp(28px,4.5vw,48px)', fontWeight: 900, margin: '12px 0 8px', color: '#1A1A1A' }}>
            🌱 种薯
          </h1>
          <p style={{ fontSize: 17, color: ACCENT, fontWeight: 700, marginBottom: 12 }}>
            小红书商家种草营销 Agent 工具
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(26,26,26,0.6)', maxWidth: 520 }}>
            为小红书平台上的个人卖家、推广达人和品牌主理人，打造一个 AI 驱动的内容种草工具，
            让"种草"从繁琐变成一件轻松的事。
          </p>
        </div>

        {/* 背景 */}
        <GlassSection title="背景与问题" accent={ACCENT}>
          <p style={{ fontSize: 15, lineHeight: 1.9, color: 'rgba(26,26,26,0.65)' }}>
            小红书平台的商业化内容生产门槛逐渐升高：个人卖家缺乏文案能力、达人难以规模化创作、
            品牌投放缺少系统化策略。<strong style={{ color: '#1A1A1A' }}>种薯</strong>
            正是为了打破这三类用户的创作瓶颈而生。
          </p>
        </GlassSection>

        {/* 三类用户 */}
        <GlassSection title="用户分层设计" accent={ACCENT}>
          <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))' }}>
            {features.map(f => (
              <div key={f.who} style={{
                background: `${f.color}10`,
                border: `1.5px solid ${f.color}30`,
                borderRadius: 18, padding: '20px 18px',
              }}>
                <div style={{ fontSize: 30, marginBottom: 8 }}>{f.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: f.color, marginBottom: 6 }}>{f.who}</div>
                <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 8, color: '#1A1A1A' }}>{f.title}</div>
                <div style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(26,26,26,0.6)' }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </GlassSection>

        {/* 核心流程 */}
        <GlassSection title="核心使用流程" accent={ACCENT}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            {flows.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  background: `${f.color}15`,
                  border: `1.5px solid ${f.color}40`,
                  borderRadius: 14, padding: '12px 16px', textAlign: 'center', minWidth: 130,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: f.color, marginBottom: 4, letterSpacing: '0.1em' }}>STEP {f.step}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>{f.label}</div>
                </div>
                {i < flows.length - 1 && <span style={{ color: '#ccc', fontSize: 18 }}>→</span>}
              </div>
            ))}
          </div>
        </GlassSection>

        {/* 核心亮点 */}
        <GlassSection title="核心亮点" accent={ACCENT}>
          {[
            ['🎯', '精准分层', '三类用户独立产品逻辑，避免功能堆砌，聚焦各自核心诉求', '#FF3B2F'],
            ['⚡', '极速出内容', '从上传商品到生成完整笔记，全程不超过 30 秒', '#FF8C00'],
            ['🔄', '风格迁移', '基于用户历史内容分析，生成高度贴合个人风格的新内容', '#2ECC71'],
            ['📊', '数据反哺', '发布后的互动数据实时回流，持续优化后续生成质量', '#B44DFF'],
          ].map(([icon, title, desc, c]) => (
            <div key={title} style={{
              display: 'flex', gap: 14, marginBottom: 12,
              background: `${c}0D`, border: `1.5px solid ${c}25`,
              borderRadius: 14, padding: '14px 16px',
            }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
              <div>
                <div style={{ fontWeight: 800, marginBottom: 3, color: '#1A1A1A' }}>{title}</div>
                <div style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(26,26,26,0.6)' }}>{desc}</div>
              </div>
            </div>
          ))}
        </GlassSection>

        <div style={{ height: 40 }} />
      </div>
    </div>
  )
}

function BackBtn({ onBack }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onBack}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        border: '1.5px solid rgba(255,255,255,0.7)',
        borderRadius: 99, padding: '8px 18px',
        fontSize: 13, fontWeight: 700, color: 'rgba(26,26,26,0.65)',
        marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6,
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        transition: 'all 0.2s',
      }}>
      ← 返回
    </button>
  )
}

function Tag({ color, label }) {
  return (
    <span style={{
      display: 'inline-block',
      background: `${color}15`, color,
      fontSize: 11, fontWeight: 800, letterSpacing: '0.1em',
      padding: '4px 12px', borderRadius: 99,
      border: `1px solid ${color}30`,
    }}>{label}</span>
  )
}

function GlassSection({ title, accent, children }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.5)',
      backdropFilter: 'blur(20px) saturate(1.6)',
      WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
      border: '1.5px solid rgba(255,255,255,0.7)',
      borderRadius: 24, padding: '24px 22px',
      marginBottom: 16,
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <div style={{ width: 4, height: 20, borderRadius: 2, background: accent, flexShrink: 0 }} />
        <h2 style={{ fontSize: 17, fontWeight: 900, color: '#1A1A1A' }}>{title}</h2>
      </div>
      {children}
    </div>
  )
}
