'use client'

import { useState, useRef, useEffect } from 'react'
import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { CARD_SPACING } from '@/consts'
import MusicSVG from '@/svgs/music.svg'
import PlaySVG from '@/svgs/play.svg'
import { HomeDraggableLayer } from './home-draggable-layer'
import { Pause } from 'lucide-react'

const MUSIC_FILES = ['/music/christmas.m4a', '/music/2.mp3']

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
	const currentIndexRef = useRef(0)
	
	// 用于处理多击的 ref
	const clickCountRef = useRef(0)
	const clickTimerRef = useRef<NodeJS.Timeout | null>(null)

	const x = styles.offsetX !== null ? center.x + styles.offsetX : center.x + CARD_SPACING + hiCardStyles.width / 2 - styles.offset
	const y = styles.offsetY !== null ? center.y + styles.offsetY : center.y - clockCardStyles.offset + CARD_SPACING + calendarCardStyles.height + CARD_SPACING

	useEffect(() => {
		if (!audioRef.current) audioRef.current = new Audio()
		const audio = audioRef.current

		const updateProgress = () => {
			if (audio.duration) {
				setProgress((audio.currentTime / audio.duration) * 100)
			}
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
		currentIndexRef.current = currentIndex
		if (audioRef.current) {
			const wasPlaying = isPlaying
			audioRef.current.src = MUSIC_FILES[currentIndex]
			if (wasPlaying) audioRef.current.play().catch(console.error)
		}
	}, [currentIndex])

	useEffect(() => {
		if (!audioRef.current) return
		isPlaying ? audioRef.current.play().catch(console.error) : audioRef.current.pause()
	}, [isPlaying])

	// --- 交互逻辑 ---

	const nextSong = () => {
		setCurrentIndex((prev) => (prev + 1) % MUSIC_FILES.length)
	}

	const prevSong = () => {
		setCurrentIndex((prev) => (prev - 1 + MUSIC_FILES.length) % MUSIC_FILES.length)
	}

	const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation()
		if (!audioRef.current || !audioRef.current.duration) return

		const rect = e.currentTarget.getBoundingClientRect()
		const clickX = e.clientX - rect.left
		const width = rect.width
		const newTime = (clickX / width) * audioRef.current.duration
		
		audioRef.current.currentTime = newTime
		setProgress((clickX / width) * 100)
	}

	// 2. 处理卡片多击事件
	const handleCardInteraction = () => {
		clickCountRef.current += 1

		if (clickTimerRef.current) clearTimeout(clickTimerRef.current)

		clickTimerRef.current = setTimeout(() => {
			if (clickCountRef.current === 2) {
				nextSong() // 双击下一首
			} else if (clickCountRef.current === 3) {
				prevSong() // 三击上一首
			}
			clickCountRef.current = 0
		}, 300) // 300ms 内的点击判定为连续点击
	}

	return (
		<HomeDraggableLayer cardKey='musicCard' x={x} y={y} width={styles.width} height={styles.height}>
			<Card 
				order={styles.order} 
				width={styles.width} 
				height={styles.height} 
				x={x} 
				y={y} 
				className='flex items-center gap-3 cursor-pointer select-none'
				onClick={handleCardInteraction} // 卡片点击判定
			>
				{siteContent.enableChristmas && (
					<>
						<img src='/images/christmas/snow-10.webp' alt='decoration' className='pointer-events-none absolute' style={{ width: 120, left: -8, top: -12, opacity: 0.8 }} />
						<img src='/images/christmas/snow-11.webp' alt='decoration' className='pointer-events-none absolute' style={{ width: 80, right: -10, top: -12, opacity: 0.8 }} />
					</>
				)}

				<MusicSVG className='h-8 w-8 pointer-events-none' />

				<div className='flex-1'>
					<div className='text-secondary text-sm font-medium'>
						{currentIndex === 0 ? '圣诞音乐' : `歌曲 ${currentIndex + 1}`}
					</div>

					{/* 进度条容器：增加了 padding 增大点击热区，并添加点击事件 */}
					<div 
						className='mt-2 h-4 flex items-center cursor-pointer' 
						onClick={handleProgressClick}
					>
						<div className='h-1.5 w-full rounded-full bg-white/30 overflow-hidden'>
							<div 
								className='bg-white h-full rounded-full transition-all duration-100' 
								style={{ width: `${progress}%` }} 
							/>
						</div>
					</div>
				</div>

				<button 
					onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }} 
					className='relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white transition-transform active:scale-95'
				>
					{isPlaying ? <Pause className='text-blue-500 h-4 w-4' /> : <PlaySVG className='text-blue-500 ml-1 h-4 w-4' />}
				</button>
			</Card>
		</HomeDraggableLayer>
	)
}
