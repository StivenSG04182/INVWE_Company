import { ArrowUpIcon, ArrowDownIcon } from "lucide-react"
import { pageContent } from "@/data/page-content"

interface ContentViewProps {
    path: string
}

export function ContentView({ path }: ContentViewProps) {
    const content = pageContent[path]

    if (!content) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold text-gray-900">Page Not Found</h1>
                <p className="mt-2 text-gray-600">The requested page does not exist.</p>
            </div>
        )
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-900">{content.title}</h1>
            <p className="mt-2 text-gray-600">{content.description}</p>

            {content.stats && (
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {content.stats.map((stat, index) => (
                        <div key={index} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                            <div className="mt-1 flex items-baseline">
                                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                                {stat.change !== undefined && (
                                    <span
                                        className={`ml-2 flex items-baseline text-sm font-semibold ${stat.change >= 0 ? "text-green-600" : "text-red-600"
                                            }`}
                                    >
                                        {stat.change >= 0 ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
                                        {Math.abs(stat.change)}%
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {content.content && (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {content.content.map((item, index) => (
                        <div key={index} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                            <h3 className="font-semibold text-gray-900">{item.title}</h3>
                            <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

