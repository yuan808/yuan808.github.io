import { useEffect, useRef, useState } from 'react'

export default function Intro({ onDone }) {
  const canvasRef = useRef(null)
  const [phase, setPhase] = useState('run') // run | greet
  const [nameVisible, setNameVisible] = useState(false)
  const [hiVisible, setHiVisible] = useState(false)
  const [hiAnim, setHiAnim] = useState('bounce')
  const phaseRef = useRef('run')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // HiDPI
    const dpr = window.devicePixelRatio || 1
    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    const W = () => window.innerWidth
    const H = () => window.innerHeight

    // ── 运动状态 ──────────────────────────────────────────────
    let x = -100           // 小人中心 X
    let bobY = 0           // 垂直弹跳偏移
    let bobPhase = 0       // 弹跳相位
    let legPhase = 0       // 腿的摆动相位
    let scaleX = 1         // 水平拉伸（冲刺拉长）
    let scaleY = 1         // 垂直压缩

    // 加速度曲线：先极速加速冲出画面
    let startTime = null
    const DURATION = 900   // ms，比之前快一倍

    // 残影队列
    const trails = []

    // ── 绘制小人 ─────────────────────────────────────────────
    function drawCharacter(cx, cy, sx, sy, lPhase, alpha = 1) {
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.translate(cx, cy)
      ctx.scale(sx, sy)

      const W_BODY = 56, H_BODY = 56
      const bx = -W_BODY / 2, by = -H_BODY / 2

      // ── 腿（画在 body 下方，先画）──
      // 左腿
      const legLen = 38
      const legW = 11
      const legAngleL = Math.sin(lPhase) * 45         // 摆幅 ±45°
      const legAngleR = Math.sin(lPhase + Math.PI) * 45

      // 左腿
      ctx.save()
      ctx.translate(-14, H_BODY / 2)
      ctx.rotate((legAngleL * Math.PI) / 180)
      ctx.beginPath()
      ctx.roundRect(-legW / 2, 0, legW, legLen, legW / 2)
      ctx.fillStyle = '#2ECC71'
      ctx.fill()
      ctx.restore()

      // 右腿
      ctx.save()
      ctx.translate(14, H_BODY / 2)
      ctx.rotate((legAngleR * Math.PI) / 180)
      ctx.beginPath()
      ctx.roundRect(-legW / 2, 0, legW, legLen, legW / 2)
      ctx.fillStyle = '#2ECC71'
      ctx.fill()
      ctx.restore()

      // ── 身体 ──
      ctx.beginPath()
      ctx.roundRect(bx, by, W_BODY, H_BODY, 10)
      ctx.fillStyle = '#FF3B2F'
      ctx.fill()

      // ── 眼睛（跑步时眯成一条线，充满紧迫感）──
      const eyeSquint = Math.min(Math.abs(sx - 1) * 6, 0.7) // 拉伸时眯眼
      // 左眼
      ctx.save()
      ctx.translate(-14, -6)
      ctx.scale(1, 1 - eyeSquint * 0.7)
      ctx.beginPath()
      ctx.arc(0, 0, 6, 0, Math.PI * 2)
      ctx.fillStyle = '#0D0D0D'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(1.5, -1.5, 2, 0, Math.PI * 2)
      ctx.fillStyle = 'white'
      ctx.fill()
      ctx.restore()

      // 右眼
      ctx.save()
      ctx.translate(14, -6)
      ctx.scale(1, 1 - eyeSquint * 0.7)
      ctx.beginPath()
      ctx.arc(0, 0, 6, 0, Math.PI * 2)
      ctx.fillStyle = '#0D0D0D'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(1.5, -1.5, 2, 0, Math.PI * 2)
      ctx.fillStyle = 'white'
      ctx.fill()
      ctx.restore()

      // ── 嘴巴（跑步咧嘴，拼命的感觉）──
      ctx.beginPath()
      ctx.moveTo(-10, 16)
      ctx.quadraticCurveTo(0, 26 + eyeSquint * 6, 10, 16)
      ctx.strokeStyle = '#0D0D0D'
      ctx.lineWidth = 2.5
      ctx.lineCap = 'round'
      ctx.stroke()

      // ── 速度线（身体左侧）──
      if (alpha > 0.5) {
        const lines = [
          { y: -10, len: 18 + Math.random() * 10 },
          { y: 2,   len: 24 + Math.random() * 12 },
          { y: 14,  len: 14 + Math.random() * 8 },
        ]
        lines.forEach(l => {
          ctx.beginPath()
          ctx.moveTo(bx - 6, l.y)
          ctx.lineTo(bx - 6 - l.len, l.y)
          ctx.strokeStyle = 'rgba(46,204,113,0.6)'
          ctx.lineWidth = 2
          ctx.lineCap = 'round'
          ctx.stroke()
        })
      }

      ctx.restore()
    }

    // ── 主循环 ────────────────────────────────────────────────
    let raf
    function loop(ts) {
      if (!startTime) startTime = ts
      const elapsed = ts - startTime
      const t = Math.min(elapsed / DURATION, 1)

      // 超强加速曲线：cubic ease-in（越跑越快）
      const easeIn = t * t * t
      const targetX = W() + 120
      x = -100 + easeIn * (targetX + 100)

      // 速度（用于动态效果）
      const speed = (3 * t * t) / DURATION * (targetX + 100) // dx/dt 近似

      // 腿摆速度随速度变快
      legPhase += 0.22 + t * 0.18

      // 弹跳：起跑时小幅，加速后大幅，身体上下蹦
      bobPhase += 0.28 + t * 0.15
      bobY = Math.sin(bobPhase * 2) * (4 + t * 10)

      // squash & stretch：跑快时水平拉伸、垂直压缩
      const stretchAmount = t * 0.45
      scaleX = 1 + stretchAmount
      scaleY = 1 - stretchAmount * 0.35

      // 倾斜角度（冲刺时身体前倾）
      const tiltAngle = t * 18 * (Math.PI / 180)

      // 清屏
      ctx.clearRect(0, 0, W(), H())

      // 地面参考线（细腻的彩色线，随速度变宽）
      const lineY = H() / 2 + 40
      const grd = ctx.createLinearGradient(0, 0, W(), 0)
      grd.addColorStop(0, '#FFD600')
      grd.addColorStop(0.33, '#FF4D8D')
      grd.addColorStop(0.66, '#4DAAFF')
      grd.addColorStop(1, '#3DFFA0')
      ctx.beginPath()
      ctx.moveTo(0, lineY)
      ctx.lineTo(W(), lineY)
      ctx.strokeStyle = grd
      ctx.lineWidth = 2 + t * 3
      ctx.globalAlpha = 0.25 + t * 0.2
      ctx.stroke()
      ctx.globalAlpha = 1

      // 残影（每帧往队列推一个，淡出）
      if (t < 0.95) {
        trails.push({ x, y: H() / 2 - 20 + bobY, alpha: 0.28, sx: scaleX, sy: scaleY, lp: legPhase })
      }
      // 绘制并衰减残影
      for (let i = trails.length - 1; i >= 0; i--) {
        const tr = trails[i]
        ctx.save()
        ctx.translate(tr.x, tr.y)
        ctx.rotate(tiltAngle * 0.6)
        ctx.translate(-tr.x, -tr.y)
        drawCharacter(tr.x, tr.y, tr.sx * 0.9, tr.sy, tr.lp, tr.alpha)
        ctx.restore()
        tr.alpha -= 0.045
        if (tr.alpha <= 0) trails.splice(i, 1)
      }

      // 主角
      ctx.save()
      ctx.translate(x, H() / 2 - 20 + bobY)
      ctx.rotate(tiltAngle)
      ctx.translate(-x, -(H() / 2 - 20 + bobY))
      drawCharacter(x, H() / 2 - 20 + bobY, scaleX, scaleY, legPhase)
      ctx.restore()

      if (t < 1) {
        raf = requestAnimationFrame(loop)
      } else {
        // 跑完，清屏，播放打招呼
        ctx.clearRect(0, 0, W(), H())
        phaseRef.current = 'greet'
        setPhase('greet')
        setTimeout(() => {
          setNameVisible(true)
          setHiVisible(true)
          setTimeout(() => setHiAnim('fly'), 1400)
          setTimeout(() => onDone(), 2300)
        }, 80)
      }
    }

    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(135deg,#d4f5c4 0%,#e8f5e3 35%,#fff0ee 70%,#ffe0d0 100%)',
      overflow: 'hidden',
    }}>
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, display: phase === 'run' ? 'block' : 'none' }}
      />

      {/* "我是王辰源" */}
      {nameVisible && (
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          animation: 'fadeUp 0.55s cubic-bezier(0.34,1.3,0.64,1) both',
          pointerEvents: 'none',
        }}>
          <p style={{
            fontSize: 'clamp(32px,5vw,58px)',
            fontWeight: 900,
            letterSpacing: '0.04em',
            color: '#1A1A1A',
            lineHeight: 1,
          }}>
            我是<span style={{
              color: '#FF3B2F',
              textShadow: '0 0 40px rgba(255,59,47,0.3)',
              WebkitTextStroke: '0px',
            }}>王辰源</span>
          </p>
        </div>
      )}

      {/* Hi～ 气泡 */}
      {hiVisible && (
        <div style={{
          position: 'absolute',
          top: 'calc(50% - 110px)',
          left: '50%',
          pointerEvents: 'none',
          animation: hiAnim === 'bounce'
            ? 'bubblePop 0.5s cubic-bezier(0.34,1.7,0.64,1) both'
            : 'bubbleFly 0.65s cubic-bezier(0.4,0,0.6,1) both',
        }}>
          <div style={{
            background: '#2ECC71',
            color: '#fff',
            fontWeight: 900,
            fontSize: 24,
            padding: '10px 24px',
            borderRadius: 999,
            position: 'relative',
            whiteSpace: 'nowrap',
            boxShadow: '0 6px 30px rgba(46,204,113,0.45)',
            transform: 'translateX(-50%)',
          }}>
            Hi～
            <span style={{
              position: 'absolute',
              bottom: -13, left: '50%',
              transform: 'translateX(-50%)',
              width: 0, height: 0,
              borderLeft: '9px solid transparent',
              borderRight: '9px solid transparent',
              borderTop: '14px solid #2ECC71',
            }} />
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translate(-50%,-40%) scale(0.9); }
          to   { opacity:1; transform:translate(-50%,-50%) scale(1); }
        }
        @keyframes bubblePop {
          0%   { opacity:0; transform:translateX(-50%) scale(0.1) rotate(-8deg); }
          65%  { opacity:1; transform:translateX(-50%) scale(1.12) rotate(3deg); }
          100% { opacity:1; transform:translateX(-50%) scale(1) rotate(0deg); }
        }
        @keyframes bubbleFly {
          0%   { opacity:1; transform:translateX(-50%) translateY(0) scale(1) rotate(0deg); }
          30%  { opacity:1; transform:translateX(-30%) translateY(-40px) scale(1.05) rotate(-5deg); }
          100% { opacity:0; transform:translateX(300px) translateY(-400px) scale(0.2) rotate(25deg); }
        }
      `}</style>
    </div>
  )
}
