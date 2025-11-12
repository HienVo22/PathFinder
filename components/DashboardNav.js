"use client"

import React from "react"
import { useRouter, usePathname } from "next/navigation"
import SettingsIcon from '@mui/icons-material/Settings'

export default function DashboardNav({ activeTab = "overview", onChange } ) {
	const router = useRouter()

	const pathname = usePathname()

	const handleClick = (tab) => {
		// First, call any onChange handler to update UI state immediately
		if (onChange) {
			try {
				onChange(tab)
			} catch (err) {
				console.error('DashboardNav onChange error:', err)
			}
		}

		// Always update the URL so the dashboard route reflects the selected tab.
		// This ensures navigation from other pages (like /settings) works and that
		// the tab stays in sync with the URL.
		// If we're already on /dashboard this will just update the query param.
		try {
			if (pathname !== `/dashboard` || true) {
				router.push(`/dashboard?tab=${tab}`)
			}
		} catch (err) {
			console.error('DashboardNav router.push error:', err)
		}
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
							onClick={() => router.push('/settings')}
							aria-label="Settings"
							title="Settings"
							className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
						>
															<SettingsIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
						</button>
					</div>
				</nav>
			</div>
		</div>
	)
}

