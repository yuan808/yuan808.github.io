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
    index: '02', company: '科大讯飞', role: '中国移动 · AI合成内容风控产品经理',
    period: '2025.11 — 2026.01', color: '#FF8C00', logo: '🎙️',
    tags: ['NLP', '多模态', 'B端AI', '内容风控'],
    desc: '中国移动业务中多模态数据规模激增，网信办要求对AI合成伪造等违规风险进行治理，构建机器审核体系，替代传统人工审核。风控目标：实现图文、音视频合成内容精准识别，形成"识别—处置—溯源—震慑"全流程治理闭环。',
    highlights: [
      '【需求梳理】图文、音视频数据样本收录，更新特征库，提取文本语义冲突、图像面部畸变、音频频谱异常、视频帧间不连贯等特征',
      '【验证逻辑】根据当前多模态合成数据情况，联合算法设计多模态交叉验证规则，规避单模态漏判问题',
      '【分级处置】设计处置规则体系（低危娱乐/中危误导/高危侵权），明确各级触发条件、处置动作（弹窗提醒/自动拦截/强制下架）',
      '【成效指标】AI合成伪造内容识别准确率 92% 以上，快速处置违规内容，有效遏制伪造信息传播',
    ],
  },
  {
    index: '03', company: '百度', role: '智能云 · AIGC儿童教育产品经理',
    period: '2024.10 — 2025.03', color: '#4DAAFF', logo: '🔵',
    tags: ['AIGC', 'C端产品', '儿童教育', 'AI应用'],
    desc: '小度教育名著阅读用户没兴趣、不坚持、不会用，根据教育性与趣味性需求，推动剧情驱动 AI 生成绘本与交互，以剧情驱动替代被动阅读。',
    highlights: [
      '【问题定位】通过埋点数据发现沉浸时长不足 <8min、7日留存率低 <35% 的核心问题；竞品调研 ReadKidz、StoryBird.ai、childbook.ai、豆包等 AI 绘本及凯叔、Kada 在用户分层、内容生成与互动机制上的对比，确定方向为"以剧情驱动替代被动阅读"',
      '【产品方案】设计"剧情拆解—绘本生成—多模态输出"AI 内容生产流程，整理教学目标、互动生成脚本、绘本内容的产品规范与验收标准',
      '【Prompt】从内容的连贯性、趣味性与教学有效性制定剧集拆解、场景描述、剧情交互等模块输出要求，通过多方案对比与效果评估持续调优',
      '【技术需求】向算法团队输出文心一言与 Stable Diffusion 的角色一致性、知识点难度分级、年龄认知适配、教育事实性增强等 7 大算法需求',
      '【上线效果】SDK 接入小度教育平板，灰度上线覆盖用户 10 万+；A/B 测试儿童知识答题准确率均值提升 47%，家长净推荐均值 8.1 分',
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
