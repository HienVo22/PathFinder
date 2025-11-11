# Sprint 3
Ziad Abdelati – ZiadAbdelati – PathFinder

## What you planned to do
- Clean up dashboard stuff
- Make other pages more uniform (like nav bar)
- bug fixes

## What you did not do
- Everything planned was completed this sprint

## What problems you encountered
- not all of the pages are perfectly aligned, switching between tabs, the page title and some other stuff shift a few pixels. Oddly enough, 2 pages are the same, and the other 2 pages are the same. 
- After moving the navbar, some routes didn’t update until I fixed the layout hierarchy


## Issues you worked on
- [#52 bug fix: google login doesn't show when accessing login page from home page](https://github.com/HienVo22/PathFinder/issues/52)
- [#54 remove redundant components from dashboard](https://github.com/HienVo22/PathFinder/issues/54)
- [#55 persistant nav bar](https://github.com/HienVo22/PathFinder/issues/55)


## Files you worked on
- `app/login/page.js`
- `app/dashboard/page.js`
- `app/dashboard/settings/page.js`
- `components/DashboardNav.js`


## Use of AI and/or 3rd party software
- Used ChatGPT to help remove the current nav bar and "component-ize" it 

## What you accomplished
- Cleaned up the dashboard, removed duplicate/unused cards
- Created a reusable `NavBar` component and mounted it so it shows on all pages
- Added a Settings link to the navbar
- Fixed the Google login not appearing on first load by waiting for auth state to initialize before rendering the button
