'use client'

import { useState, useRef, useEffect } from 'react'
import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import MusicSVG from '@/svgs/music.svg'
import { HomeDraggableLayer } from './home-draggable-layer'
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react'

// 歌曲列表
const SONGS = [
	{ title: '圣诞音乐', url: '/music/christmas.m4a' },
	{ title: '新年序曲', url: '/music/newyear.m4a' },
	{ title: '冬日暖歌', url: '/music/winter.m4a' },
]

export default function MusicCard() {
	const center = useCenterStore()
	const { cardStyles, siteContent } = useConfigStore()
	const styles = cardStyles.musicCard

	const [isPlaying, setIsPlaying] = useState(false)
	const [currentIndex, setCurrentIndex] = useState(0)
	const [progress, setProgress] = useState(0)
	const audioRef = useRef<HTMLAudioElement | null>(null)

	// --- 核心修改：坐标定位 ---
	// 让卡片水平居中 (center.x)，垂直方向位于底部附近
	const x = center.x - styles.width / 2
	// y 坐标：假设屏幕底部是 center.y * 2，减去卡片高度再向上偏移一段距离 (如 80px)
	const y = (center.y * 2) - styles.height - 80 

	// 初始化音频事件
	useEffect(() => {
		if (!audioRef.current) audioRef.current = new Audio()
		const audio = audioRef.current

		const updateProgress = () => {
			if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100)
		}

		audio.addEventListener('timeupdate', updateProgress)
		audio.addEventListener('ended', () => nextSong())
		return () => {
			audio.removeEventListener('timeupdate', updateProgress)
		}
	}, [])

	// 切换歌曲源
	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.src = SONGS[currentIndex].url
			if (isPlaying) audioRef.current.play().catch(console.error)
			setProgress(0)
		}
	}, [currentIndex])

	// 播放暂停控制
	useEffect(() => {
		if (!audioRef.current) return
		isPlaying ? audioRef.current.play().catch(console.error) : audioRef.current.pause()
	}, [isPlaying])

	const nextSong = () => setCurrentIndex((prev) => (prev + 1) % SONGS.length)
	const prevSong = () => setCurrentIndex((prev) => (prev - 1 + SONGS.length) % SONGS.length)

	// 点击背景调节进度
	const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!audioRef.current || !audioRef.current.duration) return
		const rect = e.currentTarget.getBoundingClientRect()
		const clickX = e.clientX - rect.left
		const newTime = (clickX / rect.width) * audioRef.current.duration
		audioRef.current.currentTime = newTime
	}

	return (
		<HomeDraggableLayer cardKey='musicCard' x={x} y={y} width={styles.width} height={styles.height}>
			<Card 
				order={styles.order} 
				width={styles.width} 
				height={styles.height} 
				x={x} 
				y={y} 
				className='relative flex items-center px-4 overflow-hidden group cursor-pointer'
				onClick={handleSeek}
			>
				{/* 1. 全背景进度条（底色） */}
				<div 
					className="absolute inset-0 pointer-events-none transition-all duration-300"
					style={{
						background: `linear-gradient(to right, rgba(255,255,255,0.15) ${progress}%, transparent ${progress}%)`
					}}
				/>

				{/* 2. 圣诞积雪装饰 */}
				{siteContent.enableChristmas && (
					<>
						<img src='/images/christmas/snow-10.webp' alt='snow' className='pointer-events-none absolute left-[-8px] top-[-14px] z-30 w-[110px]' />
						<img src='/images/christmas/snow-11.webp' alt='snow' className='pointer-events-none absolute right-[-10px] top-[-14px] z-30 w-[80px]' />
					</>
				)}

				{/* 3. 左侧图标 */}
				<MusicSVG className='relative z-10 h-8 w-8 shrink-0 mr-4' />

				{/* 4. 中间文字和进度细条 */}
				<div className='relative z-10 flex-1 min-w-0 flex flex-col justify-center'>
					<div className='truncate text-sm font-medium text-white select-none'>
						{SONGS[currentIndex].title}
					</div>
					<div className='mt-2 h-1 w-24 rounded-full bg-white/20 overflow-hidden'>
						<div className='h-full bg-white transition-all' style={{ width: `${progress}%` }} />
					</div>
				</div>

				{/* 5. 右侧控制按钮组 */}
				<div 
					className='relative z-40 flex items-center gap-2 ml-2' 
					onClick={(e) => e.stopPropagation()} // 防止点击按钮触发背景切歌
				>
					<button onClick={prevSong} className='p-1 text-white/60 hover:text-white transition-all active:scale-90'>
						<SkipBack size={20} fill="currentColor" />
					</button>

					<button 
						onClick={() => setIsPlaying(!isPlaying)} 
						className='flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-600 shadow-xl hover:scale-105 active:scale-95 transition-all'
					>
						{isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className='ml-1' />}
					</button>

					<button onClick={nextSong} className='p-1 text-white/60 hover:text-white transition-all active:scale-90'>
						<SkipForward size={20} fill="currentColor" />
					</button>
				</div>
			</Card>
		</HomeDraggableLayer>
	)
}
