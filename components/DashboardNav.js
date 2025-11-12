"use client"

import React from "react"
import { useRouter } from "next/navigation"

export default function DashboardNav({ activeTab = "overview", onChange } ) {
	const router = useRouter()

	const handleClick = (tab) => {
		if (onChange) return onChange(tab)
		// Default behavior: navigate to dashboard and set tab via query
		router.push(`/dashboard?tab=${tab}`)
	}

	return (
		<div className="mb-8">
			<div className="border-b border-gray-200 dark:border-gray-700">
				<nav className="-mb-px flex items-center justify-between bg-white dark:bg-gray-900">
					<div className="flex space-x-8">
						<button
							onClick={() => handleClick('overview')}
							className={`py-2 px-1 border-b-2 font-medium text-sm ${
								activeTab === 'overview'
									? 'border-primary-500 text-primary-600 dark:text-primary-400'
									: 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
							}`}
						>
							Overview
						</button>

						<button
							onClick={() => handleClick('jobs')}
							className={`py-2 px-1 border-b-2 font-medium text-sm ${
								activeTab === 'jobs'
									? 'border-primary-500 text-primary-600 dark:text-primary-400'
									: 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
							}`}
						>
							Job Matches
						</button>

						<button
							onClick={() => handleClick('preferences')}
							className={`py-2 px-1 border-b-2 font-medium text-sm ${
								activeTab === 'preferences'
									? 'border-primary-500 text-primary-600 dark:text-primary-400'
									: 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
							}`}
						>
							Preferences
						</button>
					</div>

					{/* Settings gear icon */}
					<div>
						<button
							onClick={() => router.push('/dashboard/settings')}
							aria-label="Settings"
							title="Settings"
							className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
						>
												{/* Inline settings cog icon to avoid MUI dependency */}
												<svg
												  xmlns="http://www.w3.org/2000/svg"
												  viewBox="0 0 20 20"
												  fill="currentColor"
												  className="h-5 w-5 text-gray-600 dark:text-gray-300"
												  aria-hidden="true"
												>
												  <path d="M11.983 1.574a1 1 0 00-1.966 0l-.116.697a7.967 7.967 0 00-1.356.564l-.63-.364a1 1 0 00-1.366.366l-.983 1.703a1 1 0 00.366 1.366l.63.364a8.07 8.07 0 000 1.128l-.63.364a1 1 0 00-.366 1.366l.983 1.703a1 1 0 001.366.366l.63-.364c.43.25.882.45 1.356.564l.116.697a1 1 0 001.966 0l.116-.697a7.967 7.967 0 001.356-.564l.63.364a1 1 0 001.366-.366l.983-1.703a1 1 0 00-.366-1.366l-.63-.364a8.07 8.07 0 000-1.128l.63-.364a1 1 0 00.366-1.366l-.983-1.703a1 1 0 00-1.366-.366l-.63.364a7.967 7.967 0 00-1.356-.564l-.116-.697zM10 12.25a2.25 2.25 0 110-4.5 2.25 2.25 0 010 4.5z" />
												</svg>
						</button>
					</div>
				</nav>
			</div>
		</div>
	)
}

