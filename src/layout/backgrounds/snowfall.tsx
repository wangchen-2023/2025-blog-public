'use client'
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'

interface Snowflake {
	id: number
	type: 'dot' | 'image' // 雪花类型：圆点/图片
	imageIndex?: number // 图片雪花的图片索引（可选，圆点雪花不需要）
	size: number // 雪花尺寸
	duration: number // 飘落一次的时长
	delay: number // 动画延迟时间
	left: number  // 水平初始位置（百分比）
	rotate: number // 旋转角度
}

const SNOWFLAKE_IMAGES = ['/images/christmas/snowflake/1.webp', '/images/christmas/snowflake/2.webp', '/images/christmas/snowflake/3.webp']
const DOT_RATIO = 0.8 // 圆点雪花占比（80%圆点，20%图片）

export default function SnowfallBackground({ zIndex, count = 125 }: { zIndex: number; count?: number }) {
	const [snowflakes, setSnowflakes] = useState<Snowflake[]>([])

	useEffect(() => {
		const generateSnowflakes = () => {
			const newSnowflakes: Snowflake[] = []
			for (let i = 0; i < count; i++) {
				const isDot = Math.random() < DOT_RATIO
				// 随机生成雪花尺寸：圆点雪花5-15px，图片雪花20-60px
				const size = isDot ? Math.random() * 10 + 5 : Math.random() * 40 + 20 
				// 随机生成飘落时长：20-40秒
				const duration = Math.random() * 20 + 20
				// 随机生成动画延迟：0-40秒
				const delay = Math.random() * 40
				// 随机生成初始水平位置：0-120%
				const left = Math.random() * 120
				const imageIndex = isDot ? undefined : Math.floor(Math.random() * SNOWFLAKE_IMAGES.length)
				// 随机生成旋转角度：180-540度（Math.random()*360生成0-360，加180后范围180-540）
				const rotate = Math.random() * 360 + 180

				newSnowflakes.push({
					id: i,
					type: isDot ? 'dot' : 'image',
					imageIndex,
					size,
					duration,
					delay,
					left,
					rotate
				})
			}
			setSnowflakes(newSnowflakes)
		}

		generateSnowflakes()
	}, [count])

	return (
		<motion.div
			animate={{ opacity: 1 }} // 目标状态,透明度1
			initial={{ opacity: 0 }} // 初始状态,透明度0
			transition={{ duration: 1 }}
			className='pointer-events-none fixed inset-0 z-0 overflow-hidden'
			style={{ zIndex }}>
			{snowflakes.map(snowflake => (
				<motion.div
					key={snowflake.id}
					className='absolute' // 绝对定位
					style={{
						top: -200, // 初始垂直位置：屏幕顶部外200px（让雪花从上方进入）
						left: `${snowflake.left}%`, // 初始水平位置
						width: `${snowflake.size}px`, // 雪花宽度
						height: `${snowflake.size}px` // 雪花高度
					}}
					initial={{ y: 0, x: 0 }} // 雪花动画初始状态：位移为0
					animate={{
						y: window.innerHeight + 200, // 垂直目标位置：屏幕底部外200px（让雪花落到下方消失）
						x: `-${(Math.random() * window.innerWidth) / 5}px`, // 水平偏移：向左随机漂移（窗口宽度的1/5内）
						rotate: snowflake.type === 'image' ? snowflake.rotate : 0 // 旋转：图片雪花按配置旋转，圆点雪花不旋转
					}}
					transition={{
						duration: snowflake.duration,
						delay: snowflake.delay,
						repeat: Infinity,  // 无限循环
						ease: 'linear' // 动画曲线：线性（匀速运动）
					}}>
					{snowflake.type === 'dot' ? (
						<div className='h-full w-full rounded-full bg-white' />
					) : (
						<img src={SNOWFLAKE_IMAGES[snowflake.imageIndex!]} alt='' className='h-full w-full object-contain' draggable={false} />
					)}
				</motion.div>
			))}
		</motion.div>
	)
}
