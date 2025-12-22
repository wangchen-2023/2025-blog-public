'use client'

import { useState, useRef, useEffect } from 'react'
import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { CARD_SPACING } from '@/consts'
import MusicSVG from '@/svgs/music.svg'
import PlaySVG from '@/svgs/play.svg'
import { HomeDraggableLayer } from './home-draggable-layer'
import { Pause, SkipBack, SkipForward, X, ChevronUp, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils' // 假设你有cn工具函数，用于类名拼接

// 扩展音乐数据：包含标题、歌手、地址、歌词
const MUSIC_LIST = [
  {
    id: 1,
    title: "圣诞快乐歌",
    artist: "圣诞合唱团",
    src: "/music/christmas.m4a",
    cover: "/images/christmas/cover1.jpg", // 音乐封面图
    lyrics: [
      ["00:00.000", "铃儿响叮当 圣诞多快乐"],
      ["00:05.200", "雪花飘满天 钟声敲呀敲"],
      ["00:10.500", "驯鹿跑起来 礼物送过来"],
      ["00:15.100", "圣诞树上灯 闪闪放光明"],
      ["00:20.400", "大家来唱歌 快乐没尽头"],
      ["00:25.300", "祝你圣诞快乐 新年更美好"],
    ],
  },
  {
    id: 2,
    title: "冬日序曲",
    artist: "冬日乐队",
    src: "/music/christmas.m4a",
    cover: "/images/christmas/cover2.jpg",
    lyrics: [
      ["00:00.000", "冬日的风 吹过窗边"],
      ["00:06.100", "雪花飘落 覆盖思念"],
      ["00:12.400", "炉火温暖 故事开篇"],
      ["00:18.200", "冬日序曲 轻轻蔓延"],
      ["00:24.500", "星光点点 照亮夜晚"],
    ],
  },
  {
    id: 3,
    title: "雪之梦",
    artist: "钢琴诗人",
    src: "/music/christmas.m4a",
    cover: "/images/christmas/cover3.jpg",
    lyrics: [
      ["00:00.000", "纯音乐：雪之梦"],
      ["00:08.000", "（钢琴声起 温柔悠扬）"],
      ["00:16.000", "（旋律如雪花飞舞）"],
      ["00:24.000", "（节奏轻柔 沁人心脾）"],
      ["00:32.000", "（高潮来临 情感升华）"],
      ["00:40.000", "（渐弱收尾 余韵悠长）"],
    ],
  },
];

// 时间戳转秒数工具函数 (格式：00:05.200 → 5.2)
const timeToSeconds = (timeStr: string): number => {
  const [minSec, ms] = timeStr.split('.');
  const [minutes, seconds] = minSec.split(':').map(Number);
  return minutes * 60 + seconds + Number(ms) / 1000;
};

export default function MusicCard() {
  const center = useCenterStore()
  const { cardStyles, siteContent } = useConfigStore()
  const styles = cardStyles.musicCard
  const hiCardStyles = cardStyles.hiCard
  const clockCardStyles = cardStyles.clockCard
  const calendarCardStyles = cardStyles.calendarCard

  // 播放器核心状态
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [isPlayerOpen, setIsPlayerOpen] = useState(false) // 大播放器弹窗状态
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0) // 当前歌词索引

  // 引用
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const currentIndexRef = useRef(0)
  const lyricContainerRef = useRef<HTMLDivElement>(null) // 歌词容器引用

  // 小卡片位置计算（保持原有逻辑）
  const x = styles.offsetX !== null 
    ? center.x + styles.offsetX 
    : center.x + CARD_SPACING + hiCardStyles.width / 2 - styles.offset
  const y = styles.offsetY !== null 
    ? center.y + styles.offsetY 
    : center.y - clockCardStyles.offset + CARD_SPACING + calendarCardStyles.height + CARD_SPACING

  // 初始化音频元素
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
    }
    const audio = audioRef.current
    audio.volume = volume

    // 更新进度条
    const updateProgress = () => {
      if (audio.duration) {
        const currentProgress = (audio.currentTime / audio.duration) * 100
        setProgress(currentProgress)
        
        // 同步歌词
        const currentMusic = MUSIC_LIST[currentIndexRef.current]
        for (let i = 0; i < currentMusic.lyrics.length; i++) {
          const lyricTime = timeToSeconds(currentMusic.lyrics[i][0])
          const nextLyricTime = i + 1 < currentMusic.lyrics.length 
            ? timeToSeconds(currentMusic.lyrics[i + 1][0]) 
            : audio.duration
          
          if (audio.currentTime >= lyricTime && audio.currentTime < nextLyricTime) {
            if (currentLyricIndex !== i) {
              setCurrentLyricIndex(i)
              // 歌词滚动动画：让当前歌词居中
              lyricContainerRef.current?.scrollTo({
                top: i * 40 - (lyricContainerRef.current.clientHeight / 2) + 20,
                behavior: 'smooth'
              })
            }
            break
          }
        }
      }
    }

    // 音乐结束自动切歌
    const handleEnded = () => {
      handleNext()
    }

    // 绑定事件
    audio.addEventListener('timeupdate', updateProgress)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateProgress)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [currentLyricIndex, volume])

  // 切换音乐时加载资源
  useEffect(() => {
    currentIndexRef.current = currentIndex
    const currentMusic = MUSIC_LIST[currentIndex]
    if (audioRef.current) {
      const wasPlaying = !audioRef.current.paused
      audioRef.current.pause()
      audioRef.current.src = currentMusic.src
      audioRef.current.loop = false
      setProgress(0)
      setCurrentLyricIndex(0)

      if (wasPlaying) {
        audioRef.current.play().catch(console.error)
      }
    }
  }, [currentIndex])

  // 播放/暂停状态同步
  useEffect(() => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.play().catch(console.error)
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying])

  // 音量控制
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  // 组件卸载清理
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [])

  // 播放/暂停切换
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  // 上一曲
  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + MUSIC_LIST.length) % MUSIC_LIST.length)
  }

  // 下一曲
  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % MUSIC_LIST.length)
  }

  // 进度条点击跳转
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percent = clickX / rect.width
    audioRef.current.currentTime = percent * audioRef.current.duration
    setProgress(percent * 100)
  }

  // 音量调节
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value))
  }

  const currentMusic = MUSIC_LIST[currentIndex]

  return (
    <>
      {/* 小卡片播放器 */}
      <HomeDraggableLayer cardKey='musicCard' x={x} y={y} width={styles.width} height={styles.height}>
        <Card 
          order={styles.order} 
          width={styles.width} 
          height={styles.height} 
          x={x} 
          y={y} 
          className='relative flex items-center gap-3 overflow-hidden'
        >
          {/* 圣诞装饰 */}
          {siteContent.enableChristmas && (
            <>
              <img
                src='/images/christmas/snow-10.webp'
                alt='Christmas decoration'
                className='pointer-events-none absolute'
                style={{ width: 120, left: -8, top: -12, opacity: 0.8 }}
              />
              <img
                src='/images/christmas/snow-11.webp'
                alt='Christmas decoration'
                className='pointer-events-none absolute'
                style={{ width: 80, right: -10, top: -12, opacity: 0.8 }}
              />
            </>
          )}

          {/* 右上箭头指引 */}
          <button 
            onClick={() => setIsPlayerOpen(true)}
            className='absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-brand hover:bg-white transition-all'
            title='打开大播放器'
          >
            <ChevronUp className='h-4 w-4' />
          </button>

          <MusicSVG className='h-8 w-8 ml-2' />
          <div className='flex-1 mr-2'>
            <div className='text-secondary text-sm truncate'>{currentMusic.title}</div>
            <div className='mt-1 h-2 rounded-full bg-white/60 cursor-pointer' onClick={handleProgressClick}>
              <div 
                className='bg-linear h-full rounded-full transition-all duration-300' 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>
          <button 
            onClick={togglePlayPause} 
            className='flex h-10 w-10 items-center justify-center rounded-full bg-white transition-opacity hover:opacity-80 mr-2'
          >
            {isPlaying ? <Pause className='text-brand h-4 w-4' /> : <PlaySVG className='text-brand ml-1 h-4 w-4' />}
          </button>
        </Card>
      </HomeDraggableLayer>

      {/* 大播放器弹窗 */}
      {isPlayerOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4'>
          <div className='w-full max-w-2xl rounded-2xl bg-gradient-to-b from-indigo-50 to-purple-50 shadow-2xl overflow-hidden'>
            {/* 播放器头部 */}
            <div className='flex items-center justify-between p-4 border-b border-gray-200'>
              <h3 className='text-xl font-bold text-brand'>音乐播放器</h3>
              <button 
                onClick={() => setIsPlayerOpen(false)}
                className='h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors'
              >
                <X className='h-4 w-4 text-gray-600' />
              </button>
            </div>

            {/* 播放器主体 */}
            <div className='p-6 flex flex-col md:flex-row gap-6'>
              {/* 音乐封面 */}
              <div className='w-full md:w-1/3 aspect-square rounded-xl overflow-hidden shadow-lg'>
                <img 
                  src={currentMusic.cover} 
                  alt={`${currentMusic.title}封面`} 
                  className='w-full h-full object-cover'
                />
              </div>

              {/* 播放控制+歌词 */}
              <div className='w-full md:w-2/3 flex flex-col gap-6'>
                {/* 歌曲信息 */}
                <div>
                  <h2 className='text-2xl font-bold text-gray-800'>{currentMusic.title}</h2>
                  <p className='text-gray-500 mt-1'>{currentMusic.artist}</p>
                </div>

                {/* 歌词区域 */}
                <div 
                  ref={lyricContainerRef}
                  className='flex-1 overflow-y-auto h-64 rounded-lg bg-white/50 p-4 shadow-inner'
                >
                  {currentMusic.lyrics.map(([time, text], index) => (
                    <div 
                      key={index}
                      className={cn(
                        'text-center py-2 text-gray-700 transition-all duration-300',
                        currentLyricIndex === index && 'text-brand text-lg font-bold scale-105'
                      )}
                    >
                      {text}
                    </div>
                  ))}
                </div>

                {/* 进度条 */}
                <div className='space-y-2'>
                  <div 
                    className='h-3 rounded-full bg-gray-200 cursor-pointer' 
                    onClick={handleProgressClick}
                  >
                    <div 
                      className='h-full rounded-full bg-brand transition-all duration-300' 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className='flex justify-between text-xs text-gray-500'>
                    <span>{Math.floor(audioRef.current?.currentTime || 0)}/{Math.floor(audioRef.current?.duration || 0)}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                </div>

                {/* 播放控制按钮 */}
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Volume2 className='h-5 w-5 text-gray-600' />
                    <input
                      type='range'
                      min='0'
                      max='1'
                      step='0.01'
                      value={volume}
                      onChange={handleVolumeChange}
                      className='w-24 h-2'
                    />
                  </div>
                  
                  <div className='flex items-center gap-4'>
                    <button 
                      onClick={handlePrev}
                      className='h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors'
                    >
                      <SkipBack className='h-5 w-5 text-gray-600' />
                    </button>
                    <button 
                      onClick={togglePlayPause}
                      className='h-14 w-14 rounded-full bg-brand text-white flex items-center justify-center hover:bg-brand/90 transition-colors shadow-lg'
                    >
                      {isPlaying ? <Pause className='h-6 w-6' /> : <PlaySVG className='h-6 w-6 ml-1' />}
                    </button>
                    <button 
                      onClick={handleNext}
                      className='h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors'
                    >
                      <SkipForward className='h-5 w-5 text-gray-600' />
                    </button>
                  </div>
                  
                  <div className='w-24'></div> {/* 占位，平衡布局 */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
