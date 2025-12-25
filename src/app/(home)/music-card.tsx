'use client'

import { useState, useRef, useEffect } from 'react'
import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { CARD_SPACING } from '@/consts'
import MusicSVG from '@/svgs/music.svg'
import { HomeDraggableLayer } from './home-draggable-layer'
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react'

// 歌曲列表配置
const SONGS = [
	{ title: '圣诞音乐', url: '/music/christmas.m4a' },
	{ title: '冬日暖歌', url: '/music/christmas.m4a' },
	{ title: '新年序曲', url: '/music/christmas.m4a' },
]

export default function MusicCard() {
	const center = useCenterStore()
	const { cardStyles, siteContent } = useConfigStore()
	const styles = cardStyles.musicCard
	const hiCardStyles = cardStyles.hiCard
	const clockCardStyles = cardStyles.clockCard
	const calendarCardStyles = cardStyles.calendarCard

	const [isPlaying, setIsPlaying] = useState(false)
	const [currentIndex, setCurrentIndex] = useState(0)
	const [progress, setProgress] = useState(0)
	const audioRef = useRef<HTMLAudioElement | null>(null)

	const x = styles.offsetX !== null ? center.x + styles.offsetX : center.x + CARD_SPACING + hiCardStyles.width / 2 - styles.offset
	const y = styles.offsetY !== null ? center.y + styles.offsetY : center.y - clockCardStyles.offset + CARD_SPACING + calendarCardStyles.height + CARD_SPACING

	// 初始化与事件监听
	useEffect(() => {
		if (!audioRef.current) audioRef.current = new Audio()
		const audio = audioRef.current

		const updateProgress = () => {
			if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100)
		}
		const handleEnded = () => nextSong()

		audio.addEventListener('timeupdate', updateProgress)
		audio.addEventListener('ended', handleEnded)
		return () => {
			audio.removeEventListener('timeupdate', updateProgress)
			audio.removeEventListener('ended', handleEnded)
		}
	}, [])

	// 切歌逻辑
	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.src = SONGS[currentIndex].url
			if (isPlaying) audioRef.current.play().catch(console.error)
			setProgress(0)
		}
	}, [currentIndex])

	// 播放暂停逻辑
	useEffect(() => {
		if (!audioRef.current) return
		isPlaying ? audioRef.current.play().catch(console.error) : audioRef.current.pause()
	}, [isPlaying])

	const nextSong = () => setCurrentIndex((prev) => (prev + 1) % SONGS.length)
	const prevSong = () => setCurrentIndex((prev) => (prev - 1 + SONGS.length) % SONGS.length)

	// 点击背景进度条跳转
	const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!audioRef.current || !audioRef.current.duration) return
		const rect = e.currentTarget.getBoundingClientRect()
		const clickX = e.clientX - rect.left
		const newProgress = clickX / rect.width
		audioRef.current.currentTime = newProgress * audioRef.current.duration
		setProgress(newProgress * 100)
	}

	return (
		<HomeDraggableLayer cardKey='musicCard' x={x} y={y} width={styles.width} height={styles.height}>
			<Card order={styles.order} width={styles.width} height={styles.height} x={x} y={y} className='relative flex items-center gap-3 overflow-hidden px-4'>
				
				{/* 背景进度条层：点击此处可调节进度 */}
				<div 
					className='absolute inset-0 z-0 cursor-pointer bg-white/5 transition-colors hover:bg-white/10' 
					onClick={handleProgressClick}
				>
					<div 
						className='bg-white/20 h-full transition-all duration-300 ease-linear' 
						style={{ width: `${progress}%` }} 
					/>
				</div>

				{/* 圣诞装饰 */}
				{siteContent.enableChristmas && (
					<img src='/images/christmas/snow-10.webp' alt='snow' className='pointer-events-none absolute left-[-8px] top-[-12px] z-20 w-[120px] opacity-80' />
				)}

				{/* 内容层 */}
				<MusicSVG className='relative z-10 h-8 w-8 shrink-0 text-white' />

				<div className='relative z-10 flex-1 overflow-hidden'>
					<div className='truncate text-sm font-medium text-white select-none'>
						{SONGS[currentIndex].title}
					</div>
					{/* 辅助进度细条 */}
					<div className='mt-1.5 h-1 w-full rounded-full bg-white/20 overflow-hidden'>
						<div className='h-full bg-white transition-all' style={{ width: `${progress}%` }} />
					</div>
				</div>

				{/* 按钮控制区 */}
				<div className='relative z-20 flex items-center gap-1'>
					<button onClick={prevSong} className='flex h-8 w-8 items-center justify-center rounded-full text-white/80 hover:bg-white/20 hover:text-white active:scale-90 transition-all'>
						<SkipBack size={18} fill="currentColor" />
					</button>

					<button 
						onClick={() => setIsPlaying(!isPlaying)} 
						className='flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-600 shadow-lg hover:scale-105 active:scale-95 transition-all'
					>
						{isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className='ml-1' />}
					</button>

					<button onClick={nextSong} className='flex h-8 w-8 items-center justify-center rounded-full text-white/80 hover:bg-white/20 hover:text-white active:scale-90 transition-all'>
						<SkipForward size={18} fill="currentColor" />
					</button>
				</div>
			</Card>
		</HomeDraggableLayer>
	)
}
