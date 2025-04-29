'use client'

import {useState,useRef,useEffect,useCallback,useMemo} from 'react'
import Hls, {Level, ErrorData} from 'hls.js'
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Maximize, Minimize,
  Settings, Loader2
} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {Tooltip, TooltipProvider, TooltipTrigger, TooltipContent} from '@/components/ui/tooltip'
import {cn} from '@/lib/utils'
import type {VideoPlayerProps} from '@/types/media'

/* ------------------------------------------------------------------
 * constants + helpers
 * ----------------------------------------------------------------*/
const TEST_HLS    = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
const TEST_MP4    = 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
const TEST_POSTER = 'https://peach.blender.org/wp-content/uploads/bbb-splash.png'

const isiOS = () =>
  typeof navigator !== 'undefined' && /iP(hone|od|ad)/.test(navigator.userAgent)

const throttle = <T extends (...args:any)=>void>(fn:T, ms=500) => {
  let timer = false
  return (...a:Parameters<T>)=>{
    if(timer) return
    timer = true
    fn(...a)
    setTimeout(()=>{timer=false}, ms)
  }
}

/* ------------------------------------------------------------------
 * Video Player component
 * ----------------------------------------------------------------*/
export default function VideoPlayer({
  src,
  videoUrl,
  title,
  poster,
  initialTime = 0,
  onTimeUpdate,
  autoPlay = false,
  onEnded,
  isHLS = true,             // true nếu chuỗi .m3u8
  useCustomControls = true,  // sẽ tắt trên iOS bên dưới
  useTestVideo = false,
  subtitles = []             // [{src,label,lang,default?}]
}: VideoPlayerProps & {subtitles?: {src:string;label:string;lang:string;default?:boolean}[]}) {
  /* ----------------------------------------------------------------
   * decide source & flags
   * --------------------------------------------------------------*/
  const videoSrc = useMemo(() => {
    if (useTestVideo) return TEST_HLS
    return src || videoUrl || ''
  }, [useTestVideo, src, videoUrl])

  const testMode = useMemo(() => useTestVideo || !videoSrc, [useTestVideo, videoSrc])
  const displayTitle = useMemo(() => (
    testMode ? 'Video Test: Big Buck Bunny' : (title || 'Đang phát')
  ), [testMode, title])

  const hlsStream = useMemo(() => videoSrc.endsWith('.m3u8'), [videoSrc])
  const custom = useCustomControls && !isiOS()   // iOS = native control

  /* ----------------------------------------------------------------
   * refs & basic state
   * --------------------------------------------------------------*/
  const vRef = useRef<HTMLVideoElement>(null)
  const cRef = useRef<HTMLDivElement>(null)
  const hlsRef = useRef<Hls|null>(null)

  const [playing, setPlaying]   = useState(false)
  const [dur,     setDur]       = useState(0)
  const [time,    setTime]      = useState(initialTime)
  const [wait,    setWait]      = useState(false)
  const [vol,     setVol]       = useState(1)
  const [muted,   setMuted]     = useState(false)
  const [levels,  setLevels]    = useState<Level[]>([])
  const [level,   setLevel]     = useState(-1)            // -1 = auto
  const [full,    setFull]      = useState(false)
  const [fatalErr,setFatalErr]  = useState(false)

  /* ----------------------------------------------------------------
   * progress callback (throttled)
   * --------------------------------------------------------------*/
  const emitProgress = useCallback(throttle((t:number)=>onTimeUpdate?.(t),500),[onTimeUpdate])

  /* ----------------------------------------------------------------
   * baseline listeners
   * --------------------------------------------------------------*/
  useEffect(()=>{
    const v = vRef.current
    if(!v) return
    v.currentTime = initialTime

    const onDur    = () => setDur(v.duration || 0)
    const onTime   = () => { setTime(v.currentTime); emitProgress(v.currentTime) }
    const onPlay   = () => setPlaying(true)
    const onPause  = () => setPlaying(false)
    const onWait   = () => setWait(true)
    const onPlayng = () => setWait(false)
    const onVol    = () => { setVol(v.volume); setMuted(v.muted) }
    const onEnd    = () => onEnded?.()

    v.addEventListener('durationchange',onDur)
    v.addEventListener('timeupdate',onTime)
    v.addEventListener('play',onPlay)
    v.addEventListener('pause',onPause)
    v.addEventListener('waiting',onWait)
    v.addEventListener('playing',onPlayng)
    v.addEventListener('volumechange',onVol)
    v.addEventListener('ended',onEnd)
    return ()=>{
      v.removeEventListener('durationchange',onDur)
      v.removeEventListener('timeupdate',onTime)
      v.removeEventListener('play',onPlay)
      v.removeEventListener('pause',onPause)
      v.removeEventListener('waiting',onWait)
      v.removeEventListener('playing',onPlayng)
      v.removeEventListener('volumechange',onVol)
      v.removeEventListener('ended',onEnd)
    }
  },[initialTime, emitProgress, onEnded])

  /* ----------------------------------------------------------------
   * init / destroy HLS.js
   * --------------------------------------------------------------*/
  useEffect(()=>{
    const v = vRef.current
    if(!v || !videoSrc) return
    if(hlsRef.current){ hlsRef.current.destroy(); hlsRef.current=null }

    // Native HLS (Safari / iOS)
    if(!hlsStream || v.canPlayType('application/vnd.apple.mpegurl')){
      v.src = testMode ? TEST_MP4 : videoSrc
      return
    }

    if(Hls.isSupported()){
      const h = new Hls({ startLevel:-1, backBufferLength:60, enableWorker:true })
      h.attachMedia(v)
      h.loadSource(videoSrc)
      h.on(Hls.Events.MANIFEST_PARSED,(_,d)=> setLevels(d.levels))
      h.on(Hls.Events.LEVEL_SWITCHED,(_,d)=> setLevel(d.level))
      h.on(Hls.Events.ERROR,(_e,d:ErrorData)=>{
        if(!d.fatal) return
        if(d.type === Hls.ErrorTypes.MEDIA_ERROR){ h.recoverMediaError(); return }
        setFatalErr(true); h.destroy()
      })
      hlsRef.current = h
    }
    return ()=>{ hlsRef.current?.destroy(); hlsRef.current=null }
  },[videoSrc, hlsStream, testMode])

  /* ----------------------------------------------------------------
   * helpers UI
   * --------------------------------------------------------------*/
  const jump = (s:number)=>{ const v=vRef.current; if(!v) return; v.currentTime=Math.min(Math.max(0,v.currentTime+s), dur) }
  const fmt  = (s:number)=>{ const m=Math.floor(s/60), ss=Math.floor(s%60); return `${m}:${ss.toString().padStart(2,'0')}` }

  const togglePlay = ()=>{ const v=vRef.current; if(!v) return; v.paused? v.play(): v.pause() }
  const toggleMute = ()=>{ const v=vRef.current; if(!v) return; v.muted = !v.muted }

  const setLvl = (idx:number)=>{
    if(!hlsRef.current) return
    if(idx===-1){ hlsRef.current.currentLevel = -1; setLevel(-1); return }
    hlsRef.current.currentLevel = idx
  }

  const fullScreen = ()=>{
    const el = cRef.current
    if(!el) return
    if(!document.fullscreenElement){ el.requestFullscreen(); setFull(true) }
    else { document.exitFullscreen(); setFull(false) }
  }

  /* ----------------------------------------------------------------
   * JSX
   * --------------------------------------------------------------*/
  return (
    <div ref={cRef} className="relative w-full aspect-video bg-black overflow-hidden rounded-lg group">
      {/* ----------------- video tag ----------------- */}
      <video
        ref={vRef}
        className="absolute inset-0 w-full h-full object-contain bg-black"
        poster={''}
        controls={!custom}
        playsInline
        autoPlay={autoPlay}
        preload="auto"
        title={displayTitle}
        onClick={custom?togglePlay:undefined}
      >
        {subtitles.map((t,i)=>(
          <track key={i} src={t.src} label={t.label} kind="subtitles" srcLang={t.lang} default={t.default} />
        ))}
      </video>

      {/* badge & error */}
      {testMode && <span className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-semibold px-2 py-0.5 rounded">Test</span>}
      {fatalErr && <div className="absolute inset-0 bg-black/75 flex items-center justify-center text-red-400">Không phát được video</div>}

      {/* ----------------- Custom controls ----------------- */}
      {custom && (
        <>
          {/*   CENTER overlay play / pause   */}
          {!playing && !wait && (
            <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center text-white/70 hover:text-white transition-colors">
              <Play className="h-20 w-20 drop-shadow-xl" />
            </button>
          )}

          {/* BUFFER */}
          {wait && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-16 w-16 text-amber-400 animate-spin" />
            </div>
          )}

          {/* bottom bar */}
          <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/85 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* progress */}
            <input
              className="w-full h-2 appearance-none rounded-full bg-gray-700/60 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400"
              min={0} max={dur||0} step={0.1}
              value={time}
              onChange={e=>{ const v=vRef.current; if(v) v.currentTime=parseFloat(e.target.value) }}
              style={{backgroundImage:`linear-gradient(to right,#f59e0b ${(time/(dur||1))*100}%,#4b5563 ${(time/(dur||1))*100}%)`}}
            />

            {/* control row */}
            <div className="flex justify-between items-center mt-2 text-white select-none">
              {/* left cluster */}
              <div className="flex items-center gap-3">
                <Button size="icon" variant="ghost" className="text-white hover:text-amber-400" aria-label="play" onClick={togglePlay}>
                  {playing? <Pause className="h-6 w-6"/> : <Play className="h-6 w-6"/>}
                </Button>
                <Button size="icon" variant="ghost" className="text-white hover:text-amber-400" onClick={()=>jump(-10)} aria-label="-10s">
                  <SkipBack className="h-5 w-5"/>
                </Button>
                <Button size="icon" variant="ghost" className="text-white hover:text-amber-400" onClick={()=>jump(10)} aria-label="+10s">
                  <SkipForward className="h-5 w-5"/>
                </Button>
                {/* volume */}
                <div className="flex items-center gap-2 group">
                  <Button size="icon" variant="ghost" className="text-white hover:text-amber-400" onClick={toggleMute}>
                    {muted||vol===0? <VolumeX className="h-5 w-5"/> : <Volume2 className="h-5 w-5"/>}
                  </Button>
                  <input
                    type="range" min={0} max={1} step={0.01}
                    value={muted?0:vol}
                    onChange={e=>{ const v=vRef.current; if(!v) return; v.volume=parseFloat(e.target.value); v.muted=Number(e.target.value)===0 }}
                    className="w-20 h-1.5 appearance-none rounded bg-gray-700/60 cursor-pointer group-hover:block hidden [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  />
                  <span className="text-xs tabular-nums ml-2 w-20">{fmt(time)} / {fmt(dur)}</span>
                </div>
              </div>

              {/* right cluster */}
              <div className="flex items-center gap-3">
                {/* quality */}
                {levels.length>0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-xs flex items-center gap-1 hover:text-amber-400">
                      {level===-1? 'Auto': `${levels[level]?.height}p`} <Settings className="h-4 w-4"/>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-white text-sm">
                    <DropdownMenuItem onClick={()=>setLvl(-1)} className={cn('cursor-pointer', level===-1 && 'bg-amber-500/20 text-amber-400')}>Auto</DropdownMenuItem>
                    {levels.map((l,i)=>(
                      <DropdownMenuItem key={i} onClick={()=>setLvl(i)} className={cn('cursor-pointer', level===i && 'bg-amber-500/20 text-amber-400')}>{l.height}p</DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* fullscreen */}
                <Button size="icon" variant="ghost" className="text-white hover:text-amber-400" onClick={fullScreen}>
                  {full? <Minimize className="h-5 w-5"/> : <Maximize className="h-5 w-5"/>}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
