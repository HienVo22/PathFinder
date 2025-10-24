## Sprint 2
# What you planned to do
- Parse through resumes uploaded
- Use Ai to pick skills from the resume and add them to database

# What you did not do
- I only got the ai to pick out skills and not weight them on how important they are for resumes

# What problems you encountered
- The first parsing api I imported, I just couldn't figure out how to get it done

# Issues you worked on
- #22 Tokenize Resume https://github.com/HienVo22/PathFinder/issues/22 
- #23 AI highlighting important words and phrases https://github.com/HienVo22/PathFinder/issues/23
- #34 Placing Skills in Database https://github.com/HienVo22/PathFinder/issues/34

# Files you worked on
components/ResumeParser.js
components/ResumeUpload.js
.env.local
lib/pdfParser.js
app/api/user/skills/route.js
app/api/ai/skill/route.js
app/api/upload/resume/route.js
next.config.js
package.json

# Use of AI and/or 3rd party software
I used Github Co-pilot to help with me the project.
After not being able to figure out the first AI parser I tried, Co-Pilot suggested to use pdf2json and pdfjs-dist
I also got some help applying google gemini from the parsed text to picking out the skills

# What you accomplished
As soon as the resume is updated, it goes through the process of getting the skills to the mongodb database. Firstly, it is parsed with pdf2json to tokenize the words. Following, google gemini sifts through the parsed text to pick out the skills it finds in the resume. After, the skills picked out are placed in the skills array on MongoDB.
