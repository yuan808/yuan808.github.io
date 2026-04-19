import { useState, useEffect } from 'react'

const p = n => `/images/page_${String(n).padStart(2, '0')}.png`

const projects = [
  {
    id: 'plant',
    part: 'Part One',
    title: '儿童自然科普玩教具',
    color: '#5AAFD6',
    bg: '#EEF8FF',
    pages: [7,8,9,10,11,12,13,14,15,16,17,18,19,20,21],
    // page_07=封面, page_21=Rendering 最后一页
  },
  {
    id: 'drone',
    part: 'Part Two',
    title: '城市高架交通事故助手',
    color: '#E85D20',
    bg: '#FFF4EE',
    pages: [22,23,24,25,26,27,28,29,30,31,32,33,34,35,36],
    // page_22=封面, page_36=最后一页
  },
  {
    id: 'playground',
    part: 'Part Three',
    title: '趣环 — 适应性儿童游乐设施',
    color: '#4A9E5C',
    bg: '#F0FAF0',
    pages: [37,38,39,40,41,42,43,44,45,46,47,48],
    // page_37=封面, page_48=最后一页
  },
]

export default function ProjectDesign({ onBack }) {
  const [visible, setVisible] = useState(false)
  // 当前选中的项目，null = 显示目录
  const [activeId, setActiveId] = useState(null)

  useEffect(() => { setTimeout(() => setVisible(true), 50) }, [])

  const active = projects.find(p => p.id === activeId)

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: active ? active.bg : 'inherit',
      overflowY: 'auto',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.3s ease',
    }}>
      {/* ── 固定顶部导航栏 ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.6)',
        padding: '0 24px',
        height: 52,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        {/* 返回 */}
        <button
          onClick={activeId ? () => setActiveId(null) : onBack}
          style={{
            background: 'none', border: 'none',
            fontSize: 22, cursor: 'pointer', color: 'rgba(26,26,26,0.6)',
            display: 'flex', alignItems: 'center', padding: '4px 2px',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#1A1A1A'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(26,26,26,0.6)'}
        >←</button>

        {/* 面包屑 */}
        <span style={{ fontSize: 13, color: 'rgba(26,26,26,0.35)', fontWeight: 600 }}>
          设计作品集
        </span>
        {active && <>
          <span style={{ color: 'rgba(26,26,26,0.25)' }}>/</span>
          <span style={{
            fontSize: 13, fontWeight: 800,
            color: active.color,
          }}>{active.part}</span>
        </>}

        {/* 右侧项目切换 tabs（进入项目后显示）*/}
        {active && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            {projects.map(proj => (
              <button
                key={proj.id}
                onClick={() => setActiveId(proj.id)}
                style={{
                  background: activeId === proj.id ? proj.color : 'rgba(0,0,0,0.05)',
                  color: activeId === proj.id ? '#fff' : 'rgba(26,26,26,0.5)',
                  border: 'none', borderRadius: 99,
                  padding: '5px 14px', fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >{proj.part}</button>
            ))}
          </div>
        )}
      </div>

      {/* ── 目录页 ── */}
      {!active && (
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px 60px' }}>
          <h1 style={{
            fontSize: 'clamp(24px,4vw,40px)', fontWeight: 900,
            color: '#1A1A1A', marginBottom: 8,
          }}>✦ 设计作品集</h1>
          <p style={{
            fontSize: 15, color: 'rgba(26,26,26,0.5)',
            lineHeight: 1.8, marginBottom: 40, maxWidth: 480,
          }}>
            北京工业大学工业设计系三个完整项目，点击进入后上下滚动浏览全部作品页面。
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {projects.map(proj => (
              <CoverCard key={proj.id} project={proj} onClick={() => setActiveId(proj.id)} />
            ))}
          </div>
        </div>
      )}

      {/* ── 项目完整内容：大图上下滚动 ── */}
      {active && (
        <div style={{ width: '100%' }}>
          {/* 项目标题 */}
          <div style={{
            maxWidth: 860, margin: '0 auto',
            padding: '28px 24px 20px',
          }}>
            <div style={{
              fontSize: 11, fontWeight: 800, letterSpacing: '0.1em',
              color: active.color, marginBottom: 6,
            }}>{active.part}</div>
            <h2 style={{
              fontSize: 'clamp(22px,3.5vw,36px)', fontWeight: 900,
              color: '#1A1A1A',
            }}>{active.title}</h2>
            <div style={{
              fontSize: 13, color: 'rgba(26,26,26,0.4)', marginTop: 6,
            }}>共 {active.pages.length} 页 · 向下滚动浏览完整内容</div>
          </div>

          {/* 整页大图列表 */}
          <div style={{
            display: 'flex', flexDirection: 'column',
            gap: 0,
            paddingBottom: 60,
          }}>
            {active.pages.map((pageNum, i) => (
              <FullWidthPage
                key={pageNum}
                src={p(pageNum)}
                index={i}
                color={active.color}
              />
            ))}
          </div>

          {/* 底部导航 */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 12,
            padding: '20px 24px 60px',
          }}>
            {projects.map(proj => (
              <button
                key={proj.id}
                onClick={() => { setActiveId(proj.id); window.scrollTo(0, 0) }}
                style={{
                  background: proj.id === active.id ? proj.color : 'rgba(255,255,255,0.7)',
                  color: proj.id === active.id ? '#fff' : 'rgba(26,26,26,0.6)',
                  border: `1.5px solid ${proj.id === active.id ? proj.color : 'rgba(255,255,255,0.8)'}`,
                  borderRadius: 99, padding: '10px 22px',
                  fontSize: 13, fontWeight: 800, cursor: 'pointer',
                  backdropFilter: 'blur(12px)',
                  transition: 'all 0.2s',
                  boxShadow: proj.id === active.id ? `0 4px 16px ${proj.color}40` : 'none',
                }}
              >{proj.part}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── 目录封面卡片 ─────────────────────────────────────────────
function CoverCard({ project, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'stretch',
        background: hov ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `2px solid ${hov ? project.color : 'rgba(255,255,255,0.7)'}`,
        borderRadius: 20,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        transform: hov ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hov
          ? `0 16px 40px ${project.color}25`
          : '0 4px 16px rgba(0,0,0,0.06)',
      }}
    >
      {/* 封面图 */}
      <div style={{
        width: 'clamp(200px, 35%, 320px)',
        flexShrink: 0,
        background: project.bg,
        overflow: 'hidden',
        position: 'relative',
      }}>
        <img
          src={p(project.pages[0])}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform 0.4s ease',
            transform: hov ? 'scale(1.04)' : 'scale(1)',
          }}
        />
      </div>

      {/* 文字 */}
      <div style={{ padding: '28px 28px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{
          fontSize: 11, fontWeight: 800, color: project.color,
          letterSpacing: '0.12em', marginBottom: 8,
        }}>{project.part}</div>
        <h3 style={{
          fontSize: 'clamp(18px,2.5vw,26px)', fontWeight: 900,
          color: '#1A1A1A', marginBottom: 12, lineHeight: 1.2,
        }}>{project.title}</h3>
        <div style={{
          fontSize: 13, color: 'rgba(26,26,26,0.4)', fontWeight: 600, marginBottom: 20,
        }}>{project.pages.length} 页完整内容</div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: project.color, fontSize: 13, fontWeight: 800,
          transition: 'gap 0.2s',
          gap: hov ? 10 : 6,
        }}>
          进入查看 <span style={{ fontSize: 18 }}>→</span>
        </div>
      </div>
    </div>
  )
}

// ── 整页大图 ─────────────────────────────────────────────────
function FullWidthPage({ src, index, color }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div style={{
      width: '100%',
      background: loaded ? 'transparent' : 'rgba(0,0,0,0.03)',
      borderBottom: '1px solid rgba(255,255,255,0.5)',
      position: 'relative',
    }}>
      <img
        src={src}
        onLoad={() => setLoaded(true)}
        style={{
          display: 'block',
          width: '100%',
          height: 'auto',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />
      {/* 页码角标 */}
      {loaded && (
        <div style={{
          position: 'absolute', bottom: 12, right: 16,
          background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(8px)',
          fontSize: 11, fontWeight: 700,
          color: 'rgba(26,26,26,0.4)',
          padding: '3px 10px', borderRadius: 99,
          border: '1px solid rgba(255,255,255,0.8)',
        }}>{index + 1}</div>
      )}
    </div>
  )
}
