import { db } from '@/lib/db/drizzle'
import { pteCategories, pteQuestionTypes } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'
import {
    Mic,
    PenTool,
    BookOpen,
    Headphones,
    Sparkles,
    ChevronRight,
    Clock,
    PlayCircle,
    CheckCircle2,
    Users,
    Gamepad2,
    Zap,
    Trophy
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { notFound } from 'next/navigation'

interface CategoryPageProps {
    params: {
        category: string
    }
}

const categoryConfig: Record<string, any> = {
    speaking: {
        icon: Mic,
        color: 'blue',
        gradient: 'from-blue-600 via-blue-700 to-indigo-800',
        lightBg: 'bg-blue-50/50 dark:bg-blue-500/5',
        shadow: 'shadow-blue-900/20',
        tagline: 'Oral Fluency & Pronunciation'
    },
    writing: {
        icon: PenTool,
        color: 'indigo',
        gradient: 'from-indigo-600 via-indigo-700 to-violet-800',
        lightBg: 'bg-indigo-50/50 dark:bg-indigo-500/5',
        shadow: 'shadow-indigo-900/20',
        tagline: 'Grammar & Structural Discourse'
    },
    reading: {
        icon: BookOpen,
        color: 'emerald',
        gradient: 'from-emerald-600 via-emerald-700 to-teal-800',
        lightBg: 'bg-emerald-50/50 dark:bg-emerald-500/5',
        shadow: 'shadow-emerald-900/20',
        tagline: 'Comprehension & Vocabulary'
    },
    listening: {
        icon: Headphones,
        color: 'orange',
        gradient: 'from-orange-600 via-orange-700 to-amber-800',
        lightBg: 'bg-orange-50/50 dark:bg-orange-500/5',
        shadow: 'shadow-orange-900/20',
        tagline: 'Auditory Analysis & Retention'
    }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { category } = params
    const config = categoryConfig[category]

    if (!config) {
        // Handle "listenig" typo redirect if necessary, or just notFound
        if (category === 'listenig') {
            // This is a server component, we can't redirect easily without extra logic
            // but we can just use the listening config
            return <CategoryPage params={{ category: 'listening' }} />
        }
        notFound()
    }

    // Fetch category and question types from DB
    const pteCategory = await db.query.pteCategories.findFirst({
        where: eq(pteCategories.code, category as any),
        with: {
            questionTypes: {
                where: eq(pteQuestionTypes.isActive, true),
                orderBy: (qt, { asc }) => [asc(qt.displayOrder)]
            }
        }
    })

    if (!pteCategory) {
        notFound()
    }

    const questionTypes = pteCategory.questionTypes
    const Icon = config.icon

    return (
        <div className="max-w-7xl mx-auto space-y-12 py-10 px-4 sm:px-6 lg:px-8">
            {/* Hero Section */}
            <div className={cn(
                "relative overflow-hidden rounded-[48px] p-8 md:p-16 text-white shadow-2xl",
                config.gradient,
                config.shadow
            )}>
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 blur-[120px] -mr-60 -mt-60 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 blur-[100px] -ml-40 -mb-40 pointer-events-none" />
                
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white font-black uppercase tracking-[0.2em] text-[10px]">
                            <Sparkles className="size-3.5" />
                            <span>Academic Training</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] capitalize">
                            Master <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">{pteCategory.name}</span>
                        </h1>
                        <p className="text-white/80 max-w-xl font-medium text-lg md:text-xl leading-relaxed mx-auto lg:mx-0">
                            {pteCategory.description || config.tagline}
                        </p>
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
                            <div className="flex items-center gap-2">
                                <Zap className="size-5 text-white/60" />
                                <span className="font-bold text-sm">{questionTypes.length} Modules</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Trophy className="size-5 text-white/60" />
                                <span className="font-bold text-sm">Official PTE Criteria</span>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:flex justify-center relative">
                        <div className="size-72 bg-white/5 backdrop-blur-2xl rounded-[64px] border border-white/10 flex items-center justify-center relative group">
                            <Icon className="size-32 text-white/90 drop-shadow-2xl" />
                            <div className={cn(
                                "absolute -top-4 -right-4 size-20 rounded-3xl shadow-xl flex items-center justify-center rotate-12 group-hover:rotate-0 transition-transform duration-500 bg-white",
                            )}>
                                <span className={cn("text-2xl font-black uppercase", `text-${config.color}-600`)}>PTE</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Types Grid Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Question Library</h2>
                    <p className="text-muted-foreground mt-1 font-medium italic">Select a question type to view the full library of practice materials.</p>
                </div>
                <div className={cn("h-1 w-24 rounded-full hidden md:block", `bg-${config.color}-600`)} />
            </div>

            {/* Types Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {questionTypes.map((type, index) => (
                    <Link 
                        key={type.id} 
                        href={`/practice/${category}/${type.code}`}
                        className="group"
                    >
                        <div className="h-full p-8 rounded-[48px] bg-white dark:bg-[#121214] border border-gray-100 dark:border-white/5 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 flex flex-col relative">
                            <div className="flex justify-between items-start mb-8">
                                <div className={cn(
                                    "size-16 rounded-3xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 border border-black/5 shadow-inner",
                                    `bg-${config.color}-500/5`
                                )}>
                                    <Icon className={cn("size-8", `text-${config.color}-600`)} />
                                </div>
                                <Badge variant="secondary" className="rounded-full px-3 py-0.5 font-black text-[9px] uppercase tracking-widest bg-muted text-muted-foreground border-none">
                                    {index + 1} of {questionTypes.length}
                                </Badge>
                            </div>

                            <div className="space-y-3 mb-10 flex-1">
                                <h3 className={cn(
                                    "text-2xl font-black text-gray-900 dark:text-white transition-colors tracking-tight",
                                    `group-hover:text-${config.color}-600`
                                )}>
                                    {type.name}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed line-clamp-3">
                                    {type.description || `Improve your ${category} score with official PTE-style ${type.name} practice items.`}
                                </p>
                            </div>

                            <div className="mt-auto flex items-center justify-between pt-6 border-t border-gray-50 dark:border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Time</span>
                                        <span className="text-sm font-black flex items-center gap-1.5 text-gray-900 dark:text-white">
                                            <Clock className={cn("size-3.5", `text-${config.color}-600`)} />
                                            {type.timeLimit ? `${type.timeLimit}s` : 'Varies'}
                                        </span>
                                    </div>
                                    <div className="w-px h-8 bg-border/50" />
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Accuracy</span>
                                        <span className={cn("text-sm font-black", `text-${config.color}-600`)}>
                                            Official AI
                                        </span>
                                    </div>
                                </div>
                                <div className={cn(
                                    "size-12 rounded-full text-white shadow-lg flex items-center justify-center group-hover:translate-x-1 transition-all duration-500",
                                    `bg-${config.color}-600 shadow-${config.color}-600/30`
                                )}>
                                    <ChevronRight className="size-6 stroke-[3]" />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
