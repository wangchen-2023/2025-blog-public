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

const MUSIC_FILES = ['/music/christmas.m4a']

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
	const [isDragging, setIsDragging] = useState(false) // 新增：标记是否正在拖动进度条
	const audioRef = useRef<HTMLAudioElement | null>(null)
	const currentIndexRef = useRef(0)
	const progressBarRef = useRef<HTMLDivElement>(null) // 新增：进度条容器的ref

	const x = styles.offsetX !== null ? center.x + styles.offsetX : center.x + CARD_SPACING + hiCardStyles.width / 2 - styles.offset
	const y = styles.offsetY !== null ? center.y + styles.offsetY : center.y - clockCardStyles.offset + CARD_SPACING + calendarCardStyles.height + CARD_SPACING

	// Initialize audio element
	useEffect(() => {
		if (!audioRef.current) {
			audioRef.current = new Audio()
		}

		const audio = audioRef.current

		const updateProgress = () => {
			// 新增：拖动时不更新进度，避免冲突
			if (!isDragging && audio.duration) {
				setProgress((audio.currentTime / audio.duration) * 100)
			}
		}

		const handleEnded = () => {
			const nextIndex = (currentIndexRef.current + 1) % MUSIC_FILES.length
			currentIndexRef.current = nextIndex
			setCurrentIndex(nextIndex)
			setProgress(0)
		}

		const handleTimeUpdate = () => {
			updateProgress()
		}

		const handleLoadedMetadata = () => {
			updateProgress()
		}

		audio.addEventListener('timeupdate', handleTimeUpdate)
		audio.addEventListener('ended', handleEnded)
		audio.addEventListener('loadedmetadata', handleLoadedMetadata)

		return () => {
			audio.removeEventListener('timeupdate', handleTimeUpdate)
			audio.removeEventListener('ended', handleEnded)
			audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
		}
	}, [isDragging]) // 新增：依赖isDragging

	// Handle currentIndex change - load new audio
	useEffect(() => {
		currentIndexRef.current = currentIndex
		if (audioRef.current) {
			const wasPlaying = !audioRef.current.paused
			audioRef.current.pause()
			audioRef.current.src = MUSIC_FILES[currentIndex]
			audioRef.current.loop = false
			setProgress(0)

			if (wasPlaying) {
				audioRef.current.play().catch(console.error)
			}
		}
	}, [currentIndex])

	// Handle play/pause state change
	useEffect(() => {
		if (!audioRef.current) return

		if (isPlaying) {
			audioRef.current.play().catch(console.error)
		} else {
			audioRef.current.pause()
		}
	}, [isPlaying])

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (audioRef.current) {
				audioRef.current.pause()
				audioRef.current.src = ''
			}
		}
	}, [])

	// 新增：处理进度条点击和拖动的核心方法
	const handleProgressChange = (e: React.MouseEvent | MouseEvent) => {
		if (!audioRef.current || !progressBarRef.current) return
		
		const rect = progressBarRef.current.getBoundingClientRect()
		// 计算点击/拖动位置占进度条的百分比
		const clickX = e.clientX - rect.left
		const percent = Math.max(0, Math.min(100, (clickX / rect.width) * 100))
		
		setProgress(percent)
		// 更新音频的当前播放时间
		audioRef.current.currentTime = (audioRef.current.duration * percent) / 100
	}

	// 新增：鼠标按下开始拖动
	const handleDragStart = (e: React.MouseEvent) => {
		setIsDragging(true)
		handleProgressChange(e) // 立即更新进度
	}

	// 新增：鼠标移动时更新进度（拖动中）
	const handleDragMove = (e: MouseEvent) => {
		if (isDragging) {
			handleProgressChange(e)
		}
	}

	// 新增：鼠标松开结束拖动
	const handleDragEnd = () => {
		setIsDragging(false)
	}

	// 新增：监听全局鼠标事件，处理拖动
	useEffect(() => {
		if (isDragging) {
			document.addEventListener('mousemove', handleDragMove)
			document.addEventListener('mouseup', handleDragEnd)
		}

		return () => {
			document.removeEventListener('mousemove', handleDragMove)
			document.removeEventListener('mouseup', handleDragEnd)
		}
	}, [isDragging])

	const togglePlayPause = () => {
		setIsPlaying(!isPlaying)
	}

	return (
		<HomeDraggableLayer cardKey='musicCard' x={x} y={y} width={styles.width} height={styles.height}>
			<Card order={styles.order} width={styles.width} height={styles.height} x={x} y={y} className='flex items-center gap-3'>
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

				<MusicSVG className='h-8 w-8' />

				<div className='flex-1'>
					<div className='text-secondary text-sm'>圣诞音乐</div>

					{/* 改造进度条：添加ref、点击事件和鼠标按下事件 */}
					<div 
						ref={progressBarRef}
						className='mt-1 h-2 rounded-full bg-white/60 cursor-pointer'
						onClick={handleProgressChange} // 点击进度条跳转
						onMouseDown={handleDragStart} // 按下鼠标开始拖动
					>
						<div 
							className='bg-linear h-full rounded-full transition-all duration-300' 
							style={{ width: `${progress}%` }} 
						/>
					</div>
				</div>

				<button onClick={togglePlayPause} className='flex h-10 w-10 items-center justify-center rounded-full bg-white transition-opacity hover:opacity-80'>
					{isPlaying ? <Pause className='text-brand h-4 w-4' /> : <PlaySVG className='text-brand ml-1 h-4 w-4' />}
				</button>
			</Card>
		</HomeDraggableLayer>
	)
}
