import { VoteButtons } from './VoteButtons'


type Policy = {
id: string
title: string
body: string
merits: string[]
mediaUrl?: string
up: number
down: number
ratio: number
}


export function PolicyCard({ p }: { p: Policy }) {
return (
<div className="h-[calc(100svh-64px)] w-full snap-start relative flex items-center justify-center bg-black text-white">
{p.mediaUrl ? (
// ここで動画/画像を条件表示（省略）
<img src={p.mediaUrl} alt={p.title} className="object-contain max-h-full" />
) : (
<div className="p-6 text-center">
<h2 className="text-2xl font-bold mb-4">{p.title}</h2>
<p className="opacity-80 line-clamp-5">{p.body}</p>
</div>
)}


{/* 右サイド操作列 */}
<div className="absolute right-3 bottom-24 flex flex-col gap-4">
<VoteButtons policyId={p.id} up={p.up} down={p.down} />
</div>


{/* 下部メタ */}
<div className="absolute bottom-4 left-4 right-4">
<h3 className="text-xl font-semibold">{p.title}</h3>
<div className="text-sm opacity-80">賛成率 {p.ratio}%・賛成 {p.up} / 反対 {p.down}</div>
<ul className="mt-2 flex gap-2 text-sm opacity-90">
{p.merits.slice(0,3).map((m, i) => (
<li key={i} className="px-2 py-1 rounded-full bg-white/10">{m}</li>
))}
</ul>
</div>
</div>
)
}