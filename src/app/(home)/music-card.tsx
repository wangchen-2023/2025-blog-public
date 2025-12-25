'use client'

import { useState, useRef, useEffect } from 'react'
import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { CARD_SPACING } from '@/consts'
import MusicSVG from '@/svgs/music.svg'
import { HomeDraggableLayer } from './home-draggable-layer'
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react'

const SONGS = [
	{ title: '圣诞音乐', url: '/music/christmas.m4a' },
	{ title: '冬日暖歌', url: '/music/winter.m4a' },
	{ title: '新年序曲', url: '/music/newyear.m4a' },
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

	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.src = SONGS[currentIndex].url
			if (isPlaying) audioRef.current.play().catch(console.error)
			setProgress(0)
		}
	}, [currentIndex])

	useEffect(() => {
		if (!audioRef.current) return
		isPlaying ? audioRef.current.play().catch(console.error) : audioRef.current.pause()
	}, [isPlaying])

	const nextSong = () => setCurrentIndex((prev) => (prev + 1) % SONGS.length)
	const prevSong = () => setCurrentIndex((prev) => (prev - 1 + SONGS.length) % SONGS.length)

	// 处理点击整个卡片背景调节进度
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
			<Card order={styles.order} width={styles.width} height={styles.height} x={x} y={y} className='relative flex items-center gap-3 px-4 overflow-hidden'>
				
				{/* 1. 进度条背景层 - 铺满全卡片，点击可切进度 */}
				<div 
					className='absolute inset-0 z-0 cursor-pointer' 
					onClick={handleProgressClick}
				>
					{/* 进度染色块 */}
					<div 
						className='bg-white/10 h-full transition-all duration-300 ease-linear' 
						style={{ width: `${progress}%` }} 
					/>
				</div>

				{/* 2. 圣诞装饰 - 提高层级 z-30 */}
				{siteContent.enableChristmas && (
					<>
						<img src='/images/christmas/snow-10.webp' alt='snow' className='pointer-events-none absolute left-[-8px] top-[-12px] z-30 w-[110px] opacity-90' />
						<img src='/images/christmas/snow-11.webp' alt='snow' className='pointer-events-none absolute right-[-10px] top-[-12px] z-30 w-[70px] opacity-90' />
					</>
				)}

				{/* 3. 内容展示层 - z-10 确保在进度条之上 */}
				<MusicSVG className='relative z-10 h-8 w-8 shrink-0' />

				<div className='relative z-10 flex-1 flex flex-col justify-center min-w-0'>
					<div className='truncate text-sm font-medium text-white/90 select-none'>
						{SONGS[currentIndex].title}
					</div>
					{/* 底部细长的进度条辅助视觉 */}
					<div className='mt-2 h-1 w-24 rounded-full bg-white/20 overflow-hidden'>
						<div className='h-full bg-white transition-all' style={{ width: `${progress}%` }} />
					</div>
				</div>

				{/* 4. 按钮控制层 - z-20 确保按钮点击不被拦截 */}
				<div className='relative z-20 flex items-center gap-1 shrink-0' onClick={(e) => e.stopPropagation()}>
					<button onClick={prevSong} className='p-1 text-white/70 hover:text-white transition-colors active:scale-90'>
						<SkipBack size={18} fill="currentColor" />
					</button>

					<button 
						onClick={() => setIsPlaying(!isPlaying)} 
						className='flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-600 shadow-md hover:scale-105 active:scale-95 transition-all mx-1'
					>
						{isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className='ml-1' />}
					</button>

					<button onClick={nextSong} className='p-1 text-white/70 hover:text-white transition-colors active:scale-90'>
						<SkipForward size={18} fill="currentColor" />
					</button>
				</div>
			</Card>
		</HomeDraggableLayer>
	)
}
