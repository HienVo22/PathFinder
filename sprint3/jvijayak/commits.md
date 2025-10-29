3854aade (mcflubin 2025-10-28 21:30:30 -0400  1) "use client";
3854aade (mcflubin 2025-10-28 21:30:30 -0400  2) 
3854aade (mcflubin 2025-10-28 21:30:30 -0400  3) import { useState, useEffect } from "react";
3854aade (mcflubin 2025-10-28 21:30:30 -0400  4) 
3854aade (mcflubin 2025-10-28 21:30:30 -0400  5) const jobs = [
3854aade (mcflubin 2025-10-28 21:30:30 -0400  6)   { id: 1, company: "Google", role: "Software Engineer" },
3854aade (mcflubin 2025-10-28 21:30:30 -0400  7)   { id: 2, company: "Amazon", role: "Data Analyst" },
3854aade (mcflubin 2025-10-28 21:30:30 -0400  8)   { id: 3, company: "Facebook", role: "Product Manager" },
3854aade (mcflubin 2025-10-28 21:30:30 -0400  9)   { id: 4, company: "Microsoft", role: "Cloud Engineer" },
3854aade (mcflubin 2025-10-28 21:30:30 -0400 10) ];
3854aade (mcflubin 2025-10-28 21:30:30 -0400 11) 
3854aade (mcflubin 2025-10-28 21:30:30 -0400 12) export default function JobTrackerPage() {
3854aade (mcflubin 2025-10-28 21:30:30 -0400 13)   const [applications, setApplications] = useState({});
3854aade (mcflubin 2025-10-28 21:30:30 -0400 14)
3854aade (mcflubin 2025-10-28 21:30:30 -0400 15)   useEffect(() => {
3854aade (mcflubin 2025-10-28 21:30:30 -0400 16)     try {
3854aade (mcflubin 2025-10-28 21:30:30 -0400 17)       const saved = localStorage.getItem("applications");
3854aade (mcflubin 2025-10-28 21:30:30 -0400 18)       if (saved) setApplications(JSON.parse(saved));
3854aade (mcflubin 2025-10-28 21:30:30 -0400 19)     } catch {
3854aade (mcflubin 2025-10-28 21:30:30 -0400 20)       localStorage.removeItem("applications");
3854aade (mcflubin 2025-10-28 21:30:30 -0400 21)     }
3854aade (mcflubin 2025-10-28 21:30:30 -0400 22)   }, []);
:



3854aade (mcflubin                 2025-10-28 21:30:30 -0400  1) import express from 'express'
3854aade (mcflubin                 2025-10-28 21:30:30 -0400  2) import nodemailer from 'nodemailer'
3854aade (mcflubin                 2025-10-28 21:30:30 -0400  3) import crypto from 'crypto'
3854aade (mcflubin                 2025-10-28 21:30:30 -0400  4) import jwt from 'jsonwebtoken'
3854aade (mcflubin                 2025-10-28 21:30:30 -0400  6) const app = express()
3854aade (mcflubin                 2025-10-28 21:30:30 -0400  7) app.use(express.json())
3854aade (mcflubin                 2025-10-28 21:30:30 -0400  8) 
3854aade (mcflubin                 2025-10-28 21:30:30 -0400  9) const user2FACodes = {}
3854aade (mcflubin                 2025-10-28 21:30:30 -0400 12)   service: 'gmail',
3854aade (mcflubin                 2025-10-28 21:30:30 -0400 14)     user: process.env.EMAIL_USER,
3854aade (mcflubin                 2025-10-28 21:30:30 -0400 15)     pass: process.env.EMAIL_PASS
