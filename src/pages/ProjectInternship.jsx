import { useState, useEffect } from 'react'

const internships = [
  {
    index: '01', company: '美团', role: 'CLC智能硬件 · 海雀AIoT平台产品经理',
    period: '2026.02 — 至今', color: '#FF3B2F', logo: '🛵',
    tags: ['IoT', 'B端产品', '硬件PRD', '海雀AIoT'],
    desc: '在CLC智能硬件团队，负责海雀AIoT平台产品经理工作。主导生命周期管理、设备管理中心、视频中心等核心模块，参与产品规划、功能梳理、需求评审及跨部门协调。',
    highlights: [
      '负责海雀AIoT平台设备管理中心、生命周期管理等核心模块需求梳理与PRD编写',
      '主导外卖智能头盔、出餐宝等硬件产品全链路需求设计，按时推进研发排期',
      '参与海雀平台租户体系设计评审，推动B端产品规范化建设',
    ],
  },
  {
    index: '02', company: '科大讯飞', role: '运营与AI智能办公平台产品经理',
    period: '2025.11 — 2026.01', color: '#FF8C00', logo: '🎙️',
    tags: ['AI产品', 'B端SaaS', '智能办公', '运营'],
    desc: '在科大讯飞AI智能办公平台方向，负责AI功能的产品设计与运营策略，推动AI能力在企业级办公场景中的落地，提升用户对AI工具的使用效率与留存。',
    highlights: [
      '参与AI智能办公平台核心功能模块的产品迭代，输出需求文档与交互方案',
      '通过数据分析定位AI功能使用瓶颈，提出优化策略并推动落地',
      '协助运营团队设计用户增长方案，提升功能渗透率',
    ],
  },
  {
    index: '03', company: '百度', role: '智能云 · AIGC儿童教育产品经理',
    period: '2024.10 — 2025.03', color: '#4DAAFF', logo: '🔵',
    tags: ['AIGC', 'C端产品', '儿童教育', 'AI应用'],
    desc: '在百度智能云业务组，负责AIGC儿童教育产品方向，探索AI在儿童内容生成、个性化学习等场景的产品化落地，参与产品从概念到验证的全流程。',
    highlights: [
      '参与儿童AI教育产品核心功能设计，输出用户旅程地图与产品原型',
      '结合AIGC能力设计内容生成流程，提升内容产出效率35%',
      '通过用户测试收集反馈，迭代优化交互体验，NPS提升12分',
    ],
  },
]

export default function ProjectInternship({ onBack }) {
  const [visible, setVisible] = useState(false)
  const [active, setActive] = useState(0)
  useEffect(() => { setTimeout(() => setVisible(true), 50) }, [])

  const curr = internships[active]

  return (
    <div style={{
      position: 'fixed', inset: 0,
      overflowY: 'auto',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.35s ease',
    }}>
      <div style={{ maxWidth: 840, margin: '0 auto', padding: 'clamp(32px,6vw,64px) clamp(20px,5vw,48px)' }}>
        <BackBtn onBack={onBack} />

        {/* Header */}
        <div style={{
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(24px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
          border: '1.5px solid rgba(255,59,47,0.25)',
          borderRadius: 28, padding: '28px 24px', marginBottom: 20,
          boxShadow: '0 8px 32px rgba(255,59,47,0.08)',
        }}>
          <Tag color="#FF3B2F" label="职业经历" />
          <h1 style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 900, margin: '12px 0 10px', color: '#1A1A1A' }}>
            💼 实习经历
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(26,26,26,0.55)', lineHeight: 1.8 }}>
            4 段横跨 C 端产品、B 端工具、IoT 平台与创业公司的成长经历，每一段都是一次全新的视角拓展。
          </p>
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* 左侧 Tab */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 152 }}>
            {internships.map((item, i) => (
              <button key={i} onClick={() => setActive(i)} style={{
                background: active === i
                  ? `${item.color}15`
                  : 'rgba(255,255,255,0.5)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: `2px solid ${active === i ? item.color : 'rgba(255,255,255,0.7)'}`,
                borderRadius: 16, padding: '12px 14px',
                textAlign: 'left', cursor: 'pointer',
                transition: 'all 0.22s ease',
                boxShadow: active === i
                  ? `0 4px 16px ${item.color}25`
                  : '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                <div style={{ fontSize: 10, color: item.color, fontWeight: 800, marginBottom: 3 }}>{item.index}</div>
                <div style={{ fontSize: 14, fontWeight: active === i ? 800 : 500, color: '#1A1A1A' }}>
                  {item.logo} {item.company}
                </div>
              </button>
            ))}
          </div>

          {/* 右侧内容 */}
          <div style={{ flex: 1, minWidth: 260 }} key={active}>
            <div style={{
              background: 'rgba(255,255,255,0.6)',
              backdropFilter: 'blur(24px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
              border: `1.5px solid ${curr.color}30`,
              borderRadius: 24, padding: '24px 22px',
              boxShadow: `0 8px 32px ${curr.color}12`,
              animation: 'fadeIn 0.28s ease both',
            }}>
              {/* 顶部彩条 */}
              <div style={{
                height: 4, borderRadius: '12px 12px 0 0',
                background: `linear-gradient(90deg,${curr.color},${curr.color}66)`,
                margin: '-24px -22px 20px',
                borderRadius: '22px 22px 0 0',
              }} />

              <div style={{ display: 'flex', gap: 14, marginBottom: 18 }}>
                <div style={{
                  width: 50, height: 50, borderRadius: 14,
                  background: `${curr.color}18`,
                  border: `1.5px solid ${curr.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, flexShrink: 0,
                }}>{curr.logo}</div>
                <div>
                  <div style={{ fontSize: 19, fontWeight: 900, color: '#1A1A1A' }}>{curr.company}</div>
                  <div style={{ fontSize: 13, color: curr.color, fontWeight: 700, marginBottom: 2 }}>{curr.role}</div>
                  <div style={{ fontSize: 12, color: 'rgba(26,26,26,0.4)', fontWeight: 600 }}>{curr.period}</div>
                </div>
              </div>

              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 18 }}>
                {curr.tags.map(t => (
                  <span key={t} style={{
                    background: `${curr.color}12`, color: curr.color,
                    fontSize: 11, fontWeight: 700, padding: '4px 11px', borderRadius: 99,
                    border: `1px solid ${curr.color}25`,
                  }}>{t}</span>
                ))}
              </div>

              <p style={{
                fontSize: 14, lineHeight: 1.85, color: 'rgba(26,26,26,0.65)',
                marginBottom: 18,
                borderLeft: `3px solid ${curr.color}`,
                paddingLeft: 14,
              }}>{curr.desc}</p>

              <div style={{ fontSize: 12, fontWeight: 800, color: 'rgba(26,26,26,0.35)', marginBottom: 10, letterSpacing: '0.08em' }}>
                ✦ 主要成果
              </div>
              {curr.highlights.map((h, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 10, marginBottom: 9,
                  background: `${curr.color}08`,
                  border: `1px solid ${curr.color}20`,
                  borderRadius: 11, padding: '10px 14px',
                }}>
                  <span style={{ color: curr.color, fontWeight: 900, flexShrink: 0, fontSize: 13 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span style={{ fontSize: 14, color: 'rgba(26,26,26,0.72)', lineHeight: 1.6 }}>{h}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ height: 48 }} />
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  )
}

function BackBtn({ onBack }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onBack}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        border: '1.5px solid rgba(255,255,255,0.7)',
        borderRadius: 99, padding: '8px 18px',
        fontSize: 13, fontWeight: 700, color: 'rgba(26,26,26,0.65)',
        marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6,
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)', transition: 'all 0.2s',
      }}>← 返回</button>
  )
}

function Tag({ color, label }) {
  return (
    <span style={{
      display: 'inline-block',
      background: `${color}15`, color,
      fontSize: 11, fontWeight: 800, letterSpacing: '0.1em',
      padding: '4px 12px', borderRadius: 99, border: `1px solid ${color}30`,
    }}>{label}</span>
  )
}
